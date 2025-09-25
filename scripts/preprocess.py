import os
import cv2

# ===== Paths =====
BASE_DIR = r"C:\Users\HP\OneDrive\Desktop\Projects\deepfake\deepfake_Dataset"  # raw dataset
OUTPUT_BASE = r"C:\Users\HP\OneDrive\Desktop\Projects\deepfake\processed"  # where processed images will go

# ===== Settings =====
IMG_SIZE = (224, 224)  # target size for all images
FOLDERS = ["train", "validation", "test"]  # dataset splits
CLASSES = ["fake", "real"]  # class folders

# ===== Function to process images =====
def process_images(input_folder, output_folder):
    os.makedirs(output_folder, exist_ok=True)
    for filename in os.listdir(input_folder):
        if filename.endswith(".jpg") or filename.endswith(".png"):
            img_path = os.path.join(input_folder, filename)
            img = cv2.imread(img_path)
            if img is None:
                continue  # skip corrupted images
            resized = cv2.resize(img, IMG_SIZE)
            out_path = os.path.join(output_folder, filename)
            cv2.imwrite(out_path, resized)
            print(f"Processed {filename}")

# ===== Main loop =====
for folder in FOLDERS:
    for cls in CLASSES:
        input_path = os.path.join(BASE_DIR, folder, cls)
        output_path = os.path.join(OUTPUT_BASE, folder, cls)
        process_images(input_path, output_path)

print("✅ Full preprocessing done for train, validation, and test sets.")
