import os

class Config:
    MONGO_URI = os.getenv("MONGO_URI")
    AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
    AZURE_OPENAI_KEY = os.getenv("AZURE_OPENAI_KEY")
    PLATFORM_OPENAI_KEY = os.getenv("PLATFORM_OPENAI_KEY")
