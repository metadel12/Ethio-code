from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "EthioCode API"
    DATABASE_URL: str = "sqlite:///./ethiocode.db"
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "ethiocode"
    SECRET_KEY: str = "change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
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

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
