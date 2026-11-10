from django.conf import settings
from rest_framework.exceptions import ValidationError

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
SIGNATURES = {
    b"\xff\xd8\xff": "image/jpeg",
    b"\x89PNG\r\n\x1a\n": "image/png",
    b"RIFF": "image/webp",
}


def validate_image_file(upload) -> None:
    name = (upload.name or "").lower()
    if not any(name.endswith(ext) for ext in ALLOWED_EXTENSIONS):
        raise ValidationError("Only JPEG, PNG, and WebP images are accepted.")
    max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
    if upload.size > max_bytes:
        raise ValidationError(f"Images must be {settings.MAX_UPLOAD_MB}MB or smaller.")
    header = upload.read(16)
    upload.seek(0)
    if header.startswith(b"\xff\xd8\xff"):
        return
    if header.startswith(b"\x89PNG\r\n\x1a\n"):
        return
    if header.startswith(b"RIFF") and header[8:12] == b"WEBP":
        return
    raise ValidationError("The uploaded file is not a valid JPEG, PNG, or WebP image.")
