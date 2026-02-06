from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import numpy as np
import cv2

from app.vision.detector import detect_people
from app.schemas.response import DetectionResponse

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
