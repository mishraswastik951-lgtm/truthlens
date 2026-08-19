# backend/services/ml_service.py
"""
ML prediction service.
Loads trained model and runs fake/real classification.
"""
import joblib
import os
from utils.text_cleaner import clean_text
from config.settings import config


class MLService:
    _instance = None   # singleton

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._model = None
            cls._instance._load()
        return cls._instance

    # ── Load ──────────────────────────────────────────
    def _load(self):
        if os.path.exists(config.MODEL_PATH):
            try:
                self._model = joblib.load(config.MODEL_PATH)
                print(f"[OK] ML model loaded from {config.MODEL_PATH}")
            except Exception as e:
                print(f"[WARN] Model load error: {e}")
        else:
            print(f"[WARN] Model not found at {config.MODEL_PATH}")
            print("   Run: python train_model.py")

    # ── Public API ────────────────────────────────────
    @property
    def is_loaded(self) -> bool:
        return self._model is not None

    def predict(self, text: str) -> dict:
        """
        Returns prediction dict with probabilities.
        Falls back to demo/random mode if model not loaded.
        """
        if self._model is None:
            return self._demo_predict(text)

        cleaned = clean_text(text)
        if len(cleaned.strip()) < 3:
            return {"error": "Text too short after cleaning"}

        prediction   = self._model.predict([cleaned])[0]
        probs        = self._model.predict_proba([cleaned])[0]
        fake_prob    = round(float(probs[0]) * 100, 2)
        real_prob    = round(float(probs[1]) * 100, 2)
        confidence   = round(float(max(probs)) * 100, 2)
        pred_label   = "REAL" if prediction == 1 else "FAKE"

        return {
            "prediction":       pred_label,
            "confidence":       confidence,
            "fake_probability": fake_prob,
            "real_probability": real_prob,
            "label":            int(prediction),
            "demo_mode":        False,
        }

    # ── Demo/fallback ─────────────────────────────────
    @staticmethod
    def _demo_predict(text: str) -> dict:
        import random
        random.seed(len(text))
        fake_prob  = round(random.uniform(20, 80), 2)
        real_prob  = round(100 - fake_prob, 2)
        pred_label = "FAKE" if fake_prob > 50 else "REAL"
        return {
            "prediction":       pred_label,
            "confidence":       max(fake_prob, real_prob),
            "fake_probability": fake_prob,
            "real_probability": real_prob,
            "label":            0 if pred_label == "FAKE" else 1,
            "demo_mode":        True,
            "note":             "Demo mode — run train_model.py for real predictions",
        }


# Singleton instance
ml_service = MLService()