from fastapi import FastAPI, File, UploadFile
import cv2
import numpy as np
import io
from PIL import Image
from detection.scrfd import SCRFDDetector
from recognition.arcface import ArcFaceRecognizer
from anti_spoof.minifasnet import AntiSpoofingModel
from tracking.tracker import ByteTracker
from pipeline.fusion import ConfidenceFusionEngine

app = FastAPI(title="SmartAttend AI Microservice")

# Initialize models
detector = SCRFDDetector()
recognizer = ArcFaceRecognizer()
anti_spoof = AntiSpoofingModel()
tracker = ByteTracker()
fusion_engine = ConfidenceFusionEngine()

@app.get("/")
async def root():
    return {"message": "SmartAttend AI Microservice Active"}

@app.post("/analyze_frame")
async def analyze_frame(file: UploadFile = File(...)):
    # Read frame
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # 1. Detection
    faces = detector.detect(frame)
    if not faces:
        return {"success": False, "message": "No face detected"}
    
    results = []
    for face in faces:
        bbox = face['bbox']
        # Crop face
        face_crop = frame[int(bbox[1]):int(bbox[3]), int(bbox[0]):int(bbox[2])]
        if face_crop.size == 0:
            continue
            
        # 2. Anti-Spoofing
        spoof_score = anti_spoof.predict(face_crop)
        
        # 3. Recognition
        embedding = recognizer.get_embedding(face_crop)
        
        # 4. Tracking (Optional for single frame)
        track_score = 1.0 # default for now
        
        # 5. Fusion
        # For simplicity, returning embedding directly since comparison happens on node-side
        # but in a final system, the Python side should perform the matching for performance.
        fusion_result = fusion_engine.fuse(face['score'], spoof_score, track_score)
        
        results.append({
            "is_accepted": fusion_result['is_accepted'],
            "score": fusion_result['score'],
            "details": fusion_result['details'],
            "embedding": embedding.tolist(),
            "bbox": bbox
        })
    
    return {"success": True, "results": results}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
