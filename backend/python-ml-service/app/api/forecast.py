from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

from app.forecasting.predict import predict_density

router = APIRouter(prefix="/forecast", tags=["Forecast"])


class ForecastRequest(BaseModel):
    zoneId: str
    history: List[float]


class ForecastResponse(BaseModel):
    zoneId: str
    predictedDensity: float


@router.post("/", response_model=ForecastResponse)
async def forecast(request: ForecastRequest):
    """
    Predict future crowd density for a zone.
    """
    try:
        prediction = predict_density(request.history)

        return {
            "zoneId": request.zoneId,
            "predictedDensity": prediction
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
