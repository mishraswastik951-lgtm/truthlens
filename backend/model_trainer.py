# model_training.py - Fixed version
# Simply runs train_model.py logic directly

import subprocess
import sys

if __name__ == "__main__":
    subprocess.run([sys.executable, 'train_model.py'])