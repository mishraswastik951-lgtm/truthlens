# backend/app.py
from flask import Flask, jsonify
from flask_cors import CORS
from config.settings import config
from config.database import Database
from routes import news_bp, chat_bp


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": config.CORS_ORIGINS}})

    # Connect to MongoDB
    Database.connect()

    # Register blueprints
    app.register_blueprint(news_bp)
    app.register_blueprint(chat_bp)

    @app.route('/')
    def root():
        return jsonify({
            "name":       config.APP_NAME,
            "version":    config.VERSION,
            "db":         "MongoDB" if Database._connected else "In-Memory",
            "endpoints":  [
                "POST   /api/predict",
                "GET    /api/dashboard",
                "GET    /api/history?user_id=xxx",
                "DELETE /api/history/<id>?user_id=xxx",
                "DELETE /api/history/clear?user_id=xxx",
                "GET    /api/live-news",
                "GET    /api/health",
                "POST   /api/chat",
            ]
        })

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Endpoint not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error"}), 500

    return app


app = create_app()

if __name__ == '__main__':
    print(f"\n{'='*55}")
    print(f"  {config.APP_NAME} v{config.VERSION}")
    print(f"  DB: {'MongoDB OK' if Database._connected else 'In-Memory (fallback)'}")
    print(f"  URL: http://localhost:{config.PORT}")
    print(f"{'='*55}\n")
    app.run(debug=config.DEBUG, port=config.PORT, host=config.HOST)