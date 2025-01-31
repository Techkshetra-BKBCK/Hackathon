import numpy as np
import pickle
from sklearn.ensemble import IsolationForest

MODEL_PATH = "model.pkl"

def train_model():
    data = np.array([
        [500, 1000, 1200, 50],     # Normal Traffic
        [5000, 15000, 16000, 400], # Threat Traffic
        [200, 1000, 1100, 60],     # Normal Traffic
        [300, 1000, 1200, 50]      # Normal Traffic
    ])
    
    model = IsolationForest(contamination=0.25)
    model.fit(data)

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)

    print("✅ Model trained and saved.")

if __name__ == "__main__":
    train_model()
