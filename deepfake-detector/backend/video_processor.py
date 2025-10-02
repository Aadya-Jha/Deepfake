# file: backend/video_processor.py
import cv2
from PIL import Image

def extract_frames(video_path, frame_rate=1):
    """
    Extract frames from a video file.

    Args:
        video_path (str): Path to the video file.
        frame_rate (int): Number of frames to skip between extractions (1 = 1 frame per second).

    Returns:
        List of PIL Images
    """
    frames = []
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        print(f"Error opening video file {video_path}")
        return frames

    fps = cap.get(cv2.CAP_PROP_FPS)
    interval = int(fps * frame_rate)  # how many frames to skip

    count = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if count % interval == 0:
            # Convert BGR (OpenCV) to RGB (PIL)
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil_image = Image.fromarray(frame_rgb)
            frames.append(pil_image)

        count += 1

    cap.release()
    return frames
