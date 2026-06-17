# backend/config/settings.py
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # App settings
    APP_NAME    = "TruthLens API"
    VERSION     = "2.0.0"
    DEBUG       = os.getenv("DEBUG", "True") == "True"
    PORT        = int(os.getenv("PORT", 5000))
    HOST        = os.getenv("HOST", "0.0.0.0")

    # Model
    MODEL_PATH  = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "models", "best_model.pkl"
    )

    # CORS
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")

    # Features
    MAX_TEXT_LENGTH   = 50000
    MIN_TEXT_LENGTH   = 20
    HISTORY_LIMIT     = 200
    SUMMARY_SENTENCES = 3

config = Config()