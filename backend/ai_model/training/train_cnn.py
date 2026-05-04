"""
CNN Model Training Script
Trains a custom Convolutional Neural Network on the skin condition dataset.

Run this script from the backend/ folder:
    python ai_model/training/train_cnn.py
"""

import os
import cv2
import numpy as np
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, ConfusionMatrixDisplay

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Input, Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from tensorflow.keras.utils import to_categorical


# ── Configuration ──────────────────────────────────────────────────────────────

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

DATASET_DIR = os.path.join(BASE_DIR, "dataset")
SAVE_PATH = os.path.join(BASE_DIR, "saved_models", "cnn_model.keras")

CATEGORIES = ["acne", "dark_spots", "normal_skin", "puffy_eyes", "wrinkles"]

IMG_SIZE = 128
EPOCHS = 10
BATCH_SIZE = 32


# ── Dataset Loading ─────────────────────────────────────────────────────────────

def load_dataset(dataset_dir: str, categories: list[str], img_size: int = 128):
    data = []
    labels = []

    for label_idx, category in enumerate(categories):
        folder = os.path.join(dataset_dir, category)

        if not os.path.exists(folder):
            print(f"Warning: '{folder}' not found. Skipping.")
            continue

        for img_name in os.listdir(folder):
            img_path = os.path.join(folder, img_name)

            img = cv2.imread(img_path)

            if img is None:
                print(f"Warning: Could not read image: {img_path}")
                continue

            img = cv2.resize(img, (img_size, img_size))
            data.append(img)
            labels.append(label_idx)

    if len(data) == 0:
        raise ValueError(
            "No images found. Please check your dataset folder and category names."
        )

    data_array = np.array(data, dtype=np.float32) / 255.0
    labels_array = to_categorical(labels, num_classes=len(categories))

    return data_array, labels_array


# ── Model Definition ────────────────────────────────────────────────────────────

def build_cnn(input_shape: tuple[int, int, int], num_classes: int):
    model = Sequential([
        Input(shape=input_shape),

        Conv2D(32, (3, 3), activation="relu"),
        MaxPooling2D(pool_size=(2, 2)),

        Conv2D(64, (3, 3), activation="relu"),
        MaxPooling2D(pool_size=(2, 2)),

        Conv2D(128, (3, 3), activation="relu"),
        MaxPooling2D(pool_size=(2, 2)),

        Flatten(),

        Dense(128, activation="relu"),
        Dropout(0.5),

        Dense(num_classes, activation="softmax"),
    ])

    model.compile(
        optimizer="adam",
        loss="categorical_crossentropy",
        metrics=["accuracy"]
    )

    return model


# ── Main ────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("Loading dataset...")

    data, labels = load_dataset(DATASET_DIR, CATEGORIES, IMG_SIZE)

    print(f"Total images loaded: {len(data)}")
    print(f"Dataset shape: {data.shape}")
    print(f"Labels shape: {labels.shape}")

    X_train, X_test, y_train, y_test = train_test_split(
        data,
        labels,
        test_size=0.2,
        random_state=42,
        shuffle=True
    )

    model = build_cnn(
        input_shape=(IMG_SIZE, IMG_SIZE, 3),
        num_classes=len(CATEGORIES)
    )

    model.summary()

    print("\nTraining CNN model...")

    history = model.fit(
        X_train,
        y_train,
        validation_data=(X_test, y_test),
        epochs=EPOCHS,
        batch_size=BATCH_SIZE
    )

    os.makedirs(os.path.dirname(SAVE_PATH), exist_ok=True)

    model.save(SAVE_PATH)

    print(f"\nModel saved to: {SAVE_PATH}")

    loss, accuracy = model.evaluate(X_test, y_test, verbose=0)

    print(f"\nTest Loss: {loss:.4f}")
    print(f"Test Accuracy: {accuracy * 100:.2f}%")

    y_pred = np.argmax(model.predict(X_test), axis=1)
    y_true = np.argmax(y_test, axis=1)

    print("\nClassification Report:")
    print(
        classification_report(
            y_true,
            y_pred,
            target_names=CATEGORIES,
            zero_division=0
        )
    )

    cm_matrix = confusion_matrix(y_true, y_pred)

    ConfusionMatrixDisplay(
        confusion_matrix=cm_matrix,
        display_labels=CATEGORIES
    ).plot(cmap="Blues")

    plt.title("CNN Confusion Matrix")
    plt.tight_layout()
    plt.show()

    plt.figure()
    plt.plot(history.history["accuracy"], label="Training Accuracy")
    plt.plot(history.history["val_accuracy"], label="Validation Accuracy")
    plt.title("CNN Model Accuracy")
    plt.xlabel("Epoch")
    plt.ylabel("Accuracy")
    plt.legend()
    plt.tight_layout()
    plt.show()

    plt.figure()
    plt.plot(history.history["loss"], label="Training Loss")
    plt.plot(history.history["val_loss"], label="Validation Loss")
    plt.title("CNN Model Loss")
    plt.xlabel("Epoch")
    plt.ylabel("Loss")
    plt.legend()
    plt.tight_layout()
    plt.show()