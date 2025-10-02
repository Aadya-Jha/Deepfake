# file: backend/mock_model/main.py
from fastapi import FastAPI, UploadFile, File
import random
import time

app = FastAPI()

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    time.sleep(0.4)
    prob_fake = 0.8 if "fake" in file.filename.lower() else round(random.uniform(0.0, 0.4), 2)
    return {
        "model_name": "mock-model",
        "model_version": "v0",
        "prob_real": round(1.0 - prob_fake, 3),
        "prob_fake": prob_fake,
        "explainability_path": None
    }
