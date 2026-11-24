"""
Data Loader Module for DataPilot.
Handles dynamic loading, format detection, encoding fallback, and summary extraction for datasets.
"""
from typing import Tuple, Dict, Any, Optional
import io
import os
import pandas as pd
import numpy as np


def format_file_size(size_bytes: int) -> str:
    """Format file size in bytes to human-readable string."""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.2f} KB"
    else:
        return f"{size_bytes / (1024 * 1024):.2f} MB"


def load_dataset(uploaded_file) -> Tuple[Optional[pd.DataFrame], Optional[str]]:
    """
    Load a CSV or Excel file into a Pandas DataFrame dynamically.
    Handles multiple encodings, empty files, and format checks.
    
    Returns:
        (df, None) on success
        (None, error_message) on failure
    """
    if uploaded_file is None:
        return None, "No file uploaded."
    
    filename = uploaded_file.name
    ext = os.path.splitext(filename)[1].lower()

    if ext not in [".csv", ".xlsx", ".xls"]:
        return None, f"Unsupported file format '{ext}'. Please upload a CSV or Excel (.xlsx) file."

    try:
        # Check size if available
        file_bytes = uploaded_file.getvalue()
        if len(file_bytes) == 0:
            return None, "The uploaded file is empty."

        buffer = io.BytesIO(file_bytes)

        if ext == ".csv":
            encodings = ["utf-8", "utf-8-sig", "latin1", "cp1252", "iso-8859-1"]
            df = None
            last_err = None

            for enc in encodings:
                try:
                    buffer.seek(0)
                    df = pd.read_csv(buffer, encoding=enc)
                    break
                except UnicodeDecodeError as e:
                    last_err = e
                    continue
                except Exception as e:
                    return None, f"Error reading CSV file: {str(e)}"

            if df is None:
                return None, f"Could not decode CSV file using standard encodings: {str(last_err)}"

        else: # Excel
            try:
                buffer.seek(0)
                df = pd.read_excel(buffer)
            except Exception as e:
                return None, f"Error reading Excel file: {str(e)}"

        if df.empty:
            return None, "The uploaded dataset contains no rows or data."

        return df, None

    except Exception as e:
        return None, f"Unexpected error processing dataset: {str(e)}"


def get_dataset_kpis(df: pd.DataFrame) -> Dict[str, Any]:
    """Calculate key KPIs dynamically from the dataframe."""
    total_rows = int(df.shape[0])
    total_columns = int(df.shape[1])
    missing_values = int(df.isna().sum().sum())
    duplicate_rows = int(df.duplicated().sum())

    return {
        "total_rows": total_rows,
        "total_columns": total_columns,
        "missing_values": missing_values,
        "duplicate_rows": duplicate_rows
    }


def get_column_details(df: pd.DataFrame) -> pd.DataFrame:
    """Generate summary information for all columns dynamically."""
    col_data = []
    for col in df.columns:
        dtype = str(df[col].dtype)
        missing_count = int(df[col].isna().sum())
        missing_pct = (missing_count / len(df) * 100) if len(df) > 0 else 0
        unique_count = int(df[col].nunique(dropna=False))
        
        col_data.append({
            "Column Name": str(col),
            "Data Type": dtype,
            "Missing Values": f"{missing_count} ({missing_pct:.1f}%)",
            "Unique Values": unique_count
        })

    return pd.DataFrame(col_data)


def get_dataset_metadata(uploaded_file, df: pd.DataFrame) -> Dict[str, Any]:
    """Extract metadata about the dataset dynamically."""
    file_size_str = format_file_size(len(uploaded_file.getvalue())) if uploaded_file else "Unknown"
    filename = uploaded_file.name if uploaded_file else "Unknown"

    return {
        "file_name": filename,
        "file_size": file_size_str,
        "records": int(df.shape[0]),
        "features": int(df.shape[1])
    }
