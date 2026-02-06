import numpy as np
from app.forecasting.lstm_model import build_lstm_model


WINDOW_SIZE = 10
MODEL_PATH = "app/models/crowd_lstm.h5"


def create_sequences(data, window_size):
    X, y = [], []
    for i in range(len(data) - window_size):
        X.append(data[i:i + window_size])
        y.append(data[i + window_size])
    return np.array(X), np.array(y)


def train_and_save(data):
    X, y = create_sequences(data, WINDOW_SIZE)
    X = X.reshape((X.shape[0], X.shape[1], 1))

    model = build_lstm_model((WINDOW_SIZE, 1))
    model.fit(X, y, epochs=10, batch_size=8)

    model.save(MODEL_PATH)
    print("Model saved to", MODEL_PATH)


if __name__ == "__main__":
    # Dummy data for testing
    dummy_density_data = np.random.rand(200)
    train_and_save(dummy_density_data)
