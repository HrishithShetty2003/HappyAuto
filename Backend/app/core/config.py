import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "HappyAuto"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # CORS
    BACKEND_CORS_ORIGINS = ["http://localhost:3000", "http://localhost:3001"]
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./happyauto.db")
    
    # App Settings
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # File Upload
    MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024  # 5MB
    
    # External APIs
    GOOGLE_MAPS_API_KEY: str = os.getenv("GOOGLE_MAPS_API_KEY", "")
    
    @property
    def is_sqlite(self):
        return self.DATABASE_URL.startswith("sqlite")

settings = Settings()