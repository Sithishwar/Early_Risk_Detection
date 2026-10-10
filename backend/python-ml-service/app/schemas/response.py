from pydantic import BaseModel
from typing import List, Optional


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


class PersonPoint(BaseModel):
    """
    A tracked person's centroid in pixel space (for zone mapping).

    `id` is the ByteTrack persistent track ID for this person, stable
    across frames. The Node.js risk engine uses it to match the SAME
    person between frames when computing movement speed, instead of
    assuming array position means the same person (it doesn't).
    """
    id: Optional[int] = None
    x: int
    y: int


class FrameSample(BaseModel):
    frame_index: int
    timestamp: float  # seconds, derived from fps
    people: List[PersonPoint]


class VideoFramesResponse(BaseModel):
    """
    Raw per-frame person detections for an uploaded video.

    Intentionally does NOT compute density/risk here — that stays in the
    Node.js risk engine so this service remains a pure detection/forecast
    microservice (see methodology: "Node.js calculates density... this is
    deterministic and does not require ML").
    """
    fps: float
    frame_width: int
    frame_height: int
    total_frames: int
    sampled_every: int
    samples: List[FrameSample]