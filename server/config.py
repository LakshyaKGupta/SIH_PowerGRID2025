from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic import BaseModel, HttpUrl


class Settings(BaseModel):
    """Application configuration loaded from environment variables."""

    api_prefix: str = "/api"
    model_path: Path = Path(os.getenv("ML_MODEL_PATH", "server/models/multi_output_model.pkl"))
    cors_origins: List[str | HttpUrl] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        os.getenv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000"),
    ]
    allow_model_fallback: bool = os.getenv("ALLOW_MODEL_FALLBACK", "false").lower() in {"1", "true", "yes"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
