import os
import shutil
import insightface
from insightface.app import FaceAnalysis

def download_ready_to_use_models():
    models_dir = "models"
    if not os.path.exists(models_dir):
        os.makedirs(models_dir)

    print("--- Initializing InsightFace to download models ---")
    
    # We use buffalo_s (small version) for mobilefacenet/scrfd_500m equivalence
    app = FaceAnalysis(name='buffalo_s', providers=['CPUExecutionProvider'])
    app.prepare(ctx_id=-1) # This triggers the download
    
    # Locate the downloaded models in the default insightface directory
    insightface_home = os.path.expanduser('~/.insightface/models/buffalo_s')
    
    print(f"Models downloaded to: {insightface_home}")
    
    # List of files to copy and rename for the current project
    mapping = {
        'det_500m.onnx': 'scrfd_500m.onnx',
        'w600k_mbf.onnx': 'mobilefacenet.onnx'
    }

    for src_name, dst_name in mapping.items():
        src_path = os.path.join(insightface_home, src_name)
        dst_path = os.path.join(models_dir, dst_name)
        
        if os.path.exists(src_path):
            print(f"Copying {src_name} to {dst_path}...")
            shutil.copy(src_path, dst_path)
        else:
            print(f"Warning: Could not find {src_path}")

    # For minifasnet.onnx (anti-spoofing)
    import urllib.request
    antispoof_url = "https://raw.githubusercontent.com/SuriAI/face-antispoof-onnx/master/models/2.7_80x80_MiniFASNetV2.onnx"
    antispoof_dst = os.path.join(models_dir, "minifasnet.onnx")
    
    if not os.path.exists(antispoof_dst):
        print(f"Downloading minifasnet.onnx from {antispoof_url}...")
        try:
            urllib.request.urlretrieve(antispoof_url, antispoof_dst)
            print("Successfully downloaded minifasnet.onnx")
        except Exception as e:
            print(f"Failed to download anti-spoofing model: {e}")

    print("\n--- Model download and setup complete ---")

if __name__ == "__main__":
    download_ready_to_use_models()
