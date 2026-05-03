from PIL import Image


def is_valid_image(file, allowed_extensions):
    """
    Check that the uploaded file has an allowed extension
    and is a valid, readable image.
    """
    if not file or not file.filename:
        return False

    ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else ''
    if ext not in allowed_extensions:
        return False

    try:
        file.seek(0)
        img = Image.open(file)
        img.verify()   # Raises if file is not a valid image
        file.seek(0)   # Reset so caller can read the file again
        return True
    except Exception:
        file.seek(0)
        return False
