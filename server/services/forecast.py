from __future__ import annotations

import logging
from datetime import datetime
from typing import Dict, List
from uuid import uuid4

import joblib
import numpy as np
import pandas as pd

from server.config import Settings
from server.schemas import ForecastOutput, ForecastRequest, ForecastResponse

logger = logging.getLogger(__name__)


class ModelNotReadyError(RuntimeError):
    """Raised when a forecast is requested but the model failed to load."""


def _patch_sklearn_column_transformer() -> None:
    """Inject compatibility shims so pickles created with sklearn<=1.6 load on 1.7."""

    try:
        from sklearn.compose import _column_transformer  # type: ignore
    except Exception as exc:  # pragma: no cover - import-time issues
        logger.exception("Failed to import sklearn.compose column transformer", exc_info=exc)
        return

    if not hasattr(_column_transformer, "_RemainderColsList"):
        exec("class _RemainderColsList(list):\n    pass\n", _column_transformer.__dict__)  # noqa: S102


class ForecastService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.pipeline = None
        self.feature_names: List[str] = []
        self.output_labels: List[str] = []
        self.load_error: Exception | None = None
        self._load_pipeline()

    @property
    def is_ready(self) -> bool:
        return self.pipeline is not None and self.load_error is None

    def _load_pipeline(self) -> None:
        _patch_sklearn_column_transformer()
        try:
            self.pipeline = joblib.load(self.settings.model_path)
            self.feature_names = list(getattr(self.pipeline, "feature_names_in_", []))
            raw_output_labels = getattr(self.pipeline, "output_names_", None)
            if raw_output_labels:
                self.output_labels = [str(name) for name in raw_output_labels]
            self.load_error = None
            logger.info("Loaded ML pipeline from %s", self.settings.model_path)
        except Exception as exc:  # pragma: no cover - depends on external artifact
            self.pipeline = None
            self.load_error = exc
            logger.exception("Unable to load ML pipeline", exc_info=exc)

    def _build_dataframe(self, request: ForecastRequest) -> pd.DataFrame:
        payload = request.features.to_frame_payload(self.feature_names or None)
        df = pd.DataFrame([payload])
        if self.feature_names:
            for column in self.feature_names:
                if column not in df.columns:
                    df[column] = 0
            df = df[self.feature_names]
        return df.fillna(0)

    def _predict_with_model(self, frame: pd.DataFrame) -> np.ndarray:
        if self.pipeline is None:
            raise ModelNotReadyError(str(self.load_error) if self.load_error else "Model not ready")
        predictions = self.pipeline.predict(frame)
        if isinstance(predictions, list):
            predictions = np.asarray(predictions)
        return np.atleast_1d(predictions).astype(float)

    def _fallback_predictions(self, payload: Dict[str, float | str]) -> np.ndarray:
        budget = float(payload.get("project_budget_price_in_lake", 0) or 0)
        line = float(payload.get("transmission_line_length_km", 0) or 0)
        distance = float(payload.get("Distance_from_Storage_unit", 0) or 0)
        base = max(budget, 1)
        factors = np.array([
            0.12 * base + line * 1.8,
            0.08 * base + line * 3.2,
            0.02 * base + distance * 0.4,
            0.05 * base + distance * 0.25,
        ])
        return np.maximum(factors, 1.0)

    def _material_labels(self, count: int) -> List[str]:
        if self.output_labels and len(self.output_labels) == count:
            return self.output_labels
        defaults = [
            "Steel Towers",
            "Conductors",
            "Insulator Strings",
            "Substation Equipment",
        ]
        if count <= len(defaults):
            return defaults[:count]
        return [f"Output {idx + 1}" for idx in range(count)]

    def generate_forecast(self, request: ForecastRequest) -> ForecastResponse:
        payload = request.features.to_frame_payload(self.feature_names or None)
        frame = self._build_dataframe(request)

        try:
            raw_predictions = self._predict_with_model(frame)
            predictions = raw_predictions[0] if raw_predictions.ndim > 1 else raw_predictions
        except ModelNotReadyError:
            if not self.settings.allow_model_fallback:
                raise
            logger.warning("Serving fallback forecast because model is unavailable")
            predictions = self._fallback_predictions(payload)
        except Exception as exc:  # pragma: no cover - defensive logging
            logger.exception("Model inference failed; switching to fallback", exc_info=exc)
            predictions = self._fallback_predictions(payload)

        if np.ndim(predictions) == 0:
            predictions = np.array([float(predictions)])

        labels = self._material_labels(int(np.size(predictions)))
        outputs = [
            ForecastOutput(label=label, value=float(predictions[idx]), unit="units")
            for idx, label in enumerate(labels)
        ]

        return ForecastResponse(
            forecast_id=str(uuid4()),
            generated_at=datetime.utcnow(),
            project_name=request.project_name,
            features_used=payload,
            outputs=outputs,
            model_ready=self.is_ready,
        )
