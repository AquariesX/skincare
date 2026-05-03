"""
EfficientNetB0 Transfer Learning — Skin Condition Classifier
============================================================
Run from the backend/ folder:
    python ai_model/training/train_efficientnet.py

Dataset layout expected:
    backend/ai_model/dataset/
        acne/         *.jpg / *.jpeg / *.png
        dark_spots/
        normal_skin/
        puffy_eyes/
        wrinkles/

Output:
    backend/ai_model/saved_models/skin_model.keras  (best model only)
    backend/ai_model/training/training_history.png
    backend/ai_model/training/confusion_matrix.png
"""

import os, sys, json
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.utils.class_weight import compute_class_weight

import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.applications.efficientnet import preprocess_input
from tensorflow.keras.callbacks import (ModelCheckpoint, EarlyStopping,
                                        ReduceLROnPlateau, TensorBoard)
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# ── Config ─────────────────────────────────────────────────────
IMG_SIZE   = 224
BATCH_SIZE = 32
EPOCHS_FROZEN  = 15   # Phase 1: train only head
EPOCHS_FINETUNE = 20  # Phase 2: fine-tune top layers
DROPOUT    = 0.4
LEARNING_RATE = 1e-3
FINETUNE_LR   = 1e-5
VAL_SPLIT  = 0.15
TEST_SPLIT = 0.15
SEED       = 42

SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)
DATASET_DIR = os.path.join(BACKEND_DIR, 'dataset')
MODELS_DIR  = os.path.join(BACKEND_DIR, 'saved_models')
os.makedirs(MODELS_DIR, exist_ok=True)

CLASS_LABELS = sorted([
    d for d in os.listdir(DATASET_DIR)
    if os.path.isdir(os.path.join(DATASET_DIR, d))
])
NUM_CLASSES  = len(CLASS_LABELS)
print(f"[Dataset] Classes ({NUM_CLASSES}): {CLASS_LABELS}")

# ── Load images ────────────────────────────────────────────────
def load_dataset():
    images, labels = [], []
    for idx, cls in enumerate(CLASS_LABELS):
        cls_dir = os.path.join(DATASET_DIR, cls)
        count   = 0
        for fname in os.listdir(cls_dir):
            if not fname.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                continue
            path = os.path.join(cls_dir, fname)
            img  = tf.keras.utils.load_img(path, target_size=(IMG_SIZE, IMG_SIZE))
            arr  = tf.keras.utils.img_to_array(img)
            images.append(arr)
            labels.append(idx)
            count += 1
        print(f"  {cls}: {count} images")

    return np.array(images, dtype='float32'), np.array(labels, dtype='int32')


print("[Loading] Reading dataset...")
X, y = load_dataset()
print(f"[Dataset] Total: {len(X)} images, shape {X.shape[1:]}")

# Preprocess for EfficientNetB0 (scales to [-1, 1] internally)
X = preprocess_input(X)

# ── Splits ─────────────────────────────────────────────────────
X_tmp, X_test, y_tmp, y_test = train_test_split(
    X, y, test_size=TEST_SPLIT, stratify=y, random_state=SEED)
X_train, X_val, y_train, y_val = train_test_split(
    X_tmp, y_tmp, test_size=VAL_SPLIT / (1 - TEST_SPLIT), stratify=y_tmp, random_state=SEED)

print(f"[Split] Train: {len(X_train)}  Val: {len(X_val)}  Test: {len(X_test)}")

# One-hot
y_train_cat = tf.keras.utils.to_categorical(y_train, NUM_CLASSES)
y_val_cat   = tf.keras.utils.to_categorical(y_val,   NUM_CLASSES)
y_test_cat  = tf.keras.utils.to_categorical(y_test,  NUM_CLASSES)

# Class weights for imbalanced datasets
cw = compute_class_weight('balanced', classes=np.unique(y_train), y=y_train)
class_weight = {i: w for i, w in enumerate(cw)}
print(f"[ClassWeights] {class_weight}")

# ── Augmentation ───────────────────────────────────────────────
train_aug = ImageDataGenerator(
    rotation_range=20,
    width_shift_range=0.15,
    height_shift_range=0.15,
    shear_range=0.1,
    zoom_range=0.2,
    horizontal_flip=True,
    brightness_range=[0.75, 1.25],
    fill_mode='reflect',
)

# ── Model: Phase 1 (frozen base) ───────────────────────────────
base = EfficientNetB0(
    include_top=False,
    weights='imagenet',
    input_shape=(IMG_SIZE, IMG_SIZE, 3),
)
base.trainable = False

inp = layers.Input(shape=(IMG_SIZE, IMG_SIZE, 3))
x   = base(inp, training=False)
x   = layers.GlobalAveragePooling2D()(x)
x   = layers.BatchNormalization()(x)
x   = layers.Dropout(DROPOUT)(x)
x   = layers.Dense(256, activation='relu')(x)
x   = layers.Dropout(DROPOUT / 2)(x)
out = layers.Dense(NUM_CLASSES, activation='softmax')(x)

model = models.Model(inp, out)

model.compile(
    optimizer=tf.keras.optimizers.Adam(LEARNING_RATE),
    loss='categorical_crossentropy',
    metrics=['accuracy'],
)
model.summary()

callbacks_phase1 = [
    EarlyStopping(monitor='val_accuracy', patience=5, restore_best_weights=True, verbose=1),
    ReduceLROnPlateau(monitor='val_loss', factor=0.4, patience=3, min_lr=1e-7, verbose=1),
    ModelCheckpoint(
        os.path.join(MODELS_DIR, 'skin_model.keras'),
        monitor='val_accuracy', save_best_only=True, verbose=1
    ),
]

print("\n[Phase 1] Training head (base frozen)...")
hist1 = model.fit(
    train_aug.flow(X_train, y_train_cat, batch_size=BATCH_SIZE, seed=SEED),
    epochs=EPOCHS_FROZEN,
    validation_data=(X_val, y_val_cat),
    class_weight=class_weight,
    callbacks=callbacks_phase1,
    verbose=1,
)

# ── Phase 2: Fine-tuning ───────────────────────────────────────
print("\n[Phase 2] Fine-tuning top layers...")
base.trainable = True
# Freeze all but the last 30 layers
for layer in base.layers[:-30]:
    layer.trainable = False

model.compile(
    optimizer=tf.keras.optimizers.Adam(FINETUNE_LR),
    loss='categorical_crossentropy',
    metrics=['accuracy'],
)

callbacks_phase2 = [
    EarlyStopping(monitor='val_accuracy', patience=8, restore_best_weights=True, verbose=1),
    ReduceLROnPlateau(monitor='val_loss', factor=0.3, patience=4, min_lr=1e-9, verbose=1),
    ModelCheckpoint(
        os.path.join(MODELS_DIR, 'skin_model.keras'),
        monitor='val_accuracy', save_best_only=True, verbose=1
    ),
]

hist2 = model.fit(
    train_aug.flow(X_train, y_train_cat, batch_size=BATCH_SIZE // 2, seed=SEED),
    epochs=EPOCHS_FINETUNE,
    validation_data=(X_val, y_val_cat),
    class_weight=class_weight,
    callbacks=callbacks_phase2,
    verbose=1,
)

# ── Evaluation ─────────────────────────────────────────────────
print("\n[Eval] Loading best model for evaluation...")
best_model = tf.keras.models.load_model(os.path.join(MODELS_DIR, 'skin_model.keras'))

test_loss, test_acc = best_model.evaluate(X_test, y_test_cat, verbose=0)
print(f"\n[Test] Loss: {test_loss:.4f}  Accuracy: {test_acc*100:.2f}%")

y_pred_prob = best_model.predict(X_test, verbose=0)
y_pred      = np.argmax(y_pred_prob, axis=1)

print("\n[Classification Report]")
print(classification_report(y_test, y_pred, target_names=CLASS_LABELS))

# ── Plot training history ──────────────────────────────────────
def merge_history(h1, h2, key):
    return h1.history[key] + h2.history[key]

fig, axes = plt.subplots(1, 2, figsize=(14, 5))
epochs1 = len(hist1.history['accuracy'])
total_ep = epochs1 + len(hist2.history['accuracy'])

for ax, metric, title in zip(axes, ['accuracy', 'loss'], ['Accuracy', 'Loss']):
    val_key = f'val_{metric}'
    ax.plot(merge_history(hist1, hist2, metric),   label='Train', color='#7c3aed')
    ax.plot(merge_history(hist1, hist2, val_key),  label='Val',   color='#ec4899', linestyle='--')
    ax.axvline(x=epochs1, color='gray', linestyle=':', alpha=0.6, label='Fine-tune start')
    ax.set_title(f'Training {title}', fontsize=13)
    ax.set_xlabel('Epoch'); ax.set_ylabel(title)
    ax.legend(); ax.grid(alpha=0.3)

plt.tight_layout()
plot_path = os.path.join(SCRIPT_DIR, 'training_history.png')
plt.savefig(plot_path, dpi=120)
print(f"[Plot] Training history saved: {plot_path}")

# ── Confusion matrix ───────────────────────────────────────────
cm = confusion_matrix(y_test, y_pred)
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Purples',
            xticklabels=CLASS_LABELS, yticklabels=CLASS_LABELS)
plt.title('Confusion Matrix — Best Model', fontsize=13)
plt.xlabel('Predicted'); plt.ylabel('Actual')
plt.tight_layout()
cm_path = os.path.join(SCRIPT_DIR, 'confusion_matrix.png')
plt.savefig(cm_path, dpi=120)
print(f"[Plot] Confusion matrix saved: {cm_path}")

# ── Save labels.json ───────────────────────────────────────────
labels_path = os.path.join(BACKEND_DIR, 'labels.json')
with open(labels_path, 'w') as f:
    json.dump({'labels': CLASS_LABELS, 'input_size': IMG_SIZE}, f, indent=2)
print(f"[Labels] Saved: {labels_path}")

print(f"\n✅ Training complete! Best model: {os.path.join(MODELS_DIR, 'skin_model.keras')}")
print(f"   Test accuracy: {test_acc*100:.2f}%")
