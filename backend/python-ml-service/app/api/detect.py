from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import numpy as np
import cv2
import tempfile
import os

from app.vision.detector import detect_people, detect_objects, compute_risk_score
from app.schemas.response import DetectionResponse, VideoDetectionResponse

router = APIRouter(prefix="/detect", tags=["Detection"])


@router.post("/", response_model=DetectionResponse)
async def detect(file: UploadFile = File(...)):
    """
    Detect people in an uploaded image frame.
    """
    try:
        contents = await file.read()
        np_img = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

        if image is None:
            raise ValueError("Invalid image")

        people = detect_people(image)

        return {
            "count": len(people),
            "people": people
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/video", response_model=VideoDetectionResponse)
async def detect_video(file: UploadFile = File(...)):
    """
    Detect objects in an uploaded video and assess risk using YOLO.
    Processes every 30th frame for efficiency.
    """
    try:
        # Save uploaded video to temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_file:
            temp_file.write(await file.read())
            temp_path = temp_file.name

        cap = cv2.VideoCapture(temp_path)
        if not cap.isOpened():
            raise ValueError("Invalid video file")

        detections = []
        frame_count = 0
        total_people = 0
        max_people = 0
        risk_scores = []

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            frame_count += 1

            # Process every 30th frame to reduce computation
            if frame_count % 30 == 0:
                objects = detect_objects(frame)
                risk_score, people_count, vehicle_count = compute_risk_score(objects)
                people = [obj for obj in objects if obj['class'] == 'person']

                total_people += people_count
                max_people = max(max_people, people_count)
                risk_scores.append(risk_score)

                detections.append({
                    "count": people_count,
                    "people": people
                })

        cap.release()
        os.unlink(temp_path)  # Clean up temp file

        if not detections:
            raise ValueError("No frames processed")

        avg_people = total_people / len(detections)
        avg_risk = sum(risk_scores) / len(risk_scores)

        # Determine risk level based on average risk score
        if avg_risk >= 0.7:
            risk_level = "high"
        elif avg_risk >= 0.3:
            risk_level = "medium"
        else:
            risk_level = "low"

        return {
            "total_frames": frame_count,
            "average_people_count": avg_people,
            "max_people_count": max_people,
            "risk_level": risk_level,
            "detections": detections
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
