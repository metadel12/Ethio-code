from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "EthioCode API"
    DATABASE_URL: str = "sqlite:///./ethiocode.db"
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "ethiocode"
    SECRET_KEY: str = "change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440        # 24 hour access token
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30            # 30 day refresh token
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    # Rate limiting (requests per minute)
    RATE_LIMIT_DEFAULT: int = 100
    RATE_LIMIT_AUTH: int = 20
    RATE_LIMIT_UPLOAD: int = 30
    RATE_LIMIT_API: int = 300

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
