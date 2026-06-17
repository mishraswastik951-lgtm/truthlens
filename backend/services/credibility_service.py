# backend/services/credibility_service.py
"""
Source credibility scoring service.
"""

SOURCE_DB = {
    # High credibility
    "reuters":      {"score": 95, "level": "High",   "color": "#10b981"},
    "bbc":          {"score": 92, "level": "High",   "color": "#10b981"},
    "apnews":       {"score": 94, "level": "High",   "color": "#10b981"},
    "npr":          {"score": 91, "level": "High",   "color": "#10b981"},
    "nytimes":      {"score": 88, "level": "High",   "color": "#10b981"},
    "theguardian":  {"score": 87, "level": "High",   "color": "#10b981"},
    "wsj":          {"score": 89, "level": "High",   "color": "#10b981"},
    "thehindu":     {"score": 85, "level": "High",   "color": "#10b981"},
    "ndtv":         {"score": 78, "level": "High",   "color": "#10b981"},
    "bbc.com":      {"score": 92, "level": "High",   "color": "#10b981"},
    # Medium credibility
    "timesofindia": {"score": 72, "level": "Medium", "color": "#f59e0b"},
    "huffpost":     {"score": 65, "level": "Medium", "color": "#f59e0b"},
    "buzzfeed":     {"score": 58, "level": "Medium", "color": "#f59e0b"},
    "vox":          {"score": 68, "level": "Medium", "color": "#f59e0b"},
    "vice":         {"score": 62, "level": "Medium", "color": "#f59e0b"},
    "dailymail":    {"score": 44, "level": "Low",    "color": "#ef4444"},
    # Low credibility
    "infowars":     {"score": 5,  "level": "Low",    "color": "#ef4444"},
    "naturalnews":  {"score": 8,  "level": "Low",    "color": "#ef4444"},
    "breitbart":    {"score": 25, "level": "Low",    "color": "#ef4444"},
    "beforeitsnews":{"score": 3,  "level": "Low",    "color": "#ef4444"},
}

SUSPICIOUS_WORDS = [
    "shocking", "unbelievable", "secret", "exposed", "conspiracy",
    "hoax", "fraud", "lie", "hidden", "cover", "breaking", "urgent",
    "alert", "warning", "danger", "scandal", "corrupt", "illegal",
    "banned", "censored", "deleted", "whistleblower", "leaked",
    "classified", "deep state", "agenda", "mainstream media",
    "wake up", "share before", "they don't want", "miracle", "cure",
    "guaranteed", "amazing", "incredible", "100%",
]


class CredibilityService:

    def check_source(self, text: str, source_url: str = "") -> dict:
        combined = (text + " " + source_url).lower()
        for domain, info in SOURCE_DB.items():
            if domain in combined:
                return {"source": domain, "found": True, **info}
        return {
            "source": "Unknown",
            "score":  50,
            "level":  "Unknown",
            "color":  "#64748b",
            "found":  False,
            "note":   "Source not in database. Verify manually.",
        }

    def find_suspicious(self, text: str) -> list:
        t = text.lower()
        found = []
        for word in SUSPICIOUS_WORDS:
            if word in t:
                idx = t.find(word)
                found.append({
                    "word":    word,
                    "index":   idx,
                    "context": text[max(0, idx-30): idx+len(word)+30],
                })
        return found[:15]

    def composite_score(
        self,
        real_prob: float,
        suspicious_count: int,
        source_score: int,
    ) -> float:
        penalty = min(suspicious_count * 3, 30)
        raw     = (real_prob * 0.6) + (source_score * 0.2) - penalty
        return max(0.0, min(100.0, round(raw, 1)))


credibility_service = CredibilityService()