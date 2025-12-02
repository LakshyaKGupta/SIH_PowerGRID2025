from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class ForecastFeatures(BaseModel):
    project_category_main: str
    project_type: str
    project_budget_price_in_lake: float
    state: str
    terrain: str
    distance_from_storage_unit: float = Field(..., alias="Distance_from_Storage_unit")
    transmission_line_length_km: float

    def to_frame_payload(self, required_order: Optional[List[str]] = None) -> Dict[str, float | str]:
        values = self.model_dump(by_alias=True)
        if required_order:
            return {name: values.get(name) for name in required_order}
        return values


class ForecastRequest(BaseModel):
    project_name: str
    scenario: Optional[str] = None
    features: ForecastFeatures
    metadata: Dict[str, str | float | int | None] = Field(default_factory=dict)


class ForecastOutput(BaseModel):
    label: str
    value: float
    unit: str = "units"


class ForecastResponse(BaseModel):
    forecast_id: str
    generated_at: datetime
    project_name: str
    features_used: Dict[str, float | str]
    outputs: List[ForecastOutput]
    model_ready: bool = True


class HealthResponse(BaseModel):
    status: str = "ok"
    model_ready: bool
    model_path: str
    feature_count: int
    output_count: Optional[int] = None
    last_error: Optional[str] = None
