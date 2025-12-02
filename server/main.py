from __future__ import annotations

import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from server.config import get_settings
from server.schemas import ForecastRequest, ForecastResponse, HealthResponse
from server.services.forecast import ForecastService, ModelNotReadyError

logger = logging.getLogger("powergrid.api")
settings = get_settings()
service = ForecastService(settings)

app = FastAPI(
    title="POWERGRID Forecast API",
    version="0.1.0",
    description="REST API that hosts the POWERGRID multi-output material demand model",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.cors_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    return HealthResponse(
        model_ready=service.is_ready,
        model_path=str(settings.model_path),
        feature_count=len(service.feature_names),
        output_count=len(service.output_labels) if service.output_labels else None,
        last_error=str(service.load_error) if service.load_error else None,
    )


@app.post(f"{settings.api_prefix}/forecast", response_model=ForecastResponse)
async def create_forecast(request: ForecastRequest) -> ForecastResponse:
    try:
        return service.generate_forecast(request)
    except ModelNotReadyError as exc:
        logger.warning("Forecast requested while model unavailable")
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - runtime protection
        logger.exception("Forecast generation failed", exc_info=exc)
        raise HTTPException(status_code=500, detail="Failed to generate forecast") from exc
