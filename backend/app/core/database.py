# app/core/database.py
import urllib.parse
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

def get_safe_uri(uri: str) -> str:
    try:
        if "@" in uri and "://" in uri:
            protocol, rest = uri.split("://", 1)
            # Split from the right to handle special characters like '@' in passwords
            credentials, host = rest.rsplit("@", 1)
            if ":" in credentials:
                username, password = credentials.split(":", 1)
                username_escaped = urllib.parse.quote_plus(username)
                password_escaped = urllib.parse.quote_plus(password)
                return f"{protocol}://{username_escaped}:{password_escaped}@{host}"
    except Exception:
        pass
    return uri

safe_mongodb_uri = get_safe_uri(settings.MONGODB_URI)
client = AsyncIOMotorClient(safe_mongodb_uri)

db = client.skill_mirror_db

users_collection = db.users
profiles_collection = db.profiles
evaluations_collection = db.evaluations

async def test_db_connection():
    try:
        await client.admin.command('ping')
        print("✅ MongoDB Atlas connection successful!")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")