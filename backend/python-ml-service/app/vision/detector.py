from ultralytics import YOLO
import cv2
from app.vision.preprocess import resize_frame

# Initialize YOLO model once (module-level)
model = YOLO('yolov8n.pt')  # Use nano model for speed; can change to yolov8s.pt or larger

def detect_objects(frame):
    """
    Detect objects in a frame using YOLO.
    Returns list of detected objects with bounding boxes and classes.
    """
    processed, scale, x_offset, y_offset = resize_frame(frame)

    # Run YOLO detection
    results = model(processed, conf=0.5)  # Confidence threshold

    objects = []
    for result in results:
        for box in result.boxes:
            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
            cls = int(box.cls[0].cpu().numpy())
            conf = float(box.conf[0].cpu().numpy())
            class_name = model.names[cls]

            # Scale back to original frame size
            x1_orig = int((x1 - x_offset) / scale)
            y1_orig = int((y1 - y_offset) / scale)
            x2_orig = int((x2 - x_offset) / scale)
            y2_orig = int((y2 - y_offset) / scale)

            objects.append({
                "class": class_name,
                "confidence": conf,
                "x": x1_orig,
                "y": y1_orig,
                "width": x2_orig - x1_orig,
                "height": y2_orig - y1_orig
            })

    return objects

def detect_people(frame):
    """
    Detect people in a frame (legacy function for compatibility).
    Returns list of bounding boxes for people.
    """
    objects = detect_objects(frame)
    people = [obj for obj in objects if obj['class'] == 'person']
    return people

def compute_risk_score(objects):
    """
    Compute a risk score based on detected objects.
    Risk factors: high number of people, presence of vehicles, etc.
    """
    people_count = sum(1 for obj in objects if obj['class'] == 'person')
    vehicle_count = sum(1 for obj in objects if obj['class'] in ['car', 'truck', 'bus', 'motorcycle'])

    # Simple risk formula: normalize people and vehicles
    risk = min((people_count / 10) + (vehicle_count / 5), 1.0)
    return risk, people_count, vehicle_count
