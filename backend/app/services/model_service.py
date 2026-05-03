import os
import numpy as np
from PIL import Image
from flask import current_app

CLASS_LABELS = ['acne', 'dark_spots', 'normal_skin', 'puffy_eyes', 'wrinkles']

_model    = None
_input_h  = 224
_input_w  = 224
_input_c  = 3      # channels — set dynamically from model.input_shape


def _load_model():
    global _model, _input_h, _input_w, _input_c
    model_path = current_app.config['MODEL_PATH']

    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"Model not found: {model_path}\n"
            "Copy your trained file to: backend/ai_model/saved_models/skin_model.keras"
        )

    import tensorflow as tf
    _model = tf.keras.models.load_model(model_path)

    # Read EXACTLY what the model was compiled with — never guess
    shape = _model.input_shape          # e.g. (None, 129, 129, 3)
    _input_h = int(shape[1]) if shape[1] else 224
    _input_w = int(shape[2]) if shape[2] else 224
    _input_c = int(shape[3]) if shape[3] else 3

    print(f"[Model] input_shape  : {shape}")
    print(f"[Model] target H×W×C : {_input_h}×{_input_w}×{_input_c}")


def _preprocess(image_path):
    """
    Preprocess image to match the model's exact input shape.
    Uses PIL — works on every platform, no TF version issues.
    """
    # Choose PIL colour mode to match what the model expects
    pil_mode = 'RGB' if _input_c == 3 else 'L'

    img = Image.open(image_path).convert(pil_mode)   # force correct channels
    img = img.resize((_input_w, _input_h))            # PIL resize: (width, height)

    img_array = np.array(img, dtype='float32') / 255.0

    # Shape after np.array:
    #   RGB → (H, W, 3)
    #   L   → (H, W)   — needs an explicit channel axis
    if _input_c == 1 and img_array.ndim == 2:
        img_array = np.expand_dims(img_array, axis=-1)  # (H, W, 1)

    img_array = np.expand_dims(img_array, axis=0)       # (1, H, W, C)

    print(f"[Preprocess] Image shape before prediction: {img_array.shape}")
    return img_array


def predict_skin_condition(image_path):
    global _model
    if _model is None:
        _load_model()

    img_array = _preprocess(image_path)

    predictions = _model.predict(img_array, verbose=0)
    class_idx  = int(np.argmax(predictions[0]))
    confidence = float(predictions[0][class_idx]) * 100

    return {
        'condition': CLASS_LABELS[class_idx],
        'confidence': round(confidence, 2),
        'all_predictions': {
            CLASS_LABELS[i]: round(float(predictions[0][i]) * 100, 2)
            for i in range(len(CLASS_LABELS))
        }
    }
