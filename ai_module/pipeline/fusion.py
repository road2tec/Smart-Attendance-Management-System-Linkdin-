import numpy as np

class ConfidenceFusionEngine:
    def __init__(self, recognition_weight=0.5, spoof_weight=0.3, tracking_weight=0.2, threshold=0.85):
        self.recognition_weight = recognition_weight
        self.spoof_weight = spoof_weight
        self.tracking_weight = tracking_weight
        self.threshold = threshold

    def fuse(self, rec_score, spoof_score, track_score):
        """
        Fuses multiple scores into a single confidence score.
        rec_score: Cosine similarity or model confidence (0-1)
        spoof_score: Liveness probability (0-1, 1 being Real)
        track_score: Stability of the bounding box/ID (0-1)
        """
        combined_score = (
            (rec_score * self.recognition_weight) +
            (spoof_score * self.spoof_weight) +
            (track_score * self.tracking_weight)
        )
        
        is_accepted = combined_score >= self.threshold
        
        return {
            "score": combined_score,
            "is_accepted": is_accepted,
            "details": {
                "recognition": rec_score,
                "anti_spoof": spoof_score,
                "tracking": track_score
            }
        }

# Example Usage
if __name__ == "__main__":
    engine = ConfidenceFusionEngine()
    result = engine.fuse(0.92, 0.98, 1.0)
    print(f"Fusion Result: {result}")
