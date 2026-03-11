from pydantic import BaseModel
from typing import List


class Person(BaseModel):
    x: int
    y: int
    width: int
    height: int
    confidence: float = None  # Optional for backward compatibility


class DetectionResponse(BaseModel):
    count: int
    people: List[Person]


class VideoDetectionResponse(BaseModel):
    total_frames: int
    average_people_count: float
    max_people_count: int
    risk_level: str  # e.g., "low", "medium", "high"
    detections: List[DetectionResponse]  # List of detections per frame
