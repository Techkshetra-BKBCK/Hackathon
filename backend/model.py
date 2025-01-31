import numpy as np
import pickle
import os
from sklearn.ensemble import IsolationForest

MODEL_PATH = "model.pkl"

# Train and Save Model
def train_model():
    data = np.array([
        [500, 1000, 1200, 50],   # Normal
        [5000, 15000, 16000, 400],  # Threat
        [200, 1000, 1100, 60],
        [300, 1000, 1200, 50]
    ])
    model = IsolationForest(contamination=0.25)  # Adjust sensitivity
    model.fit(data)

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)

# Load Model and Detect Threats
def detect_threat(traffic_data):
    if not os.path.exists(MODEL_PATH):
        train_model()

    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)

    input_data = np.array([[traffic_data.packet_size, traffic_data.bytes_sent, traffic_data.bytes_received, traffic_data.latency]])
    prediction = model.predict(input_data)

    if prediction[0] == -1:
        return "Threat Detected", "Block IP"
    return "Normal Traffic", "No Action"
