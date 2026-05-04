"""
EfficientNetB0 Transfer Learning - Skin Condition Classifier
============================================================
Run from the backend/ folder:
    python ai_model/training/train_efficientnet.py

Dataset layout:
    backend/ai_model/dataset/
        acne/
        dark_spots/
        normal_skin/
        puffy_eyes/
        wrinkles/

Output:
    backend/ai_model/saved_models/skin_model.keras
    backend/ai_model/training/training_history.png
    backend/ai_model/training/confusion_matrix.png
"""

import os
import json
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.utils.class_weight import compute_class_weight

# ── Paths ───────────────────────────────────────────────────────
SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)
DATASET_DIR = os.path.join(BACKEND_DIR, 'dataset')
MODELS_DIR  = os.path.join(BACKEND_DIR, 'saved_models')
MODEL_PATH  = os.path.join(MODELS_DIR, 'skin_model.keras')
os.makedirs(MODELS_DIR, exist_ok=True)

# ── Config ──────────────────────────────────────────────────────
IMG_SIZE   = 224
BATCH_SIZE = 32
EPOCHS_1   = 15    # Phase 1: train head only (base frozen)
EPOCHS_2   = 20    # Phase 2: fine-tune top layers
SEED       = 42

# ── Discover classes ────────────────────────────────────────────
CLASS_LABELS = sorted([
    d for d in os.listdir(DATASET_DIR)
    if os.path.isdir(os.path.join(DATASET_DIR, d))
])
NUM_CLASSES = len(CLASS_LABELS)
print(f"[Classes] {NUM_CLASSES} found: {CLASS_LABELS}")


# ── Load images ─────────────────────────────────────────────────
def load_images():
    X, y = [], []
    for idx, cls in enumerate(CLASS_LABELS):
        cls_dir = os.path.join(DATASET_DIR, cls)
        count = 0
        for fname in os.listdir(cls_dir):
            if not fname.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                continue
            path = os.path.join(cls_dir, fname)
            img = tf.keras.utils.load_img(path, target_size=(IMG_SIZE, IMG_SIZE))
            X.append(tf.keras.utils.img_to_array(img))
            y.append(idx)
            count += 1
        print(f"  {cls}: {count} images")
    return np.array(X, dtype='float32'), np.array(y, dtype='int32')


print("[Loading] Reading dataset...")
X, y = load_images()
print(f"[Dataset] Total: {len(X)} images")

# EfficientNet expects pixel values preprocessed to [-1, 1]
X = tf.keras.applications.efficientnet.preprocess_input(X)

# ── Train / Val / Test split ────────────────────────────────────
X_tmp, X_test, y_tmp, y_test = train_test_split(
    X, y, test_size=0.15, stratify=y, random_state=SEED)
X_train, X_val, y_train, y_val = train_test_split(
    X_tmp, y_tmp, test_size=0.18, stratify=y_tmp, random_state=SEED)
print(f"[Split] Train: {len(X_train)}  Val: {len(X_val)}  Test: {len(X_test)}")

# One-hot encode labels
y_train_cat = tf.keras.utils.to_categorical(y_train, NUM_CLASSES)
y_val_cat   = tf.keras.utils.to_categorical(y_val,   NUM_CLASSES)
y_test_cat  = tf.keras.utils.to_categorical(y_test,  NUM_CLASSES)

# Class weights to handle imbalanced data
cw = compute_class_weight('balanced', classes=np.unique(y_train), y=y_train)
class_weight = {i: float(w) for i, w in enumerate(cw)}
print(f"[Weights] {class_weight}")


# ── Build model ─────────────────────────────────────────────────
def build_model():
    base = tf.keras.applications.EfficientNetB0(
        include_top=False,
        weights='imagenet',
        input_shape=(IMG_SIZE, IMG_SIZE, 3),
    )
    base.trainable = False  # Freeze in Phase 1

    inputs = tf.keras.Input(shape=(IMG_SIZE, IMG_SIZE, 3))

    # Data augmentation (only active during training)
    x = tf.keras.layers.RandomFlip('horizontal')(inputs)
    x = tf.keras.layers.RandomRotation(0.15)(x)
    x = tf.keras.layers.RandomZoom(0.15)(x)
    x = tf.keras.layers.RandomTranslation(0.1, 0.1)(x)

    x = base(x, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.BatchNormalization()(x)
    x = tf.keras.layers.Dropout(0.4)(x)
    x = tf.keras.layers.Dense(256, activation='relu')(x)
    x = tf.keras.layers.Dropout(0.2)(x)
    outputs = tf.keras.layers.Dense(NUM_CLASSES, activation='softmax')(x)

    return tf.keras.Model(inputs, outputs), base


model, base_model = build_model()
model.summary()

# ── Phase 1: Train head (base frozen) ───────────────────────────
model.compile(
    optimizer=tf.keras.optimizers.Adam(1e-3),
    loss='categorical_crossentropy',
    metrics=['accuracy'],
)

callbacks_1 = [
    tf.keras.callbacks.EarlyStopping(
        monitor='val_accuracy', patience=5, restore_best_weights=True, verbose=1),
    tf.keras.callbacks.ReduceLROnPlateau(
        monitor='val_loss', factor=0.4, patience=3, min_lr=1e-7, verbose=1),
    tf.keras.callbacks.ModelCheckpoint(
        MODEL_PATH, monitor='val_accuracy', save_best_only=True, verbose=1),
]

print("\n[Phase 1] Training head (base frozen)...")
hist1 = model.fit(
    X_train, y_train_cat,
    validation_data=(X_val, y_val_cat),
    epochs=EPOCHS_1,
    batch_size=BATCH_SIZE,
    class_weight=class_weight,
    callbacks=callbacks_1,
)

# ── Phase 2: Fine-tune top layers ───────────────────────────────
print("\n[Phase 2] Fine-tuning top 30 layers...")
base_model.trainable = True
for layer in base_model.layers[:-30]:
    layer.trainable = False

model.compile(
    optimizer=tf.keras.optimizers.Adam(1e-5),
    loss='categorical_crossentropy',
    metrics=['accuracy'],
)

callbacks_2 = [
    tf.keras.callbacks.EarlyStopping(
        monitor='val_accuracy', patience=8, restore_best_weights=True, verbose=1),
    tf.keras.callbacks.ReduceLROnPlateau(
        monitor='val_loss', factor=0.3, patience=4, min_lr=1e-9, verbose=1),
    tf.keras.callbacks.ModelCheckpoint(
        MODEL_PATH, monitor='val_accuracy', save_best_only=True, verbose=1),
]

hist2 = model.fit(
    X_train, y_train_cat,
    validation_data=(X_val, y_val_cat),
    epochs=EPOCHS_2,
    batch_size=BATCH_SIZE // 2,
    class_weight=class_weight,
    callbacks=callbacks_2,
)

# ── Evaluate best saved model ────────────────────────────────────
print("\n[Eval] Loading best model...")
best_model = tf.keras.models.load_model(MODEL_PATH)
results = best_model.evaluate(X_test, y_test_cat, verbose=0)
test_loss = results[0]
test_acc  = results[1]
print(f"[Test] Loss: {test_loss:.4f}  Accuracy: {test_acc * 100:.2f}%")

y_pred = np.argmax(best_model.predict(X_test, verbose=0), axis=1)
print("\n[Classification Report]")
print(classification_report(y_test, y_pred, target_names=CLASS_LABELS))

# ── Training history plot ────────────────────────────────────────
def merge(h1, h2, key):
    return h1.history[key] + h2.history[key]

ep1 = len(hist1.history['accuracy'])
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

ax1.plot(merge(hist1, hist2, 'accuracy'),     label='Train', color='#7c3aed')
ax1.plot(merge(hist1, hist2, 'val_accuracy'), label='Val',   color='#ec4899', linestyle='--')
ax1.axvline(ep1, color='gray', linestyle=':', alpha=0.6, label='Fine-tune start')
ax1.set_title('Accuracy'); ax1.legend(); ax1.grid(alpha=0.3)

ax2.plot(merge(hist1, hist2, 'loss'),     label='Train', color='#7c3aed')
ax2.plot(merge(hist1, hist2, 'val_loss'), label='Val',   color='#ec4899', linestyle='--')
ax2.axvline(ep1, color='gray', linestyle=':', alpha=0.6)
ax2.set_title('Loss'); ax2.legend(); ax2.grid(alpha=0.3)

plt.tight_layout()
plt.savefig(os.path.join(SCRIPT_DIR, 'training_history.png'), dpi=120)
print("[Plot] Training history saved.")

# ── Confusion matrix ─────────────────────────────────────────────
cm = confusion_matrix(y_test, y_pred)
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=CLASS_LABELS, yticklabels=CLASS_LABELS)
plt.title('Confusion Matrix'); plt.xlabel('Predicted'); plt.ylabel('Actual')
plt.tight_layout()
plt.savefig(os.path.join(SCRIPT_DIR, 'confusion_matrix.png'), dpi=120)
print("[Plot] Confusion matrix saved.")

# ── Save labels.json ─────────────────────────────────────────────
labels_path = os.path.join(BACKEND_DIR, 'labels.json')
with open(labels_path, 'w') as f:
    json.dump({'labels': CLASS_LABELS, 'input_size': IMG_SIZE}, f, indent=2)
print(f"[Labels] Saved: {labels_path}")

print(f"\nDone! Model: {MODEL_PATH}")
print(f"Test Accuracy: {test_acc * 100:.2f}%")
