import io
import numpy as np
from PIL import Image


def is_valid_image(file, allowed_extensions):
    """Check allowed extension and that the file is a readable image."""
    if not file or not file.filename:
        return False

    ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else ''
    if ext not in allowed_extensions:
        return False

    try:
        file.seek(0)
        img = Image.open(file)
        img.verify()
        file.seek(0)
        return True
    except Exception:
        file.seek(0)
        return False


def check_image_quality(image_path):
    """
    Returns (is_valid: bool, error_message: str | None).

    Rejects images that are:
    - Too dark (likely taken in the dark or lens covered)
    - Too bright / overexposed
    - Nearly uniform / blank (solid colour, corrupted, or unrelated graphic)

    Uses only Pillow + NumPy — no extra dependencies.
    """
    try:
        img = Image.open(image_path).convert('RGB')
        arr = np.array(img, dtype=np.float32)

        # Work on grayscale for brightness/contrast checks
        gray = 0.299 * arr[:, :, 0] + 0.587 * arr[:, :, 1] + 0.114 * arr[:, :, 2]

        mean_val = float(np.mean(gray))
        std_val = float(np.std(gray))

        if mean_val < 18:
            return False, (
                'Image is too dark. Please use better lighting or turn on your camera flash.'
            )

        if mean_val > 248:
            return False, (
                'Image is too bright / overexposed. Please reduce the light source and try again.'
            )

        if std_val < 8:
            return False, (
                'Image appears blank or has no visible detail. '
                'Please upload a clear photo of your face or skin area.'
            )

        # Very low unique colour count → likely a solid-colour or graphic image
        # Sample a 64×64 thumbnail for speed
        thumb = img.resize((64, 64))
        unique_colors = len(set(thumb.getdata()))
        if unique_colors < 50:
            return False, (
                'Invalid image. Please upload or capture a real photo of your face or skin.'
            )

        return True, None

    except Exception as e:
        return False, f'Could not process image: {str(e)}'
