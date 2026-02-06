import numpy as np
from tensorflow.keras.models import load_model


MODEL_PATH = "app/models/crowd_lstm.h5"
WINDOW_SIZE = 10

_model = None


def _load_model():
    global _model
    if _model is None:
        _model = load_model(MODEL_PATH)
    return _model


def predict_density(history):
    """
    Predict next density value.

    history: list[float]
    """
    if len(history) < WINDOW_SIZE:
        return float(np.mean(history)) if history else 0.0

    history = np.array(history[-WINDOW_SIZE:]).reshape((1, WINDOW_SIZE, 1))
    model = _load_model()

    prediction = model.predict(history, verbose=0)
    return float(prediction[0][0])
