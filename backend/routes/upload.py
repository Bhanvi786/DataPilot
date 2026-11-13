from fastapi import APIRouter, UploadFile, File, HTTPException
from schemas.dataset_schema import DatasetUploadResponse
from services.file_handler import save_uploaded_file
from services.dataset_service import process_and_register_dataset

router = APIRouter(tags=["Upload"])

@router.post("/upload", response_model=DatasetUploadResponse)
async def upload_dataset_endpoint(file: UploadFile = File(...)):
    """
    Accepts CSV and XLSX/XLS files up to 50MB.
    Parses headers, validates contents with Pandas, and generates dataset ID and preview rows.
    """
    dataset_id, file_path, ext, bytes_size = await save_uploaded_file(file)
    response = process_and_register_dataset(
        dataset_id=dataset_id,
        file_path=file_path,
        ext=ext,
        original_filename=file.filename or f"dataset{ext}",
        bytes_size=bytes_size
    )
    return response

