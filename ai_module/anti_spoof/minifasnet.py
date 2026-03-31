import cv2
import numpy as np
import onnxruntime as ort

import os

class AntiSpoofingModel:
    def __init__(self, model_path='models/minifasnet.onnx', device='cpu'):
        self.model_available = False
        if os.path.exists(model_path):
            try:
                self.session = ort.InferenceSession(model_path, providers=['CPUExecutionProvider'])
                self.input_name = self.session.get_inputs()[0].name
                self.model_available = True
            except Exception as e:
                print(f"Error loading anti-spoofing model: {e}")
        else:
            print(f"Anti-spoofing model not found at {model_path}. Liveness check will be skipped.")
            
        self.input_shape = [80, 80] # Standard for MiniFASNet

    def preprocess(self, face_img):
        # Resize face crop to 80x80
        face_img = cv2.resize(face_img, (80, 80))
        img_pre = face_img.astype(np.float32)
        # BGR (standard for MiniFASNet)
        img_pre = np.transpose(img_pre, (2, 0, 1))
        img_pre = np.expand_dims(img_pre, axis=0)
        return img_pre

    def predict(self, face_img):
        if not self.model_available:
            return 1.0 # Default to real if model is not loaded
            
        blob = self.preprocess(face_img)
        prediction = self.session.run(None, {self.input_name: blob})[0]
        # Softmax for prediction (probability of Real: 1, Fake: 0)
        exp = np.exp(prediction - np.max(prediction))
        probs = exp / np.sum(exp)
        real_prob = probs[0][1] # Probability of real face
        return real_prob

# Example Usage
if __name__ == "__main__":
    anti_spoof = AntiSpoofingModel()
    face_img = np.random.randint(0, 255, (80, 80, 3), dtype=np.uint8)
    real_prob = anti_spoof.predict(face_img)
    print(f"Liveness Probability: {real_prob}")
