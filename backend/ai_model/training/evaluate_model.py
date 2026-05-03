"""
Model Evaluation Script
Load any saved .keras model and evaluate it on the dataset.
Run from backend/ folder:
    python ai_model/training/evaluate_model.py
"""

import os
import cv2
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
from tensorflow.keras.models import load_model
from tensorflow.keras.utils import to_categorical

DATASET_DIR = os.path.join(os.path.dirname(__file__), '..', 'dataset')
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'saved_models', 'skin_model.keras')
CATEGORIES = ['acne', 'dark_spots', 'normal_skin', 'puffy_eyes', 'wrinkles']
IMG_SIZE = 128


def load_dataset(dataset_dir, categories, img_size=128):
    data, labels = [], []
    for idx, cat in enumerate(categories):
        folder = os.path.join(dataset_dir, cat)
        if not os.path.exists(folder):
            continue
        for name in os.listdir(folder):
            img = cv2.imread(os.path.join(folder, name))
            if img is not None:
                img = cv2.resize(img, (img_size, img_size))
                data.append(img)
                labels.append(idx)
    data = np.array(data, dtype='float32') / 255.0
    labels = to_categorical(labels, num_classes=len(categories))
    return data, labels


if __name__ == '__main__':
    print(f"Loading model from: {MODEL_PATH}")
    model = load_model(MODEL_PATH)

    print("Loading dataset...")
    data, labels = load_dataset(DATASET_DIR, CATEGORIES, IMG_SIZE)
    _, X_test, _, y_test = train_test_split(data, labels, test_size=0.2, random_state=42)

    loss, accuracy = model.evaluate(X_test, y_test, verbose=0)
    print(f"\nTest Loss     : {loss:.4f}")
    print(f"Test Accuracy : {accuracy * 100:.2f}%")

    y_pred = np.argmax(model.predict(X_test), axis=1)
    y_true = np.argmax(y_test, axis=1)

    print("\nClassification Report:")
    print(classification_report(y_true, y_pred, target_names=CATEGORIES))

    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=CATEGORIES, yticklabels=CATEGORIES)
    plt.title('Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.show()
