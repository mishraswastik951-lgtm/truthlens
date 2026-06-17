# backend/services/sentiment_service.py
"""
Sentiment analysis using NLTK VADER.
"""
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer

nltk.download('vader_lexicon', quiet=True)

_sia = SentimentIntensityAnalyzer()


class SentimentService:

    def analyze(self, text: str) -> dict:
        scores   = _sia.polarity_scores(text)
        compound = scores['compound']

        if compound >= 0.05:
            sentiment, emoji, color = "Positive", "😊", "#10b981"
        elif compound <= -0.05:
            sentiment, emoji, color = "Negative", "😠", "#ef4444"
        else:
            sentiment, emoji, color = "Neutral",  "😐", "#94a3b8"

        return {
            "sentiment": sentiment,
            "emoji":     emoji,
            "color":     color,
            "compound":  round(compound, 3),
            "positive":  round(scores['pos'] * 100, 1),
            "negative":  round(scores['neg'] * 100, 1),
            "neutral":   round(scores['neu'] * 100, 1),
        }


sentiment_service = SentimentService()