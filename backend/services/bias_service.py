# backend/services/bias_service.py
"""
Political bias detection service.
"""

LEFT_WORDS = [
    "progressive", "socialist", "liberal", "equality", "diversity",
    "climate change", "gun control", "universal healthcare",
    "systemic racism", "social justice", "defund", "woke",
    "marginalized", "privilege", "oppression", "activist",
    "reproductive rights", "green new deal", "wealth tax",
]

RIGHT_WORDS = [
    "conservative", "traditional", "patriot", "freedom", "liberty",
    "second amendment", "border security", "illegal immigration",
    "fake news media", "deep state", "radical left", "socialist agenda",
    "law and order", "make america", "maga", "drain the swamp",
    "globalist", "antifa", "election fraud", "critical race theory",
]


class BiasService:

    def detect(self, text: str) -> dict:
        t = text.lower()

        left_count  = sum(1 for w in LEFT_WORDS  if w in t)
        right_count = sum(1 for w in RIGHT_WORDS if w in t)
        total       = left_count + right_count

        if total == 0:
            bias, emoji, color = "Neutral",        "⚖️",  "#94a3b8"
        elif left_count > right_count * 1.5:
            bias, emoji, color = "Left-Leaning",   "🔵",  "#3b82f6"
        elif right_count > left_count * 1.5:
            bias, emoji, color = "Right-Leaning",  "🔴",  "#ef4444"
        else:
            bias, emoji, color = "Mixed/Balanced", "🟡",  "#f59e0b"

        found_left  = [w for w in LEFT_WORDS  if w in t][:5]
        found_right = [w for w in RIGHT_WORDS if w in t][:5]

        return {
            "bias":             bias,
            "emoji":            emoji,
            "color":            color,
            "left_count":       left_count,
            "right_count":      right_count,
            "found_left":       found_left,
            "found_right":      found_right,
            "neutrality_score": max(0, 100 - total * 8),
        }


bias_service = BiasService()