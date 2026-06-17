from flask import Flask, request, jsonify
from flask_cors import CORS
import os, re, string, joblib, random
import numpy as np
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import word_tokenize
from nltk.sentiment import SentimentIntensityAnalyzer
from collections import Counter
from datetime import datetime
import json

from config.settings import config
from routes import news_bp, chat_bp

def create_app() -> Flask:
    app = Flask(__name__)

    # CORS
    CORS(app, resources={r"/api/*": {"origins": config.CORS_ORIGINS}})

    # Register blueprints
    app.register_blueprint(news_bp)
    app.register_blueprint(chat_bp)

    # Root route
    @app.route('/')
    def root():
        return jsonify({
            "name":    config.APP_NAME,
            "version": config.VERSION,
            "status":  "running",
            "docs":    "GET /api/health for status",
            "endpoints": [
                "POST /api/predict",
                "GET  /api/dashboard",
                "GET  /api/history?user_id=xxx",
                "GET  /api/live-news",
                "GET  /api/health",
                "POST /api/chat",
            ]
        })

    # Global error handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Endpoint not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error"}), 500

    return app


# Entry point
if __name__ == '__main__':
    app = create_app()

    print("\n" + "=" * 55)
    print(f"  {config.APP_NAME} v{config.VERSION}")
    print("=" * 55)
    print(f"  URL:     http://localhost:{config.PORT}")
    print(f"  Debug:   {config.DEBUG}")
    print("=" * 55 + "\n")

    app.run(
        debug=config.DEBUG,
        port=config.PORT,
        host=config.HOST,
    )


# Download NLTK data
nltk.download('stopwords',       quiet=True)
nltk.download('punkt',           quiet=True)
nltk.download('punkt_tab',       quiet=True)
nltk.download('wordnet',         quiet=True)
nltk.download('vader_lexicon',   quiet=True)
nltk.download('averaged_perceptron_tagger', quiet=True)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ── NLP Setup ─────────────────────────────────────────────────
lemmatizer = WordNetLemmatizer()
stop_words  = set(stopwords.words('english'))
sia         = SentimentIntensityAnalyzer()

# ── Load ML Model ─────────────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'best_model.pkl')
model = None

def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        try:
            model = joblib.load(MODEL_PATH)
            print("✅ Model loaded!")
            return True
        except Exception as e:
            print(f"❌ Model load error: {e}")
    else:
        print("⚠️  Model not found - running in DEMO mode")
    return False

load_model()

# ── In-memory Storage ─────────────────────────────────────────
session_stats = {
    "total_analyzed": 0,
    "fake_detected":  0,
    "real_detected":  0,
    "biased_detected": 0,
}
analysis_history = []   # list of dicts per user_id

# ── Suspicious / Bias Words ───────────────────────────────────
SUSPICIOUS_WORDS = [
    "shocking", "unbelievable", "secret", "exposed", "conspiracy",
    "hoax", "fraud", "fake", "lie", "truth", "hidden", "cover",
    "breaking", "urgent", "alert", "warning", "danger", "crisis",
    "scandal", "corrupt", "illegal", "banned", "censored", "deleted",
    "whistleblower", "leaked", "classified", "deep state", "agenda",
    "mainstream media", "wake up", "share before", "they don't want",
    "100%", "miracle", "cure", "guaranteed", "amazing", "incredible",
]

LEFT_BIAS_WORDS = [
    "progressive", "socialist", "liberal", "equality", "diversity",
    "climate change", "gun control", "universal healthcare",
    "systemic racism", "social justice", "defund", "woke",
    "marginalized", "privilege", "oppression", "activist",
]

RIGHT_BIAS_WORDS = [
    "conservative", "traditional", "patriot", "freedom", "liberty",
    "second amendment", "border security", "illegal immigration",
    "fake news media", "deep state", "radical left", "socialist agenda",
    "law and order", "make america", "maga", "drain the swamp",
    "globalist", "antifa", "election fraud",
]

# ── Source Credibility Database ───────────────────────────────
SOURCE_CREDIBILITY = {
    # High credibility
    "reuters":    {"score": 95, "level": "High",   "color": "#10b981"},
    "bbc":        {"score": 92, "level": "High",   "color": "#10b981"},
    "apnews":     {"score": 94, "level": "High",   "color": "#10b981"},
    "npr":        {"score": 91, "level": "High",   "color": "#10b981"},
    "nytimes":    {"score": 88, "level": "High",   "color": "#10b981"},
    "theguardian":{"score": 87, "level": "High",   "color": "#10b981"},
    "wsj":        {"score": 89, "level": "High",   "color": "#10b981"},
    "thehindu":   {"score": 85, "level": "High",   "color": "#10b981"},
    "ndtv":       {"score": 78, "level": "High",   "color": "#10b981"},
    "timesofindia":{"score": 75,"level": "Medium", "color": "#f59e0b"},
    # Medium credibility
    "huffpost":   {"score": 65, "level": "Medium", "color": "#f59e0b"},
    "buzzfeed":   {"score": 60, "level": "Medium", "color": "#f59e0b"},
    "vox":        {"score": 68, "level": "Medium", "color": "#f59e0b"},
    "vice":       {"score": 62, "level": "Medium", "color": "#f59e0b"},
    "dailymail":  {"score": 45, "level": "Low",    "color": "#ef4444"},
    # Low credibility
    "infowars":   {"score": 5,  "level": "Low",    "color": "#ef4444"},
    "naturalnews":{"score": 8,  "level": "Low",    "color": "#ef4444"},
    "breitbart":  {"score": 25, "level": "Low",    "color": "#ef4444"},
    "beforeitsnews":{"score":3, "level": "Low",    "color": "#ef4444"},
}

# ── Text Cleaner ──────────────────────────────────────────────
def clean_text(text):
    if not text or not text.strip():
        return ''
    t = str(text).lower()
    t = re.sub(r'http\S+|www\S+|https\S+', '', t)
    t = re.sub(r'<.*?>', '', t)
    t = re.sub(r'\S+@\S+', '', t)
    t = t.translate(str.maketrans('', '', string.punctuation))
    t = re.sub(r'\d+', '', t)
    t = re.sub(r'\s+', ' ', t).strip()
    try:
        tokens = word_tokenize(t)
    except Exception:
        tokens = t.split()
    tokens = [
        lemmatizer.lemmatize(tok)
        for tok in tokens
        if tok not in stop_words and len(tok) > 2
    ]
    return ' '.join(tokens)

# ── Sentiment Analysis ────────────────────────────────────────
def analyze_sentiment(text):
    scores = sia.polarity_scores(text)
    compound = scores['compound']
    if compound >= 0.05:
        sentiment = "Positive"
        emoji     = "😊"
        color     = "#10b981"
    elif compound <= -0.05:
        sentiment = "Negative"
        emoji     = "😠"
        color     = "#ef4444"
    else:
        sentiment = "Neutral"
        emoji     = "😐"
        color     = "#94a3b8"
    return {
        "sentiment":  sentiment,
        "emoji":      emoji,
        "color":      color,
        "compound":   round(compound, 3),
        "positive":   round(scores['pos'] * 100, 1),
        "negative":   round(scores['neg'] * 100, 1),
        "neutral":    round(scores['neu'] * 100, 1),
    }

# ── Bias Detection ────────────────────────────────────────────
def detect_bias(text):
    text_lower = text.lower()
    left_count  = sum(1 for w in LEFT_BIAS_WORDS  if w in text_lower)
    right_count = sum(1 for w in RIGHT_BIAS_WORDS if w in text_lower)
    total = left_count + right_count

    if total == 0:
        bias = "Neutral"
        emoji = "⚖️"
        color = "#94a3b8"
        score = 50
    elif left_count > right_count * 1.5:
        bias  = "Left-Leaning"
        emoji = "🔵"
        color = "#3b82f6"
        score = max(0, 50 - (left_count * 8))
    elif right_count > left_count * 1.5:
        bias  = "Right-Leaning"
        emoji = "🔴"
        color = "#ef4444"
        score = max(0, 50 - (right_count * 8))
    else:
        bias  = "Mixed/Balanced"
        emoji = "🟡"
        color = "#f59e0b"
        score = 50

    # Found bias words
    found_left  = [w for w in LEFT_BIAS_WORDS  if w in text_lower]
    found_right = [w for w in RIGHT_BIAS_WORDS if w in text_lower]

    return {
        "bias":         bias,
        "emoji":        emoji,
        "color":        color,
        "neutrality_score": score,
        "left_count":   left_count,
        "right_count":  right_count,
        "found_left":   found_left[:5],
        "found_right":  found_right[:5],
    }

# ── Keyword Highlighting ──────────────────────────────────────
def find_suspicious_keywords(text):
    text_lower = text.lower()
    found = []
    for word in SUSPICIOUS_WORDS:
        if word in text_lower:
            # Find position
            idx = text_lower.find(word)
            found.append({
                "word":    word,
                "index":   idx,
                "context": text[max(0,idx-30):idx+len(word)+30],
            })
    return found[:15]  # return top 15

# ── Article Summarizer ────────────────────────────────────────
def summarize_text(text, sentences=3):
    """
    Extractive summarization using sentence scoring.
    No external library needed.
    """
    # Split into sentences
    sent_list = re.split(r'(?<=[.!?])\s+', text.strip())
    sent_list = [s.strip() for s in sent_list if len(s.split()) > 5]

    if len(sent_list) <= sentences:
        return ' '.join(sent_list)

    # Score sentences by word frequency
    words = clean_text(text).split()
    freq  = Counter(words)
    max_freq = max(freq.values()) if freq else 1

    def score_sentence(s):
        words_in = clean_text(s).split()
        return sum(freq.get(w, 0) / max_freq for w in words_in)

    scored = sorted(
        enumerate(sent_list),
        key=lambda x: score_sentence(x[1]),
        reverse=True
    )
    top_indices = sorted([i for i, _ in scored[:sentences]])
    summary = ' '.join(sent_list[i] for i in top_indices)
    return summary if summary else sent_list[0]

# ── Source Credibility Checker ────────────────────────────────
def check_source_credibility(text, source_url=""):
    """Check if any known source is mentioned in text or URL."""
    combined = (text + " " + source_url).lower()
    for domain, info in SOURCE_CREDIBILITY.items():
        if domain in combined:
            return {"source": domain, **info, "found": True}
    return {
        "source":  "Unknown",
        "score":   50,
        "level":   "Unknown",
        "color":   "#64748b",
        "found":   False,
        "note":    "Source not found in our database. Verify manually.",
    }

# ── Word Frequencies ──────────────────────────────────────────
def get_word_frequencies(text, top_n=30):
    cleaned = clean_text(text)
    words   = cleaned.split()
    if not words:
        return []
    counter = Counter(words)
    return [{"word": w, "count": c} for w, c in counter.most_common(top_n)]

# ── Text Stats ────────────────────────────────────────────────
def get_text_stats(text):
    sentences = [s for s in re.split(r'[.!?]+', text) if s.strip()]
    words     = text.split()
    # Readability estimate (simplified Flesch)
    avg_words_per_sentence = len(words) / max(len(sentences), 1)
    avg_chars_per_word     = sum(len(w) for w in words) / max(len(words), 1)
    return {
        "word_count":     len(words),
        "char_count":     len(text),
        "sentence_count": len(sentences),
        "avg_word_len":   round(avg_chars_per_word, 1),
        "reading_time":   max(1, round(len(words) / 200)),  # mins at 200wpm
    }

# ══════════════════════════════════════════════════════════════
#                         API ROUTES
# ══════════════════════════════════════════════════════════════

@app.route('/')
def home():
    return jsonify({
        "name":         "TruthLens API",
        "version":      "2.0.0",
        "model_loaded": model is not None,
        "features": [
            "Fake News Detection",
            "Sentiment Analysis",
            "Bias Detection",
            "Keyword Highlighting",
            "Article Summarizer",
            "Source Credibility",
            "Word Cloud",
            "History Tracking",
        ]
    })


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status":       "healthy",
        "model_loaded": model is not None,
        "demo_mode":    model is None,
        "message":      "TruthLens API v2.0 running!",
    })


# ── MAIN ANALYSIS ENDPOINT ────────────────────────────────────
@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    text       = data.get('text', '').strip()
    source_url = data.get('source_url', '')
    user_id    = data.get('user_id', 'anonymous')

    if not text:
        return jsonify({"error": "No text provided"}), 400
    if len(text) < 20:
        return jsonify({"error": "Text too short (min 20 chars)"}), 400

    try:
        # ── 1. Fake/Real Prediction ───────────────────
        if model is None:
            # Demo mode
            random.seed(len(text))
            fake_prob = round(random.uniform(20, 80), 2)
            real_prob = round(100 - fake_prob, 2)
            pred      = "FAKE" if fake_prob > 50 else "REAL"
            confidence = max(fake_prob, real_prob)
            demo_mode  = True
        else:
            cleaned    = clean_text(text)
            prediction = model.predict([cleaned])[0]
            probs      = model.predict_proba([cleaned])[0]
            fake_prob  = round(float(probs[0]) * 100, 2)
            real_prob  = round(float(probs[1]) * 100, 2)
            confidence = round(float(max(probs)) * 100, 2)
            pred       = "REAL" if prediction == 1 else "FAKE"
            demo_mode  = False

        # ── 2. Sentiment Analysis ─────────────────────
        sentiment = analyze_sentiment(text)

        # ── 3. Bias Detection ─────────────────────────
        bias = detect_bias(text)

        # ── 4. Keyword Highlighting ───────────────────
        suspicious_keywords = find_suspicious_keywords(text)

        # ── 5. Article Summary ────────────────────────
        summary = summarize_text(text, sentences=3)

        # ── 6. Source Credibility ─────────────────────
        credibility = check_source_credibility(text, source_url)

        # ── 7. Word Frequencies ───────────────────────
        word_freq = get_word_frequencies(text)

        # ── 8. Text Statistics ────────────────────────
        text_stats = get_text_stats(text)

        # ── 9. Credibility Score (composite) ─────────
        # Combine ML confidence + suspicious words + sentiment
        suspicious_penalty = min(len(suspicious_keywords) * 3, 30)
        base_score = real_prob - suspicious_penalty
        credibility_score = max(0, min(100, round(base_score, 1)))

        # Build full result
        result = {
            # Core prediction
            "prediction":        pred,
            "confidence":        confidence,
            "fake_probability":  fake_prob,
            "real_probability":  real_prob,
            "demo_mode":         demo_mode,

            # Sentiment
            "sentiment":         sentiment,

            # Bias
            "bias":              bias,

            # Keywords
            "suspicious_keywords": suspicious_keywords,
            "suspicious_count":  len(suspicious_keywords),

            # Summary
            "summary":           summary,

            # Source
            "source_credibility": credibility,

            # Credibility score
            "credibility_score": credibility_score,

            # Visualizations
            "word_frequencies":  word_freq,

            # Stats
            "text_stats":        text_stats,

            # Timestamp
            "analyzed_at":       datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        }

        # ── Update session stats ──────────────────────
        session_stats["total_analyzed"] += 1
        if pred == "FAKE":
            session_stats["fake_detected"] += 1
        else:
            session_stats["real_detected"] += 1
        if bias["bias"] not in ["Neutral", "Mixed/Balanced"]:
            session_stats["biased_detected"] += 1

        # ── Save to history ───────────────────────────
        history_entry = {
            "id":          len(analysis_history) + 1,
            "user_id":     user_id,
            "text_snippet": text[:120] + "..." if len(text) > 120 else text,
            "prediction":  pred,
            "confidence":  confidence,
            "sentiment":   sentiment["sentiment"],
            "bias":        bias["bias"],
            "analyzed_at": result["analyzed_at"],
        }
        analysis_history.append(history_entry)
        if len(analysis_history) > 200:
            analysis_history.pop(0)

        return jsonify(result)

    except Exception as e:
        print(f"Prediction error: {e}")
        import traceback; traceback.print_exc()
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500


# ── DASHBOARD ENDPOINT ────────────────────────────────────────
@app.route('/api/dashboard', methods=['GET'])
def dashboard():
    total   = session_stats["total_analyzed"]
    fake    = session_stats["fake_detected"]
    real    = session_stats["real_detected"]
    biased  = session_stats["biased_detected"]

    # Sentiment distribution from history
    sentiments = [h["sentiment"] for h in analysis_history]
    sent_dist  = {
        "Positive": sentiments.count("Positive"),
        "Negative": sentiments.count("Negative"),
        "Neutral":  sentiments.count("Neutral"),
    }

    # Bias distribution
    biases    = [h["bias"] for h in analysis_history]
    bias_dist = {
        "Neutral":       biases.count("Neutral"),
        "Left-Leaning":  biases.count("Left-Leaning"),
        "Right-Leaning": biases.count("Right-Leaning"),
        "Mixed/Balanced":biases.count("Mixed/Balanced"),
    }

    return jsonify({
        "total_analyzed":  total,
        "fake_detected":   fake,
        "real_detected":   real,
        "biased_detected": biased,
        "accuracy":        98.5,
        "model_loaded":    model is not None,
        "fake_percentage": round(fake / total * 100, 1) if total > 0 else 0,
        "real_percentage": round(real / total * 100, 1) if total > 0 else 0,
        "sentiment_distribution": sent_dist,
        "bias_distribution":      bias_dist,
        "recent_analyses": list(reversed(analysis_history[-15:])),
        "dataset_info": {
            "total_articles": 44898,
            "fake_articles":  23481,
            "real_articles":  21417,
            "source":         "Kaggle CC0 - Clément Bisaillon",
        },
    })


# ── HISTORY ENDPOINT ──────────────────────────────────────────
@app.route('/api/history', methods=['GET'])
def history():
    user_id = request.args.get('user_id', 'anonymous')
    # Filter by user
    user_history = [
        h for h in analysis_history
        if h.get('user_id') == user_id
    ]
    return jsonify({
        "history": list(reversed(user_history[-50:])),
        "total":   len(user_history),
    })


# ── LIVE NEWS ENDPOINT ────────────────────────────────────────
@app.route('/api/live-news', methods=['GET'])
def live_news():
    """
    Returns mock live news for demo.
    Replace with real NewsAPI: https://newsapi.org/
    """
    mock_news = [
        {
            "id": 1,
            "title": "Scientists Develop New Clean Energy Solution",
            "source": "Reuters",
            "category": "Science",
            "time": "2 hours ago",
            "credibility": "High",
            "credibility_color": "#10b981",
            "url": "#",
            "snippet": "Researchers at MIT have developed a breakthrough in solar panel efficiency...",
        },
        {
            "id": 2,
            "title": "Global Markets Show Signs of Recovery",
            "source": "BBC",
            "category": "Business",
            "time": "3 hours ago",
            "credibility": "High",
            "credibility_color": "#10b981",
            "url": "#",
            "snippet": "Stock markets across Asia and Europe showed positive gains today...",
        },
        {
            "id": 3,
            "title": "SHOCKING: Government Hiding Truth About...",
            "source": "Unknown Blog",
            "category": "Politics",
            "time": "1 hour ago",
            "credibility": "Low",
            "credibility_color": "#ef4444",
            "url": "#",
            "snippet": "A whistleblower has revealed shocking secrets that mainstream media won't tell you...",
        },
        {
            "id": 4,
            "title": "New Study Shows Benefits of Mediterranean Diet",
            "source": "NPR",
            "category": "Health",
            "time": "5 hours ago",
            "credibility": "High",
            "credibility_color": "#10b981",
            "url": "#",
            "snippet": "A peer-reviewed study published in the New England Journal of Medicine found...",
        },
        {
            "id": 5,
            "title": "Tech Giants Face New Regulatory Challenges",
            "source": "WSJ",
            "category": "Technology",
            "time": "4 hours ago",
            "credibility": "High",
            "credibility_color": "#10b981",
            "url": "#",
            "snippet": "Major technology companies are facing increased scrutiny from regulators...",
        },
        {
            "id": 6,
            "title": "Secret Cure for All Diseases EXPOSED!",
            "source": "NaturalNews",
            "category": "Health",
            "time": "30 mins ago",
            "credibility": "Low",
            "credibility_color": "#ef4444",
            "url": "#",
            "snippet": "Deep state pharmaceutical companies have been hiding this miracle cure...",
        },
    ]
    return jsonify({"news": mock_news, "source": "Demo - Integrate NewsAPI for real data"})


# ── CHATBOT ENDPOINT ──────────────────────────────────────────
@app.route('/api/chat', methods=['POST'])
def chat():
    data    = request.get_json()
    message = data.get('message', '').lower().strip()

    responses = {
        ('hello', 'hi', 'hey'):
            "Hello! 👋 I'm TruthBot v2! I can help you understand:\n• Why an article is fake/real\n• What bias means\n• How sentiment analysis works\n• How to use TruthLens\n\nWhat would you like to know?",
        ('fake', 'how fake', 'why fake', 'detect'):
            "🔍 TruthLens detects fake news using:\n1. ML Model (98.5% accurate)\n2. Suspicious keyword detection\n3. Language pattern analysis\n4. Sentence structure analysis\n5. TF-IDF feature comparison\n\nThe model was trained on 44,898 real articles!",
        ('sentiment', 'positive', 'negative', 'neutral', 'emotion'):
            "😊 Sentiment Analysis measures the emotional tone:\n\n🟢 Positive: Hopeful, constructive language\n🔴 Negative: Fear, anger, alarming words\n⚪ Neutral: Balanced, factual reporting\n\nFake news often uses highly negative or sensationalist language!",
        ('bias', 'political', 'left', 'right', 'leaning'):
            "⚖️ Bias Detection looks for:\n\n🔵 Left-leaning: Progressive, equality, social justice language\n🔴 Right-leaning: Conservative, patriot, border security language\n⚖️ Neutral: Balanced reporting without political lean\n\nGood journalism tries to be neutral!",
        ('credibility', 'source', 'trust', 'reliable'):
            "🏆 Source Credibility rates news sources:\n\n🟢 High (80-100): Reuters, BBC, AP, NPR\n🟡 Medium (50-79): HuffPost, BuzzFeed, Vox\n🔴 Low (0-49): InfoWars, NaturalNews\n\nAlways check where news comes from!",
        ('keyword', 'suspicious', 'word', 'highlight'):
            "🚨 Suspicious keywords are red flags in fake news:\n\n• SHOCKING, EXPOSED, SECRET\n• Conspiracy-related terms\n• Emotional manipulation words\n• 'Share before deleted'\n• 'They don't want you to know'\n\nReal news uses formal, neutral language.",
        ('summary', 'summarize', 'short', 'brief'):
            "📋 The Article Summarizer:\n• Extracts the 3 most important sentences\n• Uses word frequency scoring\n• Helps you quickly understand content\n• No need to read the full article!\n\nThis is called Extractive Summarization.",
        ('sentiment analysis', 'how sentiment'):
            "Sentiment is analyzed using NLTK VADER:\n• Specifically designed for social media & news\n• Gives scores: Positive, Negative, Neutral\n• Compound score from -1 (most negative) to +1 (most positive)\n• Values > 0.05 = Positive, < -0.05 = Negative",
        ('accuracy', 'how accurate', 'percentage'):
            "🎯 TruthLens Accuracy:\n• Overall: 98.5% on 8,980 test articles\n• AUC Score: 0.998 (near perfect)\n• Precision: 98.2%\n• Recall: 98.7%\n• F1 Score: 98.4%",
        ('how to use', 'tutorial', 'use'):
            "🚀 How to use TruthLens:\n1. Go to Analyzer page\n2. Paste any news article\n3. Optionally add source URL\n4. Click Analyze\n5. See: Fake/Real + Sentiment + Bias + Keywords + Summary!\n\nAll in one click!",
        ('history', 'previous', 'past'):
            "📚 Your analysis history is saved automatically!\n\nGo to Dashboard → Recent Analyses to see:\n• All your previous articles\n• Predictions & confidence\n• Sentiment & bias results\n• Date & time of analysis",
        ('dataset', 'data', 'train'):
            "📊 Training Dataset:\n• Source: Kaggle (CC0 License - Free!)\n• Author: Clément Bisaillon\n• Size: 44,898 articles\n• Fake: 23,481 articles\n• Real: 21,417 articles\n• Period: 2016-2017",
        ('help',):
            "🤖 TruthBot can answer:\n• 'How does fake detection work?'\n• 'What is sentiment analysis?'\n• 'What is bias detection?'\n• 'How accurate is TruthLens?'\n• 'What are suspicious keywords?'\n• 'How to use TruthLens?'\n\nJust ask!",
        ('thank', 'thanks'):
            "You're welcome! 😊 Stay informed and always verify news! 🔍",
    }

    reply = None
    for keywords, response in responses.items():
        if any(kw in message for kw in keywords):
            reply = response
            break

    if not reply:
        reply = "I'm not sure about that. Try asking:\n• 'How does fake detection work?'\n• 'What is sentiment analysis?'\n• 'What is bias?'\n• 'How accurate is TruthLens?'"

    return jsonify({"reply": reply})


# ── Run ───────────────────────────────────────────────────────
if __name__ == '__main__':
    print("\n" + "="*55)
    print("  TruthLens API v2.0 - All Features")
    print("="*55)
    print(f"  Model:    {'✅ Loaded' if model else '⚠️  Demo Mode'}")
    print(f"  Features: Detection + Sentiment + Bias + Summary")
    print(f"  URL:      http://localhost:5000")
    print("="*55 + "\n")
    app.run(debug=True, port=5000, host='0.0.0.0')