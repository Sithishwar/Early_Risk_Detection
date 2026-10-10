import cv2
import numpy as np


def resize_frame(frame, size=(640, 640)):
    """
    Resize frame while keeping aspect ratio using padding.
    """
    h, w = frame.shape[:2]
    target_w, target_h = size

    scale = min(target_w / w, target_h / h)
    nw, nh = int(w * scale), int(h * scale)

    resized = cv2.resize(frame, (nw, nh))
    canvas = np.zeros((target_h, target_w, 3), dtype=np.uint8)

    x_offset = (target_w - nw) // 2
    y_offset = (target_h - nh) // 2
    canvas[y_offset:y_offset+nh, x_offset:x_offset+nw] = resized

    return canvas, scale, x_offset, y_offset


def normalize_frame(frame):
    """
    Normalize pixel values to [0,1].
    """
    return frame.astype(np.float32) / 255.0
