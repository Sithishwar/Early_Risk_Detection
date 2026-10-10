import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).resolve().parent

# YOLO Configuration
YOLO_MODEL_PATH = os.getenv("YOLO_MODEL_PATH", "yolo11n.pt")
YOLO_CONFIDENCE_THRESHOLD = float(os.getenv("YOLO_CONFIDENCE_THRESHOLD", "0.5"))

# ByteTrack Configuration
# "bytetrack.yaml" is shipped inside the ultralytics package itself, so no
# extra file is needed here. Override with a path to a custom tracker yaml
# (e.g. tuned match/track thresholds) via the env var if you need to.
TRACKER_CONFIG = os.getenv("TRACKER_CONFIG", "bytetrack.yaml")

# COCO class ids used for detection
PERSON_CLASS_ID = 0
VEHICLE_CLASS_IDS = [2, 3, 5, 7]  # car, motorcycle, bus, truck

# Video Processing Configuration
FRAME_SAMPLING_RATE = int(os.getenv("FRAME_SAMPLING_RATE", "30"))

# Risk Thresholds
RISK_THRESHOLDS = {
    "low": float(os.getenv("RISK_LOW_THRESHOLD", "0.3")),
    "medium": float(os.getenv("RISK_MEDIUM_THRESHOLD", "0.7")),
    "high": float(os.getenv("RISK_HIGH_THRESHOLD", "0.75")),
}

# Server Configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

# ML Service URL (for health checks)
ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "http://localhost:8000")
