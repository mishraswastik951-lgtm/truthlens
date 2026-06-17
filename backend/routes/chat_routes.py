# backend/routes/chat_routes.py
"""
Chatbot API endpoint.
"""
from flask import Blueprint, request, jsonify
import random

chat_bp = Blueprint('chat', __name__, url_prefix='/api')

RESPONSES = {
    ('hello','hi','hey','hii'):
        "👋 Hi! I'm TruthBot v2! I can help with:\n• Fake news detection\n• Sentiment analysis\n• Bias detection\n• How to use TruthLens\n\nWhat would you like to know?",
    ('fake','detect','how fake','why fake'):
        "🔍 TruthLens detects fake news using:\n1. ML Model (98.5% accurate)\n2. Suspicious keyword detection\n3. Language pattern analysis\n4. TF-IDF feature comparison\n\nTrained on 44,898 real articles!",
    ('sentiment','positive','negative','emotion'):
        "😊 Sentiment Analysis:\n🟢 Positive → Constructive language\n🔴 Negative → Fear/alarm language\n⚪ Neutral → Balanced reporting\n\nFake news often uses highly negative language!",
    ('bias','political','left','right'):
        "⚖️ Bias Detection:\n🔵 Left-leaning → Progressive keywords\n🔴 Right-leaning → Conservative keywords\n⚖️ Neutral → Balanced language\n\nGood journalism aims for neutrality!",
    ('credibility','source','trust','reliable'):
        "🏆 Source Credibility:\n🟢 High: Reuters, BBC, AP, NPR\n🟡 Medium: HuffPost, BuzzFeed\n🔴 Low: InfoWars, NaturalNews\n\nAlways check your sources!",
    ('keyword','suspicious','highlight'):
        "🚨 Suspicious keywords are red flags:\n• SHOCKING, EXPOSED, SECRET\n• Conspiracy terms\n• 'Share before deleted'\n• Emotional manipulation\n\nReal news uses formal language.",
    ('summary','summarize','brief'):
        "📋 Article Summarizer:\n• Extracts top 3 sentences\n• Uses word frequency scoring\n• No AI API needed!\n• Pure extractive summarization",
    ('accuracy','accurate','percentage'):
        "🎯 Model Performance:\n• Accuracy: 98.5%\n• AUC: 0.998\n• Precision: 98.2%\n• Recall: 98.7%\n• F1: 98.4%",
    ('dataset','data','kaggle','train'):
        "📊 Dataset Info:\n• Kaggle CC0 License (Free!)\n• Author: Clément Bisaillon\n• 44,898 total articles\n• 23,481 fake | 21,417 real\n• Period: 2016-2017",
    ('how to use','tutorial','guide'):
        "🚀 Using TruthLens:\n1. Go to Analyzer\n2. Paste news article\n3. Add source URL (optional)\n4. Click Analyze\n5. See all results in tabs!",
    ('history','previous','past'):
        "📚 Analysis history is saved automatically!\nGo to Dashboard → Recent Analyses to see:\n• Previous articles\n• Predictions & confidence\n• Sentiment & bias results",
    ('help',):
        "🤖 Ask me about:\n• Fake detection\n• Sentiment analysis\n• Bias detection\n• Source credibility\n• How to use TruthLens\n• Dataset & accuracy",
    ('thank','thanks','great'):
        "You're welcome! 😊 Stay informed and always verify news! 🔍📰",
    ('bye','goodbye'):
        "Goodbye! 👋 Come back anytime to verify news! 🔍",
}

DEFAULTS = [
    "I'm not sure about that. Try asking:\n• 'How does fake detection work?'\n• 'What is sentiment analysis?'\n• 'How accurate is TruthLens?'",
    "Good question! Ask me about: accuracy, dataset, sentiment, bias, or how to use TruthLens. 📚",
    "Try: 'What are suspicious keywords?' or 'How does bias detection work?' 🤖",
]


@chat_bp.route('/chat', methods=['POST'])
def chat():
    data    = request.get_json()
    message = data.get('message', '').lower().strip()

    for keywords, response in RESPONSES.items():
        if any(kw in message for kw in keywords):
            return jsonify({"reply": response})

    return jsonify({"reply": random.choice(DEFAULTS)})