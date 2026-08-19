# backend/services/history_service.py
"""
History service — saves and retrieves analysis history.
Uses MongoDB if available, falls back to in-memory list.
"""
from datetime import datetime, timedelta
from bson import ObjectId
from config.database import Database


def _serialize(doc: dict) -> dict:
    """Convert MongoDB ObjectId to string for JSON."""
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


class HistoryService:
    """
    Handles all history CRUD operations.
    Automatically uses MongoDB or in-memory fallback.
    """

    def __init__(self):
        self._memory = []   # fallback when MongoDB unavailable

    # ── Save Analysis ─────────────────────────────────
    def save_analysis(self, data: dict) -> dict:
        entry = {
            "user_id":      data.get("user_id", "anonymous"),
            "user_email":   data.get("user_email", ""),
            "user_name":    data.get("user_name", ""),
            "text_snippet": data.get("text", "")[:150],
            "full_text":    data.get("text", ""),
            "source_url":   data.get("source_url", ""),
            "prediction":   data.get("prediction", ""),
            "confidence":   data.get("confidence", 0),
            "fake_probability": data.get("fake_probability", 0),
            "real_probability": data.get("real_probability", 0),
            "sentiment":    data.get("sentiment", {}),
            "bias":         data.get("bias", {}),
            "suspicious_count": data.get("suspicious_count", 0),
            "credibility_score": data.get("credibility_score", 0),
            "summary":      data.get("summary", ""),
            "word_frequencies": data.get("word_frequencies", [])[:10],
            "text_stats":   data.get("text_stats", {}),
            "demo_mode":    data.get("demo_mode", False),
            "analyzed_at":  datetime.utcnow(),
        }

        col = Database.analyses()
        if col is not None:
            result = col.insert_one(entry)
            entry["_id"] = str(result.inserted_id)
        else:
            # fallback
            entry["_id"]       = str(len(self._memory) + 1)
            entry["analyzed_at"] = datetime.utcnow().isoformat()
            self._memory.append(entry)
            if len(self._memory) > 500:
                self._memory.pop(0)

        return entry

    # ── Get User History ──────────────────────────────
    def get_user_history(
        self,
        user_id: str,
        page: int = 1,
        per_page: int = 20,
        prediction_filter: str = None,
        sentiment_filter: str = None,
    ) -> dict:

        col = Database.analyses()

        if col is not None:
            # Build filter
            query = {"user_id": user_id}
            if prediction_filter:
                query["prediction"] = prediction_filter.upper()
            if sentiment_filter:
                query["sentiment.sentiment"] = sentiment_filter

            total  = col.count_documents(query)
            skip   = (page - 1) * per_page
            cursor = (
                col.find(query)
                   .sort("analyzed_at", -1)
                   .skip(skip)
                   .limit(per_page)
            )
            items = [_serialize(doc) for doc in cursor]

            # Stats for this user
            pipeline = [
                {"$match": {"user_id": user_id}},
                {"$group": {
                    "_id": None,
                    "total":       {"$sum": 1},
                    "fake_count":  {"$sum": {"$cond": [{"$eq":["$prediction","FAKE"]},1,0]}},
                    "real_count":  {"$sum": {"$cond": [{"$eq":["$prediction","REAL"]},1,0]}},
                    "avg_confidence": {"$avg": "$confidence"},
                }}
            ]
            agg = list(col.aggregate(pipeline))
            user_stats = agg[0] if agg else {}
            user_stats.pop("_id", None)

        else:
            # In-memory fallback
            filtered = [
                h for h in self._memory
                if h.get("user_id") == user_id
                and (not prediction_filter or h.get("prediction") == prediction_filter.upper())
                and (not sentiment_filter  or h.get("sentiment",{}).get("sentiment") == sentiment_filter)
            ]
            total  = len(filtered)
            skip   = (page - 1) * per_page
            items  = list(reversed(filtered))[skip: skip + per_page]
            fake_c = sum(1 for h in filtered if h.get("prediction")=="FAKE")
            real_c = sum(1 for h in filtered if h.get("prediction")=="REAL")
            confs  = [h.get("confidence",0) for h in filtered]
            user_stats = {
                "total": total,
                "fake_count": fake_c,
                "real_count": real_c,
                "avg_confidence": round(sum(confs)/len(confs),1) if confs else 0,
            }

        return {
            "history":    items,
            "total":      total,
            "page":       page,
            "per_page":   per_page,
            "pages":      max(1, -(-total // per_page)),
            "user_stats": user_stats,
        }

    # ── Get Single Analysis ───────────────────────────
    def get_analysis(self, analysis_id: str, user_id: str) -> dict:
        col = Database.analyses()
        if col is not None:
            try:
                doc = col.find_one({
                    "_id":     ObjectId(analysis_id),
                    "user_id": user_id,
                })
                return _serialize(doc) if doc else None
            except Exception:
                return None
        # Memory fallback
        for h in self._memory:
            if h.get("_id") == analysis_id and h.get("user_id") == user_id:
                return h
        return None

    # ── Delete Analysis ───────────────────────────────
    def delete_analysis(self, analysis_id: str, user_id: str) -> bool:
        col = Database.analyses()
        if col is not None:
            try:
                res = col.delete_one({
                    "_id":     ObjectId(analysis_id),
                    "user_id": user_id,
                })
                return res.deleted_count > 0
            except Exception:
                return False
        # Memory fallback
        before = len(self._memory)
        self._memory = [
            h for h in self._memory
            if not (h.get("_id") == analysis_id and h.get("user_id") == user_id)
        ]
        return len(self._memory) < before

    # ── Delete All User History ───────────────────────
    def clear_user_history(self, user_id: str) -> int:
        col = Database.analyses()
        if col is not None:
            res = col.delete_many({"user_id": user_id})
            return res.deleted_count
        before = len(self._memory)
        self._memory = [h for h in self._memory if h.get("user_id") != user_id]
        return before - len(self._memory)

    # ── Global Dashboard Stats ────────────────────────
    def get_global_stats(self) -> dict:
        col = Database.analyses()
        if col is not None:
            total = col.count_documents({})
            fake  = col.count_documents({"prediction": "FAKE"})
            real  = col.count_documents({"prediction": "REAL"})

            # Sentiment distribution
            sent_pipeline = [
                {"$group": {"_id": "$sentiment.sentiment", "count": {"$sum":1}}}
            ]
            sent_data = {r["_id"]: r["count"] for r in col.aggregate(sent_pipeline) if r["_id"]}

            # Bias distribution
            bias_pipeline = [
                {"$group": {"_id": "$bias.bias", "count": {"$sum":1}}}
            ]
            bias_data = {r["_id"]: r["count"] for r in col.aggregate(bias_pipeline) if r["_id"]}

            # Recent
            recent = [
                _serialize(doc)
                for doc in col.find().sort("analyzed_at", -1).limit(15)
            ]
            return {
                "total_analyzed":  total,
                "fake_detected":   fake,
                "real_detected":   real,
                "fake_percentage": round(fake/total*100,1) if total else 0,
                "real_percentage": round(real/total*100,1) if total else 0,
                "sentiment_distribution": {
                    "Positive": sent_data.get("Positive", 0),
                    "Negative": sent_data.get("Negative", 0),
                    "Neutral":  sent_data.get("Neutral",  0),
                },
                "bias_distribution": {
                    "Neutral":        bias_data.get("Neutral",        0),
                    "Left-Leaning":   bias_data.get("Left-Leaning",   0),
                    "Right-Leaning":  bias_data.get("Right-Leaning",  0),
                    "Mixed/Balanced": bias_data.get("Mixed/Balanced", 0),
                },
                "recent_analyses": recent,
                "db_connected":    True,
            }

        # Memory fallback
        total = len(self._memory)
        fake  = sum(1 for h in self._memory if h.get("prediction")=="FAKE")
        real  = sum(1 for h in self._memory if h.get("prediction")=="REAL")
        return {
            "total_analyzed":  total,
            "fake_detected":   fake,
            "real_detected":   real,
            "fake_percentage": round(fake/total*100,1) if total else 0,
            "real_percentage": round(real/total*100,1) if total else 0,
            "recent_analyses": list(reversed(self._memory[-15:])),
            "db_connected":    False,
        }


history_service = HistoryService()