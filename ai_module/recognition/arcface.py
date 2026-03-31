import cv2
import numpy as np
import onnxruntime as ort

class ArcFaceRecognizer:
    def __init__(self, model_path='models/mobilefacenet.onnx', device='cpu'):
        self.session = ort.InferenceSession(model_path, providers=['CPUExecutionProvider'])
        self.input_name = self.session.get_inputs()[0].name
        self.output_name = self.session.get_outputs()[0].name
        self.input_shape = [112, 112] # Standard for ArcFace

    def preprocess(self, face_img):
        # Resize face crop to 112x112
        face_img = cv2.resize(face_img, (112, 112))
        face_img = (face_img - 127.5) / 128.0
        face_img = np.transpose(face_img, (2, 0, 1))
        face_img = np.expand_dims(face_img, axis=0).astype(np.float32)
        return face_img

    def get_embedding(self, face_img):
        blob = self.preprocess(face_img)
        embedding = self.session.run([self.output_name], {self.input_name: blob})[0]
        # Normalize embedding
        norm = np.linalg.norm(embedding)
        if norm > 0:
            embedding = embedding / norm
        return embedding.flatten()

    def compare(self, em1, em2):
        # Cosine similarity
        return np.dot(em1, em2)

# Example Usage
if __name__ == "__main__":
    recognizer = ArcFaceRecognizer()
    # Mock face crop
    face_img = np.random.randint(0, 255, (112, 112, 3), dtype=np.uint8)
    embedding = recognizer.get_embedding(face_img)
    print(f"Embedding Shape: {embedding.shape}")
