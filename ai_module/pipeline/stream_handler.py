import cv2
import time

class VideoStreamHandler:
    def __init__(self, source=0):
        self.source = source
        self.cap = cv2.VideoCapture(self.source)
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)

    def get_frame(self):
        ret, frame = self.cap.read()
        if not ret:
            return None
        return frame

    def release(self):
        self.cap.release()

# Example Usage
if __name__ == "__main__":
    handler = VideoStreamHandler()
    while True:
        frame = handler.get_frame()
        if frame is None:
            break
        cv2.imshow('Face Attendance Stream', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    handler.release()
    cv2.destroyAllWindows()
