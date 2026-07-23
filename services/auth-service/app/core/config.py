from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Auth Service"
    DEBUG: bool = False
    DATABASE_URL: str = "postgresql://app_user:password@localhost:5432/app_main"
    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:3001"]

    class Config:
        env_file = ".env"


settings = Settings()
