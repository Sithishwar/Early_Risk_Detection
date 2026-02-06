from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense


def build_lstm_model(input_shape):
    """
    Build and compile LSTM model.

    input_shape: (timesteps, features)
    """
    model = Sequential()
    model.add(LSTM(64, input_shape=input_shape))
    model.add(Dense(1))

    model.compile(
        optimizer="adam",
        loss="mean_squared_error"
    )

    return model
