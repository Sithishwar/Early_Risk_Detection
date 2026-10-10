"""
Computer-vision core for the ML service.

Detection uses Ultralytics YOLO. Multi-object tracking uses ByteTrack,
which ships inside the `ultralytics` package, so the same person keeps a
stable track ID across frames. That ID is what lets the Node.js risk
engine compute real per-person displacement/speed instead of guessing
based on array position (which breaks the moment detection order changes
between frames or someone leaves/enters the scene).

Equivalent to:
    from ultralytics import YOLO
    model = YOLO("yolo11n.pt")
    results = model.track(
        source="video.mp4",
        tracker="bytetrack.yaml",
        classes=[0],
        persist=True,
    )
"""
import threading
from typing import Dict, Generator, List, Optional, Tuple

from ultralytics import YOLO

from app.config import (
    PERSON_CLASS_ID,
    TRACKER_CONFIG,
    VEHICLE_CLASS_IDS,
    YOLO_CONFIDENCE_THRESHOLD,
    YOLO_MODEL_PATH,
)

_model: Optional[YOLO] = None
_model_lock = threading.Lock()


def get_model() -> YOLO:
    """
    Lazily load (and cache) the YOLO model.

    Loading weights is the slow part (and, on first run, may download the
    .pt file), so this is done once per process rather than once per
    request. Safe to call concurrently from multiple requests.
    """
    global _model
    if _model is None:
        with _model_lock:
            if _model is None:
                _model = YOLO(YOLO_MODEL_PATH)
    return _model


def _box_to_person(box, track_id: Optional[int] = None) -> Dict:
    x1, y1, x2, y2 = [float(v) for v in box.xyxy[0].tolist()]
    return {
        "id": track_id,
        "class": "person",
        "confidence": float(box.conf[0]),
        "x": int(x1),
        "y": int(y1),
        "width": int(x2 - x1),
        "height": int(y2 - y1),
    }


def detect_people(frame) -> List[Dict]:
    """
    Single-frame person detection (plain YOLO, no tracking).

    Used for one-off image uploads where there's no "next frame" for a
    track ID to be meaningful.
    """
    model = get_model()
    results = model.predict(
        source=frame,
        classes=[PERSON_CLASS_ID],
        conf=YOLO_CONFIDENCE_THRESHOLD,
        verbose=False,
    )

    people = []
    for r in results:
        boxes = r.boxes
        if boxes is None:
            continue
        for box in boxes:
            people.append(_box_to_person(box))
    return people


def detect_objects(frame) -> List[Dict]:
    """
    Detect people + vehicles in a single frame.

    Used by the legacy /detect/video endpoint, which reports a simple
    per-video risk heuristic and doesn't need track IDs.
    """
    model = get_model()
    classes = [PERSON_CLASS_ID, *VEHICLE_CLASS_IDS]
    results = model.predict(
        source=frame,
        classes=classes,
        conf=YOLO_CONFIDENCE_THRESHOLD,
        verbose=False,
    )

    objects = []
    for r in results:
        boxes = r.boxes
        if boxes is None:
            continue
        for box in boxes:
            x1, y1, x2, y2 = [float(v) for v in box.xyxy[0].tolist()]
            cls_id = int(box.cls[0])
            cls_name = "person" if cls_id == PERSON_CLASS_ID else "vehicle"
            objects.append({
                "class": cls_name,
                "confidence": float(box.conf[0]),
                "x": int(x1),
                "y": int(y1),
                "width": int(x2 - x1),
                "height": int(y2 - y1),
            })
    return objects


def compute_risk_score(objects: List[Dict]) -> Tuple[float, int, int]:
    """
    Simple heuristic risk score for the legacy /detect/video endpoint.

    Kept for backward compatibility only. The real, methodology-driven
    risk score (density + movement speed + LSTM forecast) is computed
    downstream by the Node.js risk engine using /detect/video/frames.
    """
    people_count = sum(1 for o in objects if o["class"] == "person")
    vehicle_count = sum(1 for o in objects if o["class"] == "vehicle")

    risk_score = (
        min(people_count / 20.0, 1.0) * 0.8
        + min(vehicle_count / 10.0, 1.0) * 0.2
    )
    return risk_score, people_count, vehicle_count


def track_video(video_path: str) -> Generator[Tuple[int, List[Dict]], None, None]:
    """
    Run YOLO + ByteTrack over an entire video in one streaming pass.

    Tracking runs on EVERY frame (ByteTrack needs consecutive frames to
    keep IDs stable) and yields, for each frame:

        (frame_index, [ {id, class, confidence, x, y, width, height}, ... ])

    `stream=True` makes ultralytics hand back a generator instead of
    buffering every frame's results in memory, so this works fine on long
    videos. Callers that only want every Nth frame (frame-sampling) should
    filter the yielded frame_index themselves -- tracking itself must not
    skip frames, only the caller's consumption of the output should.
    """
    model = get_model()
    stream = model.track(
        source=video_path,
        tracker=TRACKER_CONFIG,
        classes=[PERSON_CLASS_ID],
        conf=YOLO_CONFIDENCE_THRESHOLD,
        persist=True,
        stream=True,
        verbose=False,
    )

    frame_index = 0
    for result in stream:
        frame_index += 1
        people = []
        boxes = result.boxes
        if boxes is not None:
            for box in boxes:
                track_id = int(box.id[0]) if box.id is not None else None
                people.append(_box_to_person(box, track_id=track_id))
        yield frame_index, people
