from pydantic import BaseModel
from typing import List


class Person(BaseModel):
    x: int
    y: int
    width: int
    height: int


class DetectionResponse(BaseModel):
    count: int
    people: List[Person]
