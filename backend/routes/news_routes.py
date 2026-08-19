# backend/routes/news_routes.py
from flask import Blueprint, request, jsonify
from datetime import datetime
from services import (
    ml_service, sentiment_service,
    bias_service, credibility_service, summarizer_service,
)
from services.history_service import history_service
from utils.text_cleaner import get_word_frequencies, get_text_stats
from config.settings import config
from config.database import Database

news_bp = Blueprint('news', __name__, url_prefix='/api')


# ── POST /api/predict ─────────────────────────────────────────
@news_bp.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data"}), 400

    text       = data.get('text',       '').strip()
    source_url = data.get('source_url', '')
    user_id    = data.get('user_id',    'anonymous')
    user_email = data.get('user_email', '')
    user_name  = data.get('user_name',  '')

    if not text:
        return jsonify({"error": "No text provided"}), 400
    if len(text) < config.MIN_TEXT_LENGTH:
        return jsonify({"error": f"Text too short (min {config.MIN_TEXT_LENGTH} chars)"}), 400

    try:
        # Run all services
        ml_result   = ml_service.predict(text)
        sentiment   = sentiment_service.analyze(text)
        bias        = bias_service.detect(text)
        source_cred = credibility_service.check_source(text, source_url)
        suspicious  = credibility_service.find_suspicious(text)
        summary     = summarizer_service.summarize(text)
        key_points  = summarizer_service.key_points(text)
        word_freq   = get_word_frequencies(text)
        text_stats  = get_text_stats(text)
        cred_score  = credibility_service.composite_score(
            ml_result.get('real_probability', 50),
            len(suspicious),
            source_cred.get('score', 50),
        )

        result = {
            **ml_result,
            "sentiment":            sentiment,
            "bias":                 bias,
            "source_credibility":   source_cred,
            "suspicious_keywords":  suspicious,
            "suspicious_count":     len(suspicious),
            "summary":              summary,
            "key_points":           key_points,
            "credibility_score":    cred_score,
            "word_frequencies":     word_freq,
            "text_stats":           text_stats,
            "analyzed_at":          datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        }

        # Save to database
        history_service.save_analysis({
            **result,
            "text":       text,
            "source_url": source_url,
            "user_id":    user_id,
            "user_email": user_email,
            "user_name":  user_name,
        })

        return jsonify(result)

    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500


# ── GET /api/dashboard ────────────────────────────────────────
@news_bp.route('/dashboard', methods=['GET'])
def dashboard():
    stats = history_service.get_global_stats()
    return jsonify({
        **stats,
        "accuracy":     98.5,
        "model_loaded": ml_service.is_loaded,
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
    user_id    = request.args.get('user_id', 'anonymous')
    page       = int(request.args.get('page', 1))
    per_page   = int(request.args.get('per_page', 20))
    pred_filter = request.args.get('prediction', None)
    sent_filter = request.args.get('sentiment',  None)

    result = history_service.get_user_history(
        user_id, page, per_page, pred_filter, sent_filter
    )
    return jsonify(result)


# ── DELETE /api/history/<id> ──────────────────────────────────
@news_bp.route('/history/<analysis_id>', methods=['DELETE'])
def delete_history(analysis_id):
    user_id = request.args.get('user_id', '')
    if not user_id:
        return jsonify({"error": "user_id required"}), 400
    deleted = history_service.delete_analysis(analysis_id, user_id)
    if deleted:
        return jsonify({"message": "Deleted successfully"})
    return jsonify({"error": "Not found or unauthorized"}), 404


# ── DELETE /api/history/clear ─────────────────────────────────
@news_bp.route('/history/clear', methods=['DELETE'])
def clear_history():
    user_id = request.args.get('user_id', '')
    if not user_id:
        return jsonify({"error": "user_id required"}), 400
    count = history_service.clear_user_history(user_id)
    return jsonify({"message": f"Cleared {count} analyses"})


# ── GET /api/health ───────────────────────────────────────────
@news_bp.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status":       "healthy",
        "app":          config.APP_NAME,
        "version":      config.VERSION,
        "model_loaded": ml_service.is_loaded,
        "demo_mode":    not ml_service.is_loaded,
        "db_connected": Database._connected,
        "services": {
            "ml":          ml_service.is_loaded,
            "sentiment":   True,
            "bias":        True,
            "credibility": True,
            "summarizer":  True,
            "database":    Database._connected,
        },
    })


# ── GET /api/live-news ────────────────────────────────────────
@news_bp.route('/live-news', methods=['GET'])
def live_news():
    mock = [
        {"id":1,"title":"Scientists Develop New Clean Energy","source":"Reuters","category":"Science","time":"2h ago","credibility":"High","credibility_color":"#10b981","snippet":"MIT researchers developed breakthrough solar efficiency..."},
        {"id":2,"title":"Global Markets Show Recovery Signs","source":"BBC","category":"Business","time":"3h ago","credibility":"High","credibility_color":"#10b981","snippet":"Stock markets across Asia showed positive gains..."},
        {"id":3,"title":"SHOCKING: Government Hiding Truth!","source":"Unknown","category":"Politics","time":"1h ago","credibility":"Low","credibility_color":"#ef4444","snippet":"Whistleblower reveals secrets mainstream media won't show..."},
        {"id":4,"title":"New Mediterranean Diet Study Results","source":"NPR","category":"Health","time":"5h ago","credibility":"High","credibility_color":"#10b981","snippet":"Peer-reviewed NEJM study finds significant health benefits..."},
        {"id":5,"title":"Tech Giants Face New Regulations","source":"WSJ","category":"Tech","time":"4h ago","credibility":"High","credibility_color":"#10b981","snippet":"Major technology companies face increased regulatory scrutiny..."},
        {"id":6,"title":"Secret Cure EXPOSED by Insider","source":"NaturalNews","category":"Health","time":"30m ago","credibility":"Low","credibility_color":"#ef4444","snippet":"Deep state pharma companies hiding miracle cure from public..."},
    ]
    return jsonify({"news": mock, "note": "Demo — integrate NewsAPI for live feed"})