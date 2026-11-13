import os
import uuid
import shutil
from fastapi import UploadFile, HTTPException

STORAGE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "storage"))
MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50MB
ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls"}

os.makedirs(STORAGE_DIR, exist_ok=True)

def format_file_size(bytes_size: int) -> str:
    if bytes_size == 0:
        return "0 Bytes"
    units = ["Bytes", "KB", "MB", "GB"]
    i = 0
    size = float(bytes_size)
    while size >= 1024.0 and i < len(units) - 1:
        size /= 1024.0
        i += 1
    return f"{size:.2f} {units[i]}"

async def save_uploaded_file(file: UploadFile) -> tuple[str, str, str, int]:
    """
    Validates extension, size, and securely writes file to storage.
    Returns: (dataset_id, file_path, extension, file_size)
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename missing from upload request.")

    _, ext = os.path.splitext(file.filename)
    ext = ext.lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed formats: CSV (.csv), Excel (.xlsx, .xls)."
        )

    dataset_id = f"ds-{uuid.uuid4().hex[:12]}"
    filename = f"{dataset_id}{ext}"
    dest_path = os.path.join(STORAGE_DIR, filename)

    bytes_read = 0
    try:
        with open(dest_path, "wb") as buffer:
            while chunk := await file.read(1024 * 1024):  # 1MB chunk
                bytes_read += len(chunk)
                if bytes_read > MAX_FILE_SIZE_BYTES:
                    # Clean up file immediately
                    buffer.close()
                    if os.path.exists(dest_path):
                        os.remove(dest_path)
                    raise HTTPException(
                        status_code=413,
                        detail="File exceeds maximum allowed size of 50MB."
                    )
                buffer.write(chunk)
    except HTTPException:
        raise
    except Exception as e:
        if os.path.exists(dest_path):
            os.remove(dest_path)
        raise HTTPException(status_code=500, detail=f"Failed to save upload: {str(e)}")

    if bytes_read == 0:
        if os.path.exists(dest_path):
            os.remove(dest_path)
        raise HTTPException(status_code=400, detail="Uploaded file is empty (0 bytes).")

    return dataset_id, dest_path, ext, bytes_read

def get_file_path(dataset_id: str) -> str:
    """Finds path for a given dataset_id or raises 404."""
    for ext in ALLOWED_EXTENSIONS:
        candidate = os.path.join(STORAGE_DIR, f"{dataset_id}{ext}")
        if os.path.exists(candidate):
            return candidate
    raise HTTPException(status_code=404, detail=f"Dataset with ID '{dataset_id}' not found.")

def remove_dataset_file(dataset_id: str) -> bool:
    """Deletes dataset from storage."""
    deleted = False
    for ext in ALLOWED_EXTENSIONS:
        candidate = os.path.join(STORAGE_DIR, f"{dataset_id}{ext}")
        if os.path.exists(candidate):
            os.remove(candidate)
            deleted = True
    return deleted

