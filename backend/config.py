import os

class Settings:
    PROJECT_NAME: str = "DataPilot"
    VERSION: str = "1.0.0-phase1"
    API_PREFIX: str = "/api"
    MAX_UPLOAD_SIZE_MB: int = 50
    STORAGE_DIR: str = os.path.join(os.path.dirname(os.path.abspath(__file__)), "storage")
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

settings = Settings()
os.makedirs(settings.STORAGE_DIR, exist_ok=True)
