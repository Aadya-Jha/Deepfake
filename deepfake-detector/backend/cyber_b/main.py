# file: backend/cyber_b/main.py
import os
import tempfile
import hashlib
import json
import sqlite3
import datetime
import subprocess
from pathlib import Path
from typing import Optional

import requests
from fastapi import FastAPI, UploadFile, File, HTTPException, Header, BackgroundTasks
from fastapi.responses import JSONResponse

MODEL_API_URL = os.getenv("MODEL_API_URL", "http://127.0.0.1:5000/predict")
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", 50 * 1024 * 1024))
DB_PATH = os.getenv("DB_PATH", "cyber_b_logs.db")
ALLOWED_EXT = {".mp4", ".mov", ".mkv", ".webm"}
FLAG_THRESHOLD = float(os.getenv("FLAG_THRESHOLD", 0.6))
WRAPPER_API_KEY = os.getenv("WRAPPER_API_KEY", "wrapper-test-key")

app = FastAPI(title="Cyber B - Defense Wrapper")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
    CREATE TABLE IF NOT EXISTS detection_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT,
        checksum TEXT,
        client_ip TEXT,
        size_bytes INTEGER,
        width INTEGER,
        height INTEGER,
        duration_seconds REAL,
        model_name TEXT,
        model_version TEXT,
        prob_real REAL,
        prob_fake REAL,
        flagged INTEGER,
        explain_path TEXT,
        metadata JSON,
        created_at TEXT
    )
    """)
    conn.commit()
    conn.close()

init_db()

def sha256_of_bytes(data: bytes) -> str:
    h = hashlib.sha256()
    h.update(data)
    return h.hexdigest()

def save_temp_file(data: bytes, suffix: str = ".mp4") -> str:
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    tmp.write(data)
    tmp.close()
    return tmp.name

def probe_video(path: str) -> dict:
    try:
        cmd = [
            "ffprobe", "-v", "error",
            "-select_streams", "v:0",
            "-show_entries", "stream=width,height,duration,codec_name",
            "-print_format", "json", path
        ]
        p = subprocess.run(cmd, capture_output=True, text=True)
        if p.returncode == 0 and p.stdout:
            info = json.loads(p.stdout)
            stream = info.get("streams", [{}])[0]
            return {
                "width": int(stream.get("width") or 0),
                "height": int(stream.get("height") or 0),
                "duration": float(stream.get("duration") or 0.0),
                "codec": stream.get("codec_name")
            }
    except Exception:
        pass
    return {"width": 0, "height": 0, "duration": 0.0, "codec": None}

def call_model_api(file_path: str, timeout: int = 30) -> dict:
    headers = {"x-api-key": os.getenv("MODEL_API_KEY", "")}
    with open(file_path, "rb") as fh:
        resp = requests.post(MODEL_API_URL, files={"file": fh}, headers=headers, timeout=timeout)
    resp.raise_for_status()
    return resp.json()

def insert_log(record: dict):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
      INSERT INTO detection_logs
        (filename, checksum, client_ip, size_bytes, width, height, duration_seconds,
         model_name, model_version, prob_real, prob_fake, flagged, explain_path, metadata, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        record.get("filename"),
        record.get("checksum"),
        record.get("client_ip"),
        record.get("size_bytes"),
        record.get("width"),
        record.get("height"),
        record.get("duration_seconds"),
        record.get("model_name"),
        record.get("model_version"),
        record.get("prob_real"),
        record.get("prob_fake"),
        1 if record.get("flagged") else 0,
        record.get("explain_path"),
        json.dumps(record.get("metadata") or {}),
        record.get("created_at")
    ))
    conn.commit()
    conn.close()

RATE_LIMIT = int(os.getenv("RATE_LIMIT", 20))
_seen = {}

def check_rate_limit(client_ip: Optional[str]):
    if client_ip is None:
        return
    _seen.setdefault(client_ip, 0)
    _seen[client_ip] += 1
    if _seen[client_ip] > RATE_LIMIT:
        raise HTTPException(status_code=429, detail="Rate limit exceeded (dev limiter)")

@app.post("/analyze")
async def analyze(file: UploadFile = File(...), x_api_key: Optional[str] = Header(None), background_tasks: BackgroundTasks = None):
    if x_api_key != WRAPPER_API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized wrapper client")

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty file")

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large")

    suffix = Path(file.filename).suffix.lower()
    if suffix not in ALLOWED_EXT:
        raise HTTPException(status_code=400, detail=f"Unsupported file extension: {suffix}")

    client_ip = "local"
    check_rate_limit(client_ip)

    checksum = sha256_of_bytes(contents)
    tmp_path = save_temp_file(contents, suffix=suffix)

    try:
        meta = probe_video(tmp_path)
    except Exception:
        meta = {"width": 0, "height": 0, "duration": 0.0}

    try:
        model_resp = call_model_api(tmp_path)
    except requests.RequestException as e:
        os.remove(tmp_path)
        raise HTTPException(status_code=502, detail=f"Model API call failed: {e}")

    prob_real = float(model_resp.get("prob_real", 0.0))
    prob_fake = float(model_resp.get("prob_fake", 1.0 - prob_real))
    flagged = prob_fake >= FLAG_THRESHOLD

    record = {
        "filename": file.filename,
        "checksum": checksum,
        "client_ip": client_ip,
        "size_bytes": len(contents),
        "width": int(meta.get("width") or 0),
        "height": int(meta.get("height") or 0),
        "duration_seconds": float(meta.get("duration") or 0.0),
        "model_name": model_resp.get("model_name"),
        "model_version": model_resp.get("model_version"),
        "prob_real": prob_real,
        "prob_fake": prob_fake,
        "flagged": flagged,
        "explain_path": model_resp.get("explainability_path"),
        "metadata": {"model_response": model_resp},
        "created_at": datetime.datetime.utcnow().isoformat()
    }
    background_tasks.add_task(insert_log, record)
    os.remove(tmp_path)

    if flagged:
        print(f"[ALERT] Flagged file {file.filename} prob_fake={prob_fake:.3f}")

    return JSONResponse({"status": "ok", "flagged": flagged, "prob_fake": prob_fake, "model": model_resp})
