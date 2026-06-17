# backend/routes/news_routes.py
"""
All news-related API endpoints.
"""
from flask import Blueprint, request, jsonify
from datetime import datetime
from services import (
    ml_service,
    sentiment_service,
    bias_service,
    credibility_service,
    summarizer_service,
)
from utils.text_cleaner import (
    get_word_frequencies,
    get_text_stats,
)
from config.settings import config

news_bp = Blueprint('news', __name__, url_prefix='/api')

# ── Shared in-memory storage ──────────────────────────────────
_stats = {
    "total_analyzed":  0,
    "fake_detected":   0,
    "real_detected":   0,
    "biased_detected": 0,
}
_history = []


# ── POST /api/predict ─────────────────────────────────────────
@news_bp.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data"}), 400

    text       = data.get('text', '').strip()
    source_url = data.get('source_url', '')
    user_id    = data.get('user_id', 'anonymous')

    # Validation
    if not text:
        return jsonify({"error": "No text provided"}), 400
    if len(text) < config.MIN_TEXT_LENGTH:
        return jsonify({"error": f"Text too short (min {config.MIN_TEXT_LENGTH} chars)"}), 400
    if len(text) > config.MAX_TEXT_LENGTH:
        return jsonify({"error": "Text too long"}), 400

    try:
        # ── Run all services ──────────────────────────
        ml_result    = ml_service.predict(text)
        sentiment    = sentiment_service.analyze(text)
        bias         = bias_service.detect(text)
        source_cred  = credibility_service.check_source(text, source_url)
        suspicious   = credibility_service.find_suspicious(text)
        summary      = summarizer_service.summarize(text, config.SUMMARY_SENTENCES)
        key_points   = summarizer_service.key_points(text)
        word_freq    = get_word_frequencies(text)
        text_stats   = get_text_stats(text)
        cred_score   = credibility_service.composite_score(
            ml_result.get('real_probability', 50),
            len(suspicious),
            source_cred.get('score', 50),
        )

        # ── Build response ────────────────────────────
        result = {
            **ml_result,
            "sentiment":           sentiment,
            "bias":                bias,
            "source_credibility":  source_cred,
            "suspicious_keywords": suspicious,
            "suspicious_count":    len(suspicious),
            "summary":             summary,
            "key_points":          key_points,
            "credibility_score":   cred_score,
            "word_frequencies":    word_freq,
            "text_stats":          text_stats,
            "analyzed_at":         datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        }

        # ── Update stats ──────────────────────────────
        _stats["total_analyzed"] += 1
        if ml_result.get("prediction") == "FAKE":
            _stats["fake_detected"] += 1
        else:
            _stats["real_detected"] += 1
        if bias.get("bias") not in ["Neutral", "Mixed/Balanced"]:
            _stats["biased_detected"] += 1

        # ── Save history ──────────────────────────────
        _history.append({
            "id":           len(_history) + 1,
            "user_id":      user_id,
            "text_snippet": text[:120] + "..." if len(text) > 120 else text,
            "prediction":   ml_result.get("prediction"),
            "confidence":   ml_result.get("confidence"),
            "sentiment":    sentiment.get("sentiment"),
            "bias":         bias.get("bias"),
            "analyzed_at":  result["analyzed_at"],
        })
        if len(_history) > config.HISTORY_LIMIT:
            _history.pop(0)

        return jsonify(result)

    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500


# ── GET /api/dashboard ────────────────────────────────────────
@news_bp.route('/dashboard', methods=['GET'])
def dashboard():
    total  = _stats["total_analyzed"]
    fake   = _stats["fake_detected"]
    real   = _stats["real_detected"]

    sentiments = [h["sentiment"] for h in _history if h.get("sentiment")]
    biases     = [h["bias"]      for h in _history if h.get("bias")]

    return jsonify({
        **_stats,
        "accuracy":       98.5,
        "model_loaded":   ml_service.is_loaded,
        "fake_percentage": round(fake / total * 100, 1) if total else 0,
        "real_percentage": round(real / total * 100, 1) if total else 0,
        "sentiment_distribution": {
            "Positive": sentiments.count("Positive"),
            "Negative": sentiments.count("Negative"),
            "Neutral":  sentiments.count("Neutral"),
        },
        "bias_distribution": {
            "Neutral":        biases.count("Neutral"),
            "Left-Leaning":   biases.count("Left-Leaning"),
            "Right-Leaning":  biases.count("Right-Leaning"),
            "Mixed/Balanced": biases.count("Mixed/Balanced"),
        },
        "recent_analyses": list(reversed(_history[-15:])),
        "dataset_info": {
            "total_articles": 44898,
            "fake_articles":  23481,
            "real_articles":  21417,
            "license":        "CC0 Public Domain",
            "source":         "Kaggle — Clément Bisaillon",
        },
    })


# ── GET /api/history ──────────────────────────────────────────
@news_bp.route('/history', methods=['GET'])
def history():
    user_id = request.args.get('user_id', 'anonymous')
    user_h  = [h for h in _history if h.get('user_id') == user_id]
    return jsonify({
        "history": list(reversed(user_h[-50:])),
        "total":   len(user_h),
    })


# ── GET /api/health ───────────────────────────────────────────
@news_bp.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status":       "healthy",
        "app":          config.APP_NAME,
        "version":      config.VERSION,
        "model_loaded": ml_service.is_loaded,
        "demo_mode":    not ml_service.is_loaded,
        "services": {
            "ml":          ml_service.is_loaded,
            "sentiment":   True,
            "bias":        True,
            "credibility": True,
            "summarizer":  True,
        },
    })


# ── GET /api/live-news ────────────────────────────────────────
@news_bp.route('/live-news', methods=['GET'])
def live_news():
    mock = [
        {"id":1,"title":"Scientists Develop New Clean Energy","source":"Reuters","category":"Science","time":"2h ago","credibility":"High","credibility_color":"#10b981","snippet":"Researchers at MIT developed a breakthrough in solar efficiency..."},
        {"id":2,"title":"Global Markets Show Recovery Signs","source":"BBC","category":"Business","time":"3h ago","credibility":"High","credibility_color":"#10b981","snippet":"Stock markets across Asia showed positive gains today..."},
        {"id":3,"title":"SHOCKING: Government Hiding Truth!","source":"Unknown","category":"Politics","time":"1h ago","credibility":"Low","credibility_color":"#ef4444","snippet":"A whistleblower revealed shocking secrets mainstream media won't show..."},
        {"id":4,"title":"New Mediterranean Diet Study Results","source":"NPR","category":"Health","time":"5h ago","credibility":"High","credibility_color":"#10b981","snippet":"Peer-reviewed study in New England Journal of Medicine found..."},
        {"id":5,"title":"Tech Giants Face New Regulations","source":"WSJ","category":"Tech","time":"4h ago","credibility":"High","credibility_color":"#10b981","snippet":"Major technology companies face increased regulatory scrutiny..."},
        {"id":6,"title":"Secret Cure for All Diseases EXPOSED","source":"NaturalNews","category":"Health","time":"30m ago","credibility":"Low","credibility_color":"#ef4444","snippet":"Deep state pharma hiding miracle cure from the public..."},
    ]
    return jsonify({"news": mock, "note": "Demo data — integrate NewsAPI for live feed"})