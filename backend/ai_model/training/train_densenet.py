"""
DenseNet121 Transfer Learning - Skin Condition Classifier
=========================================================
Run from the backend/ folder:
    python ai_model/training/train_densenet.py
"""

import os
from typing import cast

import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import tensorflow as tf

from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix


# ── Paths ───────────────────────────────────────────────────────

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)
DATASET_DIR = os.path.join(BACKEND_DIR, "dataset")
SAVE_PATH = os.path.join(BACKEND_DIR, "saved_models", "densenet_model.keras")


# ── Config ──────────────────────────────────────────────────────

CATEGORIES = ["acne", "dark_spots", "normal_skin", "puffy_eyes", "wrinkles"]
IMG_SIZE = 224
EPOCHS = 10
BATCH_SIZE = 32


# ── Load Images ─────────────────────────────────────────────────

def load_images() -> tuple[np.ndarray, np.ndarray]:
    data: list[np.ndarray] = []
    labels: list[int] = []

    for idx, cat in enumerate(CATEGORIES):
        folder = os.path.join(DATASET_DIR, cat)

        if not os.path.exists(folder):
            print(f"Warning: '{folder}' not found, skipping.")
            continue

        count = 0

        for fname in os.listdir(folder):
            if not fname.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
                continue

            img_path = os.path.join(folder, fname)

            try:
                img = tf.keras.utils.load_img(
                    img_path,
                    target_size=(IMG_SIZE, IMG_SIZE)
                )

                img_array = tf.keras.utils.img_to_array(img)
                data.append(img_array)
                labels.append(idx)
                count += 1

            except Exception as e:
                print(f"Warning: Could not load image {img_path}: {e}")

        print(f"{cat}: {count} images")

    if len(data) == 0:
        raise ValueError(
            "No images found. Please check your dataset folder and category names."
        )

    return np.array(data, dtype=np.float32), np.array(labels, dtype=np.int32)


# ── Build Model ─────────────────────────────────────────────────

def build_model() -> tf.keras.Model:
    base_model = tf.keras.applications.DenseNet121(
        weights="imagenet",
        include_top=False,
        input_shape=(IMG_SIZE, IMG_SIZE, 3),
    )

    base_model.trainable = False

    inputs = tf.keras.Input(shape=(IMG_SIZE, IMG_SIZE, 3))

    x = base_model(inputs, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dense(256, activation="relu")(x)
    x = tf.keras.layers.Dropout(0.5)(x)

    outputs = tf.keras.layers.Dense(
        len(CATEGORIES),
        activation="softmax"
    )(x)

    model = tf.keras.Model(inputs=inputs, outputs=outputs)

    model.compile(
        optimizer="adam",
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    return model


# ── Main ────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("Loading dataset...")

    X, y = load_images()

    print(f"Total images loaded: {len(X)}")
    print(f"Image data shape: {X.shape}")
    print(f"Labels shape: {y.shape}")

    X = tf.keras.applications.densenet.preprocess_input(X)

    y_cat = tf.keras.utils.to_categorical(
        y,
        num_classes=len(CATEGORIES)
    )

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y_cat,
        test_size=0.2,
        random_state=42,
        shuffle=True
    )

    model = build_model()
    model.summary()

    os.makedirs(os.path.dirname(SAVE_PATH), exist_ok=True)

    print("\nTraining DenseNet121 model...")

    history = model.fit(
        X_train,
        y_train,
        validation_data=(X_test, y_test),
        epochs=EPOCHS,
        batch_size=BATCH_SIZE,
    )

    model.save(SAVE_PATH)

    print(f"\nModel saved: {SAVE_PATH}")

    eval_results = cast(
        dict[str, float],
        model.evaluate(
            X_test,
            y_test,
            verbose=0,
            return_dict=True
        )
    )

    test_loss = float(eval_results["loss"])
    test_acc = float(eval_results["accuracy"])

    print(f"\nTest Loss: {test_loss:.4f}")
    print(f"Test Accuracy: {test_acc * 100:.2f}%")

    y_pred = np.argmax(
        model.predict(X_test, verbose=0),
        axis=1
    )

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

    cm = confusion_matrix(y_true, y_pred)

    plt.figure(figsize=(8, 6))
    sns.heatmap(
        cm,
        annot=True,
        fmt="d",
        cmap="Blues",
        xticklabels=CATEGORIES,
        yticklabels=CATEGORIES
    )

    plt.title("DenseNet121 Confusion Matrix")
    plt.xlabel("Predicted")
    plt.ylabel("Actual")
    plt.tight_layout()

    confusion_matrix_path = os.path.join(
        SCRIPT_DIR,
        "densenet_confusion_matrix.png"
    )

    plt.savefig(confusion_matrix_path, dpi=120)
    plt.show()

    print(f"Confusion matrix saved: {confusion_matrix_path}")

    plt.figure()
    plt.plot(history.history["accuracy"], label="Training Accuracy")
    plt.plot(history.history["val_accuracy"], label="Validation Accuracy")
    plt.title("DenseNet121 Model Accuracy")
    plt.xlabel("Epoch")
    plt.ylabel("Accuracy")
    plt.legend()
    plt.tight_layout()
    plt.show()

    plt.figure()
    plt.plot(history.history["loss"], label="Training Loss")
    plt.plot(history.history["val_loss"], label="Validation Loss")
    plt.title("DenseNet121 Model Loss")
    plt.xlabel("Epoch")
    plt.ylabel("Loss")
    plt.legend()
    plt.tight_layout()
    plt.show()