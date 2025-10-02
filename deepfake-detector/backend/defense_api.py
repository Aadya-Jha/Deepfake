from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
import shutil
import os
import uuid
from video_processor.video_processor import extract_frames
from model_loader import DeepfakeDetector  # make sure your model code is in model_loader.py

# Initialize FastAPI
app = FastAPI(title="Defense API", description="Deepfake detection API", version="1.0")

# Load your trained model
MODEL_PATH = "your_model.pth"  # <-- put the path to your teammate's trained model here
detector = DeepfakeDetector(model_path=MODEL_PATH)

# Temporary folder for uploaded videos
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
def root():
    return {"message": "Defense API is running!"}

@app.post("/analyze")
async def analyze_video(file: UploadFile = File(...)):
    """
    Analyze an uploaded video file for deepfake detection.
    Returns the overall verdict and per-frame predictions.
    """
    # Save uploaded video temporarily
    temp_filename = f"{uuid.uuid4().hex}_{file.filename}"
    temp_filepath = os.path.join(UPLOAD_DIR, temp_filename)
    
    with open(temp_filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Extract frames from video
    frames = extract_frames(temp_filepath, frame_rate=1)  # 1 frame per second
    if not frames:
        return JSONResponse(
            status_code=400,
            content={"error": "Could not extract frames from video."}
        )

    # Predict each frame
    frame_results = detector.predict_frames(frames)
    
    # Compute average probability of real
    avg_prob_real = sum([res['confidence'] if res['prediction']=="Real" else 1-res['confidence'] for res in frame_results]) / len(frame_results)
    verdict = "Real" if avg_prob_real > 0.5 else "Fake"

    # Optional: log results (here just printing, can save to DB)
    print(f"Video: {file.filename}, Verdict: {verdict}, Avg Probability Real: {avg_prob_real:.3f}")

    # Clean up uploaded video
    os.remove(temp_filepath)

    return {
        "video_filename": file.filename,
        "verdict": verdict,
        "avg_prob_real": round(avg_prob_real, 3),
        "frames_analyzed": len(frame_results),
        "frame_results": frame_results  # optional, can remove if too large
    }
