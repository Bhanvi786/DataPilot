from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class ColumnInfo(BaseModel):
    name: str
    type: str  # 'number' or 'string' or 'boolean' or 'datetime'
    dtype: str
    missing: int = 0
    sample: Optional[str] = None

class DatasetMetadata(BaseModel):
    dataset_id: str
    filename: str
    file_type: str
    size: str
    row_count: int
    column_count: int
    columns: List[ColumnInfo]
    uploaded_at: str

class DatasetUploadResponse(BaseModel):
    status: str
    dataset_id: str
    filename: str
    file_type: str
    size: str
    row_count: int
    column_count: int
    columns: List[ColumnInfo]
    preview_rows: List[Dict[str, Any]]
    message: str

class DatasetInfoResponse(BaseModel):
    dataset_id: str
    filename: str
    file_type: str
    size: str
    row_count: int
    column_count: int
    columns: List[ColumnInfo]
    preview_rows: List[Dict[str, Any]]

class DatasetPreviewResponse(BaseModel):
    dataset_id: str
    filename: str
    page: int
    page_size: int
    total_rows: int
    total_pages: int
    columns: List[ColumnInfo]
    rows: List[Dict[str, Any]]

class DeleteResponse(BaseModel):
    status: str
    dataset_id: str
    message: str

