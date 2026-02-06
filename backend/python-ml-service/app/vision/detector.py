import cv2
from app.vision.preprocess import resize_frame


# Initialize detector once (module-level)
hog = cv2.HOGDescriptor()
hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())


def detect_people(frame):
    """
    Detect people in a frame.
    Returns list of bounding boxes.
    """
    processed, scale, x_offset, y_offset = resize_frame(frame)

    boxes, _ = hog.detectMultiScale(
        processed,
        winStride=(8, 8),
        padding=(8, 8),
        scale=1.05
    )

    people = []
    for (x, y, w, h) in boxes:
        people.append({
            "x": int((x - x_offset) / scale),
            "y": int((y - y_offset) / scale),
            "width": int(w / scale),
            "height": int(h / scale)
        })

    return people
