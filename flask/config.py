import os

class Config:
    MONGO_URI = os.getenv("MONGO_URI")
    AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
    AZURE_OPENAI_KEY = os.getenv("AZURE_OPENAI_KEY")
    PLATFORM_OPENAI_KEY = os.getenv("PLATFORM_OPENAI_KEY")
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
    SESSION_COOKIE_DOMAIN = None  # Let Flask auto-set based on request host
    SESSION_COOKIE_SAMESITE = "Lax"  # Good default for same-origin
    SESSION_COOKIE_SECURE = True     # Required for HTTPS
