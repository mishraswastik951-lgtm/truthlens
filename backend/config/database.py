# backend/config/database.py
"""
MongoDB connection manager.
Handles connection, reconnection, and provides
collection accessors for all services.
"""
import os
from datetime import datetime
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from dotenv import load_dotenv

load_dotenv()

MONGO_URI    = os.getenv("MONGO_URI",    "mongodb://localhost:27017/")
MONGO_DB     = os.getenv("MONGO_DB_NAME","truthlens")


class Database:
    """Singleton MongoDB connection manager."""
    _client   = None
    _db       = None
    _connected = False

    # ── Connect ───────────────────────────────────────
    @classmethod
    def connect(cls):
        try:
            cls._client = MongoClient(
                MONGO_URI,
                serverSelectionTimeoutMS=5000,
            )
            # Ping to verify connection
            cls._client.admin.command('ping')
            cls._db        = cls._client[MONGO_DB]
            cls._connected = True

            # Create indexes
            cls._create_indexes()
            print(f"[OK] MongoDB connected -> {MONGO_URI}{MONGO_DB}")
            return True

        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            cls._connected = False
            print(f"[WARN] MongoDB not available: {e}")
            print("   History will use in-memory storage.")
            return False

    # ── Indexes ───────────────────────────────────────
    @classmethod
    def _create_indexes(cls):
        try:
            # analyses collection
            cls._db.analyses.create_index(
                [("user_id", ASCENDING), ("analyzed_at", DESCENDING)]
            )
            cls._db.analyses.create_index([("analyzed_at", DESCENDING)])
            cls._db.analyses.create_index([("prediction", ASCENDING)])

            # users collection
            cls._db.users.create_index([("uid", ASCENDING)], unique=True)

            print("[OK] MongoDB indexes created")
        except Exception as e:
            print(f"   Index creation warning: {e}")

    # ── Properties ────────────────────────────────────
    @classmethod
    def is_connected(cls):
        return cls._connected

    @classmethod
    def get_collection(cls, name: str):
        if not cls._connected or cls._db is None:
            return None
        return cls._db[name]

    # ── Collection shortcuts ──────────────────────────
    @classmethod
    def analyses(cls):
        return cls.get_collection("analyses")

    @classmethod
    def users(cls):
        return cls.get_collection("users")

    @classmethod
    def stats(cls):
        return cls.get_collection("stats")

    # ── Health check ──────────────────────────────────
    @classmethod
    def ping(cls) -> bool:
        try:
            if cls._client:
                cls._client.admin.command('ping')
                return True
        except Exception:
            pass
        return False

    # ── Disconnect ────────────────────────────────────
    @classmethod
    def disconnect(cls):
        if cls._client:
            cls._client.close()
            cls._connected = False
            print("MongoDB disconnected")


# Initialize on import
db = Database()