import os
import secrets

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Auth Service"
    DEBUG: bool = False
    DATABASE_URL: str = ""
    JWT_SECRET: str = ""
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:3001"]

    class Config:
        env_file = ".env"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.DATABASE_URL:
            raise ValueError("DATABASE_URL environment variable is required")
        if not self.JWT_SECRET:
            self.JWT_SECRET = secrets.token_hex(32)
            print("WARNING: No JWT_SECRET set. Using random secret (tokens won't survive restart).")


settings = Settings()
