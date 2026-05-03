"""
DenseNet121 Transfer Learning Training Script
Fine-tunes a pretrained DenseNet121 on the skin condition dataset.
Run this script from the backend/ folder:
    python ai_model/training/train_densenet.py
"""

import os
import cv2
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, ConfusionMatrixDisplay
from tensorflow.keras.applications import DenseNet121
from tensorflow.keras.models import Model
from tensorflow.keras.layers import GlobalAveragePooling2D, Dense, Dropout, Input
from tensorflow.keras.utils import to_categorical

# ── Configuration ──────────────────────────────────────────────────────────────

DATASET_DIR = os.path.join(os.path.dirname(__file__), '..', 'dataset')
SAVE_PATH = os.path.join(os.path.dirname(__file__), '..', 'saved_models', 'densenet_model.keras')
CATEGORIES = ['acne', 'dark_spots', 'normal_skin', 'puffy_eyes', 'wrinkles']
IMG_SIZE = 128
EPOCHS = 10
BATCH_SIZE = 32


# ── Dataset Loading ─────────────────────────────────────────────────────────────

def load_dataset(dataset_dir, categories, img_size=128):
    data, labels = [], []
    for label_idx, category in enumerate(categories):
        folder = os.path.join(dataset_dir, category)
        if not os.path.exists(folder):
            print(f"Warning: '{folder}' not found. Skipping.")
            continue
        for img_name in os.listdir(folder):
            img_path = os.path.join(folder, img_name)
            img = cv2.imread(img_path)
            if img is not None:
                img = cv2.resize(img, (img_size, img_size))
                data.append(img)
                labels.append(label_idx)
    data = np.array(data, dtype='float32') / 255.0
    labels = to_categorical(labels, num_classes=len(categories))
    return data, labels


# ── Model Definition ────────────────────────────────────────────────────────────

def build_densenet(input_shape, num_classes):
    base_model = DenseNet121(weights='imagenet', include_top=False, input_shape=input_shape)
    base_model.trainable = False   # Freeze pretrained weights

    inputs = Input(shape=input_shape)
    x = base_model(inputs, training=False)
    x = GlobalAveragePooling2D()(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.5)(x)
    outputs = Dense(num_classes, activation='softmax')(x)

    model = Model(inputs, outputs)
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    return model


# ── Main ────────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    print("Loading dataset...")
    data, labels = load_dataset(DATASET_DIR, CATEGORIES, IMG_SIZE)
    print(f"Total images loaded: {len(data)}")

    X_train, X_test, y_train, y_test = train_test_split(data, labels, test_size=0.2, random_state=42)

    model = build_densenet((IMG_SIZE, IMG_SIZE, 3), len(CATEGORIES))
    model.summary()

    print("\nTraining DenseNet121 model...")
    history = model.fit(X_train, y_train, validation_data=(X_test, y_test),
                        epochs=EPOCHS, batch_size=BATCH_SIZE)

    os.makedirs(os.path.dirname(SAVE_PATH), exist_ok=True)
    model.save(SAVE_PATH)
    print(f"\nModel saved to: {SAVE_PATH}")

    loss, accuracy = model.evaluate(X_test, y_test, verbose=0)
    print(f"Test Accuracy: {accuracy * 100:.2f}%")

    y_pred = np.argmax(model.predict(X_test), axis=1)
    y_true = np.argmax(y_test, axis=1)
    print(classification_report(y_true, y_pred, target_names=CATEGORIES))

    cm = confusion_matrix(y_true, y_pred)
    ConfusionMatrixDisplay(cm, display_labels=CATEGORIES).plot(cmap=plt.cm.Blues)
    plt.title('DenseNet121 Confusion Matrix')
    plt.tight_layout()
    plt.show()
