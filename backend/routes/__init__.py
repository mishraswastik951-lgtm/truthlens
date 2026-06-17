# backend/routes/__init__.py
from .news_routes import news_bp
from .chat_routes import chat_bp

__all__ = ["news_bp", "chat_bp"]