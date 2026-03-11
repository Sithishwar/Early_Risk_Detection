import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).resolve().parent

# YOLO Configuration
YOLO_MODEL_PATH = os.getenv("YOLO_MODEL_PATH", "yolov8n.pt")
YOLO_CONFIDENCE_THRESHOLD = float(os.getenv("YOLO_CONFIDENCE_THRESHOLD", "0.5"))

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
