import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    PROJECT_NAME: str = "Skill Mirror API"
    VERSION: str = "1.0.0"

    # 🔹 AI
    SEGMIND_API_KEY: str = os.getenv("SEGMIND_API_KEY", "")


settings = Settings()