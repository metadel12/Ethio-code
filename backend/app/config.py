# app/config.py
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional


class Settings(BaseSettings):
    # ==================== PROJECT INFO ====================
    PROJECT_NAME: str = "EthioCode API"
    PROJECT_VERSION: str = "2.0.0"
    PROJECT_DESCRIPTION: str = "Ethiopian Coding Platform API - Empowering Ethiopian Developers"
    
    # ==================== DATABASES ====================
    # SQLite (for existing features)
    DATABASE_URL: str = "sqlite:///./ethiocode.db"
    
    # MongoDB (for new features)
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "ethiocode"
    DATABASE_NAME: str = "ethiocode"  # Alias for MONGODB_DB_NAME
    
    # Redis (for caching and rate limiting)
    REDIS_URL: str = "redis://localhost:6379"
    
    # ==================== SECURITY ====================
    SECRET_KEY: str = "change-me-in-production-use-strong-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440        # 24 hour access token
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30            # 30 day refresh token
    
    # ==================== CORS ====================
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:8001",
        "http://127.0.0.1:8001",
        "https://ethiocode.com",
        "https://www.ethiocode.com",
        "https://api.ethiocode.com",
    ]
    
    # ==================== RATE LIMITING ====================
    RATE_LIMIT_DEFAULT: int = 100      # requests per minute
    RATE_LIMIT_AUTH: int = 20          # login/register attempts
    RATE_LIMIT_UPLOAD: int = 30        # file uploads
    RATE_LIMIT_API: int = 300          # API calls
    
    # ==================== APP SETTINGS ====================
    APP_NAME: str = "EthioCode Backend Interview API"
    APP_ENV: str = "development"       # development, staging, production
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"
    
    # ==================== OPENAI / AI ====================
    OPENAI_API_KEY: str = "your-openai-api-key"
    OPENAI_MODEL: str = "gpt-3.5-turbo"
    
    # ==================== CODE EXECUTION ====================
    CODE_EXECUTION_TIMEOUT: int = 10   # seconds
    MAX_CODE_LENGTH: int = 5000        # characters
    
    # ==================== FILE UPLOADS ====================
    MAX_FILE_SIZE_MB: int = 10
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    ALLOWED_DOCUMENT_TYPES: List[str] = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    
    # ==================== EMAIL ====================
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "noreply@ethiocode.com"
    EMAIL_FROM_NAME: str = "EthioCode"
    
    # ==================== CLOUD STORAGE ====================
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""
    
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "us-east-1"
    AWS_S3_BUCKET: str = "ethiocode-assets"
    
    # ==================== PAYMENTS ====================
    STRIPE_SECRET_KEY: str = ""
    STRIPE_PUBLIC_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    
    TELEBIRR_API_KEY: str = ""
    TELEBIRR_SECRET_KEY: str = ""
    CBE_BIRR_API_KEY: str = ""
    
    # ==================== WEBSOCKET ====================
    WEBSOCKET_MAX_CONNECTIONS: int = 1000
    WEBSOCKET_PING_INTERVAL: int = 20
    WEBSOCKET_PING_TIMEOUT: int = 60
    
    # ==================== WEBRTC / VIDEO ====================
    TURN_SERVER_URL: str = "turn:turn.ethiocode.com:3478"
    TURN_USERNAME: str = ""
    TURN_CREDENTIAL: str = ""
    
    # ==================== PROCTORING ====================
    PROCTORING_MAX_VIOLATIONS: int = 3
    PROCTORING_SCREENSHOT_INTERVAL: int = 10  # seconds
    PROCTORING_AI_CONFIDENCE_THRESHOLD: float = 0.7
    
    # ==================== MONITORING ====================
    SENTRY_DSN: str = ""
    PROMETHEUS_ENABLED: bool = True
    
    # ==================== CACHING ====================
    CACHE_TTL_DEFAULT: int = 300      # 5 minutes
    CACHE_TTL_STATS: int = 30         # 30 seconds
    CACHE_TTL_LEADERBOARD: int = 60   # 1 minute
    
    # ==================== FEATURE FLAGS ====================
    ENABLE_AI_FEATURES: bool = True
    ENABLE_VIDEO_CHAT: bool = True
    ENABLE_PROCTORING: bool = True
    ENABLE_PAYMENTS: bool = False
    ENABLE_EMAIL_NOTIFICATIONS: bool = True
    
    # ==================== COMPANY SPECIFIC ====================
    ETHIOPIAN_COMPANIES: List[str] = [
        "Chapa", "Safaricom Ethiopia", "Dashen Bank", "Ethio Telecom",
        "Kifiya", "Awash Bank", "Bank of Abyssinia", "BelCash", "Addis Software"
    ]
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )
    
    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_debug(cls, value):
        if isinstance(value, str) and value.lower() in {"release", "prod", "production", "false"}:
            return False
        return value
    
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, value):
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",")]
        return value
    
    @property
    def is_production(self) -> bool:
        """Check if running in production mode"""
        return self.APP_ENV.lower() in ["production", "prod"]
    
    @property
    def is_development(self) -> bool:
        """Check if running in development mode"""
        return self.APP_ENV.lower() in ["development", "dev"]
    
    @property
    def mongo_url(self) -> str:
        """Get MongoDB URL (alias for compatibility)"""
        return self.MONGODB_URL
    
    @property
    def mongo_db_name(self) -> str:
        """Get MongoDB database name (alias for compatibility)"""
        return self.MONGODB_DB_NAME


# Create settings instance
settings = Settings()


# Helper function to get settings
def get_settings() -> Settings:
    """Dependency for FastAPI to get settings"""
    return settings