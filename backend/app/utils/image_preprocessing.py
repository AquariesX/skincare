import numpy as np
from PIL import Image


def preprocess_for_model(image_path, target_size=(224, 224), channels=3):
    """
    Load, resize, normalise, and batch an image using PIL.

    Args:
        image_path:  absolute path to the image file
        target_size: (height, width) — use model.input_shape[1:3]
        channels:    1 (grayscale) or 3 (RGB) — use model.input_shape[3]

    Returns:
        np.ndarray shape (1, H, W, C), float32, values in [0, 1]
    """
    height, width = target_size
    pil_mode = 'RGB' if channels == 3 else 'L'

    img = Image.open(image_path).convert(pil_mode)
    img = img.resize((width, height))               # PIL: (width, height)

    img_array = np.array(img, dtype='float32') / 255.0

    if channels == 1 and img_array.ndim == 2:
        img_array = np.expand_dims(img_array, axis=-1)  # (H, W, 1)

    img_array = np.expand_dims(img_array, axis=0)       # (1, H, W, C)

    print(f"[Preprocess] Image shape: {img_array.shape}")
    return img_array
