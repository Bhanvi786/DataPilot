import math
import numpy as np
import pandas as pd
from datetime import datetime
from fastapi import HTTPException
from schemas.dataset_schema import ColumnInfo, DatasetUploadResponse, DatasetInfoResponse, DatasetPreviewResponse
from services.file_handler import format_file_size, get_file_path, remove_dataset_file

# In-memory metadata cache for fast retrieval
DATASET_METADATA_STORE = {}

def clean_record_value(val):
    """Sanitizes NaN, Inf, and timestamp objects for JSON compliance."""
    if pd.isna(val) or val is None:
        return None
    if isinstance(val, (np.floating, float)):
        if np.isnan(val) or np.isinf(val):
            return None
        return float(val)
    if isinstance(val, (np.integer, int)):
        return int(val)
    if isinstance(val, (np.bool_, bool)):
        return bool(val)
    if isinstance(val, (pd.Timestamp, datetime)):
        return val.isoformat()
    return str(val)

def sanitize_records(records: list[dict]) -> list[dict]:
    cleaned = []
    for row in records:
        cleaned.append({k: clean_record_value(v) for k, v in row.items()})
    return cleaned

def infer_column_types(df: pd.DataFrame) -> list[ColumnInfo]:
    columns_info = []
    for col in df.columns:
        series = df[col]
        missing_count = int(series.isna().sum())
        dtype_str = str(series.dtype)

        # Standardize into frontend categories: 'number', 'string', 'boolean', 'datetime'
        if pd.api.types.is_numeric_dtype(series):
            cat_type = "number"
        elif pd.api.types.is_datetime64_any_dtype(series):
            cat_type = "datetime"
        elif pd.api.types.is_bool_dtype(series):
            cat_type = "boolean"
        else:
            cat_type = "string"

        # Obtain a representative non-null sample value
        non_null_samples = series.dropna()
        sample_str = clean_record_value(non_null_samples.iloc[0]) if len(non_null_samples) > 0 else None
        if sample_str is not None:
            sample_str = str(sample_str)

        columns_info.append(ColumnInfo(
            name=str(col),
            type=cat_type,
            dtype=dtype_str,
            missing=missing_count,
            sample=sample_str
        ))
    return columns_info

def read_dataset_df(file_path: str, ext: str) -> pd.DataFrame:
    try:
        if ext == ".csv":
            # Attempt UTF-8 first, fallback to latin-1 / ISO-8859-1 for non-standard CSVs
            try:
                df = pd.read_csv(file_path)
            except UnicodeDecodeError:
                df = pd.read_csv(file_path, encoding="latin1")
        elif ext in [".xlsx", ".xls"]:
            df = pd.read_excel(file_path, engine="openpyxl" if ext == ".xlsx" else None)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported format '{ext}'.")
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="The uploaded file contains no data or empty columns.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file contents: {str(e)}")

    if df.empty or len(df.columns) == 0:
        raise HTTPException(status_code=400, detail="The dataset is empty. Ensure it contains headers and at least 1 record.")

    # Convert all column names to clean strings to prevent key serialization errors
    df.columns = [str(col).strip() for col in df.columns]
    return df

def process_and_register_dataset(dataset_id: str, file_path: str, ext: str, original_filename: str, bytes_size: int) -> DatasetUploadResponse:
    df = read_dataset_df(file_path, ext)
    columns_info = infer_column_types(df)

    preview_df = df.head(10)
    preview_rows = sanitize_records(preview_df.to_dict(orient="records"))

    metadata = {
        "dataset_id": dataset_id,
        "filename": original_filename,
        "file_type": ext.replace(".", "").upper(),
        "size": format_file_size(bytes_size),
        "bytes_size": bytes_size,
        "file_path": file_path,
        "ext": ext,
        "row_count": len(df),
        "column_count": len(df.columns),
        "columns": [col.model_dump() for col in columns_info],
        "uploaded_at": datetime.now().strftime("%b %d, %Y, %I:%M %p")
    }
    DATASET_METADATA_STORE[dataset_id] = metadata

    return DatasetUploadResponse(
        status="success",
        dataset_id=dataset_id,
        filename=original_filename,
        file_type=metadata["file_type"],
        size=metadata["size"],
        row_count=metadata["row_count"],
        column_count=metadata["column_count"],
        columns=columns_info,
        preview_rows=preview_rows,
        message="Dataset processed and loaded successfully."
    )

def get_dataset_info(dataset_id: str) -> DatasetInfoResponse:
    meta = DATASET_METADATA_STORE.get(dataset_id)
    if not meta:
        file_path = get_file_path(dataset_id)
        _, ext = file_path.rsplit(".", 1)
        ext = f".{ext}"
        # Reconstruct on the fly if server restarted
        return process_and_register_dataset(dataset_id, file_path, ext, f"{dataset_id}{ext}", 0)

    df = read_dataset_df(meta["file_path"], meta["ext"])
    preview_rows = sanitize_records(df.head(10).to_dict(orient="records"))
    columns_info = [ColumnInfo(**c) for c in meta["columns"]]

    return DatasetInfoResponse(
        dataset_id=dataset_id,
        filename=meta["filename"],
        file_type=meta["file_type"],
        size=meta["size"],
        row_count=meta["row_count"],
        column_count=meta["column_count"],
        columns=columns_info,
        preview_rows=preview_rows
    )

def get_dataset_page(dataset_id: str, page: int = 1, page_size: int = 10) -> DatasetPreviewResponse:
    if page < 1:
        page = 1
    if page_size < 1 or page_size > 100:
        page_size = 10

    meta = DATASET_METADATA_STORE.get(dataset_id)
    if not meta:
        file_path = get_file_path(dataset_id)
        _, ext = file_path.rsplit(".", 1)
        ext = f".{ext}"
        process_and_register_dataset(dataset_id, file_path, ext, f"{dataset_id}{ext}", 0)
        meta = DATASET_METADATA_STORE[dataset_id]

    df = read_dataset_df(meta["file_path"], meta["ext"])
    total_rows = len(df)
    total_pages = max(1, math.ceil(total_rows / page_size))

    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    page_df = df.iloc[start_idx:end_idx]

    rows = sanitize_records(page_df.to_dict(orient="records"))
    columns_info = [ColumnInfo(**c) for c in meta["columns"]]

    return DatasetPreviewResponse(
        dataset_id=dataset_id,
        filename=meta["filename"],
        page=page,
        page_size=page_size,
        total_rows=total_rows,
        total_pages=total_pages,
        columns=columns_info,
        rows=rows
    )

def delete_dataset(dataset_id: str):
    removed = remove_dataset_file(dataset_id)
    if dataset_id in DATASET_METADATA_STORE:
        del DATASET_METADATA_STORE[dataset_id]
        removed = True

    if not removed:
        raise HTTPException(status_code=404, detail=f"Dataset with ID '{dataset_id}' not found.")
    return True

