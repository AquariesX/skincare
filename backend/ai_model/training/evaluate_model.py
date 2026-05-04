"""
Model Evaluation Script
=======================
Loads the saved skin_model.keras and evaluates it on the dataset.
Run from the backend/ folder:
    python ai_model/training/evaluate_model.py
"""

import os
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix

# ── Paths ───────────────────────────────────────────────────────
SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)
DATASET_DIR = os.path.join(BACKEND_DIR, 'dataset')
MODEL_PATH  = os.path.join(BACKEND_DIR, 'saved_models', 'skin_model.keras')

# ── Config ──────────────────────────────────────────────────────
CATEGORIES = ['acne', 'dark_spots', 'normal_skin', 'puffy_eyes', 'wrinkles']
IMG_SIZE   = 224   # Must match the size used during training


# ── Load images ─────────────────────────────────────────────────
def load_images():
    data, labels = [], []
    for idx, cat in enumerate(CATEGORIES):
        folder = os.path.join(DATASET_DIR, cat)
        if not os.path.exists(folder):
            print(f"Warning: '{folder}' not found, skipping.")
            continue
        count = 0
        for fname in os.listdir(folder):
            if not fname.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                continue
            img = tf.keras.utils.load_img(
                os.path.join(folder, fname),
                target_size=(IMG_SIZE, IMG_SIZE)
            )
            data.append(tf.keras.utils.img_to_array(img))
            labels.append(idx)
            count += 1
        print(f"  {cat}: {count} images")
    return np.array(data, dtype='float32'), np.array(labels, dtype='int32')


if __name__ == '__main__':
    print(f"Loading model: {MODEL_PATH}")
    model = tf.keras.models.load_model(MODEL_PATH)

    print("Loading dataset...")
    X, y = load_images()
    print(f"Total: {len(X)} images")

    # Use the same preprocessing as EfficientNetB0 training
    X = tf.keras.applications.efficientnet.preprocess_input(X)

    _, X_test, _, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    y_test_cat = tf.keras.utils.to_categorical(y_test, len(CATEGORIES))

    results   = model.evaluate(X_test, y_test_cat, verbose=0)
    test_loss = results[0]
    test_acc  = results[1]
    print(f"\nTest Loss:     {test_loss:.4f}")
    print(f"Test Accuracy: {test_acc * 100:.2f}%")

    y_pred = np.argmax(model.predict(X_test, verbose=0), axis=1)

    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=CATEGORIES))

    cm = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=CATEGORIES, yticklabels=CATEGORIES)
    plt.title('Confusion Matrix')
    plt.ylabel('True Label'); plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.savefig(os.path.join(SCRIPT_DIR, 'eval_confusion_matrix.png'), dpi=120)
    plt.show()
    print("Confusion matrix saved.")
