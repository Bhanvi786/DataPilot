from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Body, Response
from fastapi.responses import StreamingResponse
from typing import Optional, Dict, Any
import io
import pandas as pd
import numpy as np

from config import settings
from services.dataset_service import DatasetService
from services.data_profiler import DataProfiler
from services.missing_value_handler import MissingValueHandler
from services.duplicate_handler import DuplicateHandler
from services.outlier_handler import OutlierHandler
from services.cleaning_engine import CleaningEngine

router = APIRouter(prefix="", tags=["Datasets"])
dataset_service = DatasetService(storage_dir=settings.STORAGE_DIR)
cleaning_engine = CleaningEngine(storage_dir=settings.STORAGE_DIR)


# ==========================================
# PHASE 1 ENDPOINTS (PRESERVED INTACT)
# ==========================================

@router.get("/health")
def health_check():
    """Verify backend availability and runtime status."""
    return {
        "status": "healthy",
        "service": "DataPilot FastAPI Backend",
        "version": settings.VERSION,
        "engine": "Python + Pandas + FastAPI",
        "phase": "Phase 2 (Automated Data Cleaning Active)"
    }


@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    """Accepts CSV or Excel files, loads dataset, and caches original version."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")

    content = await file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    dataset_id, metadata, error = dataset_service.load_from_bytes(
        filename=file.filename,
        file_bytes=content
    )

    if error:
        raise HTTPException(status_code=400, detail=error)

    preview = dataset_service.get_preview(dataset_id, limit=20)
    columns = dataset_service.get_column_details(dataset_id)

    return {
        "dataset_id": dataset_id,
        "metadata": metadata,
        "preview": preview,
        "columns": columns
    }


@router.get("/dataset/{dataset_id}")
def get_dataset(dataset_id: str):
    """Retrieve metadata and KPI values for a given dataset."""
    metadata = dataset_service.get_metadata(dataset_id)
    if not metadata:
        raise HTTPException(status_code=404, detail="Dataset not found or expired.")
    return metadata


@router.get("/dataset/{dataset_id}/preview")
def get_dataset_preview(dataset_id: str, limit: int = Query(20, ge=1, le=100)):
    """Retrieve first N records. Uses cleaned version if available, otherwise original."""
    cleaned_df = cleaning_engine.get_cleaned_version(dataset_id)
    if cleaned_df is not None:
        sample_df = cleaned_df.head(limit).copy()
        sample_df = sample_df.replace({np.nan: None, np.inf: None, -np.inf: None})
        return {
            "dataset_id": dataset_id,
            "version": "cleaned",
            "limit": limit,
            "rows": sample_df.to_dict(orient="records")
        }

    preview = dataset_service.get_preview(dataset_id, limit=limit)
    if preview is None:
        raise HTTPException(status_code=404, detail="Dataset not found or expired.")
    return {
        "dataset_id": dataset_id,
        "version": "original",
        "limit": limit,
        "rows": preview
    }


@router.get("/dataset/{dataset_id}/columns")
def get_dataset_columns(dataset_id: str):
    """Retrieve column schema."""
    cleaned_df = cleaning_engine.get_cleaned_version(dataset_id)
    if cleaned_df is not None:
        col_data = []
        total_rows = len(cleaned_df)
        for col in cleaned_df.columns:
            missing_count = int(cleaned_df[col].isna().sum())
            col_data.append({
                "column_name": str(col),
                "data_type": str(cleaned_df[col].dtype),
                "missing_values_count": missing_count,
                "missing_values_formatted": f"{missing_count} ({(missing_count / total_rows * 100):.1f}%)" if total_rows > 0 else "0",
                "unique_values": int(cleaned_df[col].nunique(dropna=False))
            })
        return {
            "dataset_id": dataset_id,
            "version": "cleaned",
            "total_columns": len(col_data),
            "columns": col_data
        }

    columns = dataset_service.get_column_details(dataset_id)
    if columns is None:
        raise HTTPException(status_code=404, detail="Dataset not found or expired.")
    return {
        "dataset_id": dataset_id,
        "version": "original",
        "total_columns": len(columns),
        "columns": columns
    }


# ==========================================
# PHASE 2 AUTOMATED DATA CLEANING ENDPOINTS
# ==========================================

@router.get("/dataset/{dataset_id}/profile")
def get_data_profile(dataset_id: str):
    """Comprehensive profiling of data types, dates, constants, and cardinality."""
    df = cleaning_engine.get_cleaned_version(dataset_id) or dataset_service.get_dataframe(dataset_id)
    if df is None:
        raise HTTPException(status_code=404, detail="Dataset not found or expired.")

    profile = DataProfiler.profile_dataset(df)
    missing_report = MissingValueHandler.get_missing_report(df)
    duplicates_report = DuplicateHandler.inspect_duplicates(df)
    outliers_report = OutlierHandler.detect_outliers(df)

    return {
        "dataset_id": dataset_id,
        "profile": profile,
        "missing_report": missing_report,
        "duplicates_report": duplicates_report,
        "outliers_report": outliers_report
    }


@router.get("/dataset/{dataset_id}/quality")
def get_data_quality(dataset_id: str):
    """Quality metrics & score for dashboard."""
    df = cleaning_engine.get_cleaned_version(dataset_id) or dataset_service.get_dataframe(dataset_id)
    if df is None:
        raise HTTPException(status_code=404, detail="Dataset not found or expired.")

    profile = DataProfiler.profile_dataset(df)
    total_cells = profile["total_records"] * profile["total_columns"]
    missing_ratio = (profile["total_missing_values"] / total_cells) if total_cells > 0 else 0
    duplicate_ratio = (profile["total_duplicate_rows"] / profile["total_records"]) if profile["total_records"] > 0 else 0

    # Calculate 0-100 quality score dynamically
    quality_score = max(0, min(100, int(100 - (missing_ratio * 50) - (duplicate_ratio * 50))))

    return {
        "dataset_id": dataset_id,
        "quality_score": quality_score,
        "total_records": profile["total_records"],
        "total_columns": profile["total_columns"],
        "total_missing_values": profile["total_missing_values"],
        "total_duplicate_rows": profile["total_duplicate_rows"],
        "attention_columns": profile["columns_requiring_attention"]
    }


@router.post("/dataset/{dataset_id}/clean/preview")
def preview_cleaning(dataset_id: str, config: Dict[str, Any] = Body(...)):
    """
    Accepts cleaning configuration and simulates transformations in-memory.
    DOES NOT overwrite or modify stored dataset.
    """
    orig_df = dataset_service.get_dataframe(dataset_id)
    if orig_df is None:
        raise HTTPException(status_code=404, detail="Dataset not found or expired.")

    transformed_df, summary = cleaning_engine.run_cleaning_pipeline(orig_df, config)

    # Return preview of proposed transformed rows
    preview_df = transformed_df.head(20).copy()
    preview_df = preview_df.replace({np.nan: None, np.inf: None, -np.inf: None})

    return {
        "dataset_id": dataset_id,
        "summary": summary,
        "preview_rows": preview_df.to_dict(orient="records"),
        "columns": [str(c) for c in transformed_df.columns]
    }


@router.post("/dataset/{dataset_id}/clean/apply")
def apply_cleaning(dataset_id: str, config: Dict[str, Any] = Body(...)):
    """
    Applies user-selected cleaning operations to a SEPARATE cleaned dataset version.
    Original dataset remains 100% untouched.
    """
    orig_df = dataset_service.get_dataframe(dataset_id)
    if orig_df is None:
        raise HTTPException(status_code=404, detail="Dataset not found or expired.")

    cleaned_df, summary = cleaning_engine.run_cleaning_pipeline(orig_df, config)
    cleaning_engine.save_cleaned_version(dataset_id, cleaned_df, summary)

    # Calculate new KPIs
    new_kpis = dataset_service.calculate_kpis(cleaned_df)

    return {
        "success": True,
        "dataset_id": dataset_id,
        "summary": summary,
        "new_kpis": new_kpis
    }


@router.get("/dataset/{dataset_id}/clean/summary")
def get_cleaning_summary(dataset_id: str):
    """Before-and-after statistics & history log."""
    orig_df = dataset_service.get_dataframe(dataset_id)
    if orig_df is None:
        raise HTTPException(status_code=404, detail="Dataset not found or expired.")

    cleaned_df = cleaning_engine.get_cleaned_version(dataset_id)
    history = cleaning_engine.get_cleaning_history(dataset_id)

    if cleaned_df is None:
        return {
            "has_cleaned_version": False,
            "dataset_id": dataset_id,
            "original_rows": len(orig_df),
            "original_columns": len(orig_df.columns),
            "original_missing": int(orig_df.isna().sum().sum()),
            "original_duplicates": int(orig_df.duplicated().sum())
        }

    return {
        "has_cleaned_version": True,
        "dataset_id": dataset_id,
        "original_rows": len(orig_df),
        "cleaned_rows": len(cleaned_df),
        "original_missing": int(orig_df.isna().sum().sum()),
        "remaining_missing": int(cleaned_df.isna().sum().sum()),
        "original_duplicates": int(orig_df.duplicated().sum()),
        "remaining_duplicates": int(cleaned_df.duplicated().sum()),
        "history": history
    }


@router.post("/dataset/{dataset_id}/clean/reset")
def reset_cleaning(dataset_id: str):
    """Resets active state back to original uploaded dataset."""
    orig_df = dataset_service.get_dataframe(dataset_id)
    if orig_df is None:
        raise HTTPException(status_code=404, detail="Dataset not found or expired.")

    cleaning_engine.reset_cleaned_version(dataset_id)
    orig_kpis = dataset_service.calculate_kpis(orig_df)

    return {
        "success": True,
        "message": "Reset to original dataset successfully.",
        "dataset_id": dataset_id,
        "kpis": orig_kpis
    }


@router.get("/dataset/{dataset_id}/export")
def export_dataset(dataset_id: str, format: str = Query("csv", pattern="^(csv|xlsx)$"), version: str = Query("cleaned")):
    """Downloads either the cleaned or original dataset as CSV or Excel."""
    if version == "cleaned":
        df = cleaning_engine.get_cleaned_version(dataset_id)
        if df is None:
            df = dataset_service.get_dataframe(dataset_id)
    else:
        df = dataset_service.get_dataframe(dataset_id)

    if df is None:
        raise HTTPException(status_code=404, detail="Dataset not found or expired.")

    meta = dataset_service.get_metadata(dataset_id)
    base_name = meta["file_name"].rsplit(".", 1)[0] if meta else f"dataset_{dataset_id[:8]}"
    clean_tag = "_cleaned" if version == "cleaned" else "_original"

    if format == "csv":
        csv_buffer = io.StringIO()
        df.to_csv(csv_buffer, index=False)
        csv_bytes = csv_buffer.getvalue().encode("utf-8")
        return Response(
            content=csv_bytes,
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{base_name}{clean_tag}.csv"'}
        )
    else: # xlsx
        xlsx_buffer = io.BytesIO()
        with pd.ExcelWriter(xlsx_buffer, engine='openpyxl') as writer:
            df.to_excel(writer, index=False)
        xlsx_buffer.seek(0)
        return StreamingResponse(
            xlsx_buffer,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f'attachment; filename="{base_name}{clean_tag}.xlsx"'}
        )
