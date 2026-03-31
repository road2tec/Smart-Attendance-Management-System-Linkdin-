import numpy as np
from scipy.optimize import linear_sum_assignment

class ByteTracker:
    def __init__(self, iou_threshold=0.3, max_age=30, min_hits=3):
        self.iou_threshold = iou_threshold
        self.max_age = max_age
        self.min_hits = min_hits
        self.trackers = []
        self.frame_count = 0

    def get_iou(self, bb_test, bb_gt):
        # Calculate Intersection Over Union
        x1 = max(bb_test[0], bb_gt[0])
        y1 = max(bb_test[1], bb_gt[1])
        x2 = min(bb_test[2], bb_gt[2])
        y2 = min(bb_test[3], bb_gt[3])
        w = max(0, x2 - x1)
        h = max(0, y2 - y1)
        wh = w * h
        area_test = (bb_test[2] - bb_test[0]) * (bb_test[3] - bb_test[1])
        area_gt = (bb_gt[2] - bb_gt[0]) * (bb_gt[3] - bb_gt[1])
        return wh / (area_test + area_gt - wh)

    def update(self, dets):
        # dets: numpy array of detections [x1, y1, x2, y2, score]
        self.frame_count += 1
        
        # Simple centroid/IOU tracking logic
        # In a full-scale app, we would use Kalman Filters
        new_tracks = []
        for det in dets:
            matched = False
            for tracker in self.trackers:
                if self.get_iou(det[:4], tracker['bbox']) > self.iou_threshold:
                    tracker['bbox'] = det[:4]
                    tracker['age'] = 0
                    tracker['hits'] += 1
                    matched = True
                    break
            
            if not matched:
                new_track = {
                    'id': self.frame_count + len(new_tracks),
                    'bbox': det[:4],
                    'age': 0,
                    'hits': 1
                }
                new_tracks.append(new_track)
        
        self.trackers.extend(new_tracks)
        
        # Filter tracks
        self.trackers = [t for t in self.trackers if t['age'] < self.max_age]
        for t in self.trackers:
            t['age'] += 1
            
        return [t for t in self.trackers if t['hits'] >= self.min_hits]

# Example Usage
if __name__ == "__main__":
    tracker = ByteTracker()
    dets = [np.array([100, 100, 200, 200, 0.95])]
    tracks = tracker.update(dets)
    print(f"Active Tracks: {tracks}")
