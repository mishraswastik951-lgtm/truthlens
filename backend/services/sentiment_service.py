# backend/services/sentiment_service.py
"""
Enhanced Sentiment Analysis Service.
Uses NLTK VADER + custom emotional pattern detection.
Provides detailed WHY explanation for users.
"""
import re
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from collections import Counter

nltk.download('vader_lexicon', quiet=True)

_sia = SentimentIntensityAnalyzer()

# ── Emotion Word Banks ────────────────────────────────────────
EMOTION_WORDS = {
    "fear": [
        "danger", "threat", "attack", "crisis", "emergency", "risk",
        "warning", "alarm", "panic", "terror", "afraid", "scary",
        "horrific", "devastating", "catastrophic", "deadly",
    ],
    "anger": [
        "outrage", "fury", "anger", "rage", "betrayal", "corrupt",
        "disgraceful", "shameful", "illegal", "fraud", "scandal",
        "incompetent", "failure", "lies", "deception",
    ],
    "joy": [
        "celebrate", "victory", "success", "achievement", "breakthrough",
        "wonderful", "amazing", "fantastic", "excellent", "great",
        "proud", "happy", "excited", "positive", "hope",
    ],
    "surprise": [
        "shocking", "unexpected", "unbelievable", "stunning", "revealed",
        "exposed", "discovered", "sudden", "breaking", "exclusive",
    ],
    "trust": [
        "confirmed", "verified", "official", "authority", "expert",
        "research", "study", "evidence", "data", "proven",
        "peer-reviewed", "scientific", "government", "report",
    ],
    "disgust": [
        "disgusting", "horrible", "terrible", "awful", "nasty",
        "offensive", "vile", "repulsive", "obscene", "filthy",
    ],
}

# Why fake/real language patterns
FAKE_LANGUAGE_PATTERNS = [
    ("ALL CAPS usage",           r'\b[A-Z]{4,}\b'),
    ("Excessive punctuation",    r'[!?]{2,}'),
    ("Clickbait phrases",        r'you won\'t believe|must see|share now|before it\'s deleted|they don\'t want'),
    ("Conspiracy language",      r'deep state|cover.?up|truth revealed|mainstream media|wake up'),
    ("Unverified claims",        r'secret|hidden|exposed|whistleblower|insider'),
    ("Emotional manipulation",   r'shocking|outrage|unbelievable|incredible|amazing'),
    ("Urgency triggers",         r'breaking|urgent|alert|warning|immediately|right now'),
    ("Anonymous sourcing",       r'sources say|insiders claim|reportedly|allegedly without attribution'),
]

REAL_LANGUAGE_PATTERNS = [
    ("Attribution to sources",   r'according to|said|stated|confirmed|reported by'),
    ("Specific data/statistics", r'\d+%|\d+ percent|study shows|research found|data indicates'),
    ("Named officials/experts",  r'[A-Z][a-z]+ [A-Z][a-z]+, (director|minister|president|professor|doctor|dr\.)'),
    ("Publication references",   r'published in|journal|report by|according to the'),
    ("Neutral language",         r'however|although|despite|on the other hand|officials said'),
    ("Date and location",        r'(monday|tuesday|wednesday|thursday|friday|saturday|sunday)|washington|new york|london'),
]


class SentimentService:

    def analyze(self, text: str) -> dict:
        """
        Full sentiment analysis with:
        - VADER scores
        - Emotion detection
        - Language pattern analysis
        - WHY explanation for users
        """
        # 1. VADER scores
        scores   = _sia.polarity_scores(text)
        compound = scores['compound']

        if   compound >=  0.05: sentiment, emoji, color = "Positive", "😊", "#10b981"
        elif compound <= -0.05: sentiment, emoji, color = "Negative", "😠", "#ef4444"
        else:                   sentiment, emoji, color = "Neutral",  "😐", "#94a3b8"

        # 2. Detect emotions
        emotions      = self._detect_emotions(text)
        dominant_emo  = max(emotions, key=emotions.get) if emotions else "neutral"

        # 3. Language patterns
        fake_patterns  = self._check_patterns(text, FAKE_LANGUAGE_PATTERNS)
        real_patterns  = self._check_patterns(text, REAL_LANGUAGE_PATTERNS)

        # 4. Writing style analysis
        style = self._analyze_style(text)

        # 5. Build WHY explanation
        why = self._build_why_explanation(
            sentiment, compound, emotions,
            fake_patterns, real_patterns, style,
        )

        # 6. Credibility impact
        cred_impact = self._credibility_impact(
            compound, fake_patterns, real_patterns
        )

        return {
            # Core sentiment
            "sentiment":  sentiment,
            "emoji":      emoji,
            "color":      color,
            "compound":   round(compound, 3),
            "positive":   round(scores['pos'] * 100, 1),
            "negative":   round(scores['neg'] * 100, 1),
            "neutral":    round(scores['neu'] * 100, 1),

            # Emotions
            "emotions":          emotions,
            "dominant_emotion":  dominant_emo,

            # Language patterns
            "fake_language_patterns": fake_patterns,
            "real_language_patterns": real_patterns,
            "fake_pattern_count":     len(fake_patterns),
            "real_pattern_count":     len(real_patterns),

            # Writing style
            "style": style,

            # WHY explanation (key feature!)
            "why_explanation":   why,
            "credibility_impact": cred_impact,
        }

    # ── Helpers ───────────────────────────────────────

    def _detect_emotions(self, text: str) -> dict:
        t      = text.lower()
        result = {}
        for emotion, words in EMOTION_WORDS.items():
            count = sum(1 for w in words if w in t)
            if count > 0:
                result[emotion] = count
        return result

    def _check_patterns(self, text: str, patterns: list) -> list:
        found = []
        for name, pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                found.append({
                    "pattern": name,
                    "matches": list(set(str(m) for m in matches[:3])),
                    "count":   len(matches),
                })
        return found

    def _analyze_style(self, text: str) -> dict:
        words     = text.split()
        sentences = [s for s in re.split(r'[.!?]+', text) if s.strip()]
        caps_words = [w for w in words if w.isupper() and len(w) > 2]
        excl       = text.count('!')
        quest      = text.count('?')
        avg_sent_len = len(words) / max(len(sentences), 1)

        return {
            "caps_word_count":     len(caps_words),
            "caps_words":          caps_words[:5],
            "exclamation_count":   excl,
            "question_count":      quest,
            "avg_sentence_length": round(avg_sent_len, 1),
            "is_formal":           avg_sent_len > 15 and excl < 3,
            "is_sensationalist":   len(caps_words) > 3 or excl > 3,
        }

    def _build_why_explanation(
        self,
        sentiment: str,
        compound: float,
        emotions: dict,
        fake_patterns: list,
        real_patterns: list,
        style: dict,
    ) -> dict:
        """
        Build a user-friendly explanation of WHY
        the article has this sentiment and what it means
        for authenticity.
        """
        reasons    = []
        red_flags  = []
        green_flags = []
        verdict    = ""

        # Sentiment reasoning
        if sentiment == "Negative":
            reasons.append(
                f"This article uses strongly negative language "
                f"(score: {compound:.2f}), which is common in "
                f"fear-mongering fake news."
            )
            red_flags.append("Strong negative emotional tone")
        elif sentiment == "Positive":
            reasons.append(
                f"This article uses positive language "
                f"(score: {compound:.2f}). Extremely positive "
                f"claims often signal misleading content."
            )
        else:
            reasons.append(
                f"This article uses neutral, balanced language "
                f"(score: {compound:.2f}), which is a hallmark "
                f"of professional journalism."
            )
            green_flags.append("Neutral balanced tone")

        # Emotion analysis
        if "fear" in emotions and emotions["fear"] > 2:
            red_flags.append(f"High fear language ({emotions['fear']} instances)")
            reasons.append("Excessive fear-inducing words are used to manipulate readers emotionally.")

        if "trust" in emotions and emotions["trust"] > 2:
            green_flags.append(f"Trust/credibility language ({emotions['trust']} instances)")
            reasons.append("Article references verified sources and uses credibility markers.")

        if "surprise" in emotions and emotions["surprise"] > 2:
            red_flags.append(f"Sensationalist surprise language ({emotions['surprise']} instances)")
            reasons.append("Excessive use of sensationalist words like 'shocking' or 'unbelievable'.")

        # Writing style
        if style["is_sensationalist"]:
            red_flags.append(f"{style['caps_word_count']} ALL-CAPS words detected")
            reasons.append("All-caps words and excessive punctuation are tactics used in fake news.")

        if style["is_formal"] and not style["is_sensationalist"]:
            green_flags.append("Formal writing style")
            reasons.append("Formal sentence structure suggests professional reporting.")

        # Fake language patterns
        for p in fake_patterns:
            red_flags.append(f"'{p['pattern']}' detected")

        # Real language patterns
        for p in real_patterns:
            green_flags.append(f"'{p['pattern']}' detected")

        # Overall verdict
        if len(red_flags) > len(green_flags) + 1:
            verdict = "⚠️ Multiple red flags detected. This article shows characteristics of misleading or fake news."
        elif len(green_flags) > len(red_flags) + 1:
            verdict = "✅ This article shows characteristics of credible, professional journalism."
        else:
            verdict = "🟡 Mixed signals detected. Verify this article with additional sources."

        return {
            "verdict":     verdict,
            "reasons":     reasons,
            "red_flags":   red_flags,
            "green_flags": green_flags,
            "summary":     f"Found {len(red_flags)} red flags and {len(green_flags)} credibility signals.",
        }

    def _credibility_impact(
        self,
        compound: float,
        fake_patterns: list,
        real_patterns: list,
    ) -> dict:
        """
        How does sentiment affect overall credibility?
        """
        base   = 50.0
        impact = 0.0

        # Sentiment contribution
        if compound < -0.3:
            impact -= 20
            reason = "Highly negative sentiment reduces credibility"
        elif compound < -0.05:
            impact -= 10
            reason = "Negative tone slightly reduces credibility"
        elif compound > 0.5:
            impact -= 10
            reason = "Overly positive tone can indicate bias"
        else:
            impact += 10
            reason = "Neutral tone increases credibility"

        # Pattern contribution
        impact -= len(fake_patterns) * 5
        impact += len(real_patterns) * 5

        final = max(0, min(100, base + impact))

        return {
            "score":  round(final, 1),
            "impact": round(impact, 1),
            "reason": reason,
        }


sentiment_service = SentimentService()