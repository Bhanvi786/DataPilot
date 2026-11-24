"""
Dataset Processing Service for DataPilot.
Reuses and standardizes core Python parsing logic from Phase 1.
"""
from typing import Tuple, Dict, Any, Optional, List
import io
import os
import uuid
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


class DatasetService:
    """Service handling dataset parsing, calculations, and storage."""

    def __init__(self, storage_dir: str):
        self.storage_dir = storage_dir
        os.makedirs(self.storage_dir, exist_ok=True)
        # In-memory dataframe cache for fast access
        self._cache: Dict[str, pd.DataFrame] = {}
        self._meta_cache: Dict[str, Dict[str, Any]] = {}

    def _get_storage_path(self, dataset_id: str) -> str:
        return os.path.join(self.storage_dir, f"{dataset_id}.parquet")

    def load_from_bytes(self, filename: str, file_bytes: bytes) -> Tuple[Optional[str], Optional[Dict[str, Any]], Optional[str]]:
        """
        Parses uploaded bytes with encoding fallbacks and stores parsed DataFrame.
        Returns (dataset_id, metadata_dict, error_message)
        """
        if not file_bytes or len(file_bytes) == 0:
            return None, None, "The uploaded file is empty."

        ext = os.path.splitext(filename)[1].lower()
        if ext not in [".csv", ".xlsx", ".xls"]:
            return None, None, f"Unsupported file format '{ext}'. Only CSV and Excel (.xlsx) files are supported."

        buffer = io.BytesIO(file_bytes)
        df: Optional[pd.DataFrame] = None

        if ext == ".csv":
            encodings = ["utf-8", "utf-8-sig", "latin1", "cp1252", "iso-8859-1"]
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
                    return None, None, f"Error parsing CSV file: {str(e)}"

            if df is None:
                return None, None, f"Failed to decode CSV with supported encodings: {str(last_err)}"
        else: # Excel
            try:
                buffer.seek(0)
                df = pd.read_excel(buffer)
            except Exception as e:
                return None, None, f"Error parsing Excel file: {str(e)}"

        if df.empty:
            return None, None, "The uploaded dataset contains no rows or data."

        # Assign unique dataset ID
        dataset_id = str(uuid.uuid4())

        # Clean column names (strip whitespace, ensure string)
        df.columns = [str(c).strip() for c in df.columns]

        # Calculate KPIs
        kpis = self.calculate_kpis(df)
        metadata = {
            "dataset_id": dataset_id,
            "file_name": filename,
            "file_size": format_file_size(len(file_bytes)),
            "file_size_bytes": len(file_bytes),
            "records": int(df.shape[0]),
            "features": int(df.shape[1]),
            "kpis": kpis
        }

        # Cache in memory and persist
        self._cache[dataset_id] = df
        self._meta_cache[dataset_id] = metadata

        try:
            # Store as parquet for clean persistence without path leaks
            df.to_parquet(self._get_storage_path(dataset_id), index=False)
        except Exception:
            # Fallback to pickle if parquet engine has type conflicts
            df.to_pickle(self._get_storage_path(dataset_id).replace(".parquet", ".pkl"))

        return dataset_id, metadata, None

    def get_dataframe(self, dataset_id: str) -> Optional[pd.DataFrame]:
        """Fetch DataFrame from cache or storage."""
        if dataset_id in self._cache:
            return self._cache[dataset_id]

        parquet_path = self._get_storage_path(dataset_id)
        pkl_path = parquet_path.replace(".parquet", ".pkl")

        if os.path.exists(parquet_path):
            try:
                df = pd.read_parquet(parquet_path)
                self._cache[dataset_id] = df
                return df
            except Exception:
                pass

        if os.path.exists(pkl_path):
            try:
                df = pd.read_pickle(pkl_path)
                self._cache[dataset_id] = df
                return df
            except Exception:
                pass

        return None

    def get_metadata(self, dataset_id: str) -> Optional[Dict[str, Any]]:
        """Return dataset metadata and KPIs."""
        if dataset_id in self._meta_cache:
            return self._meta_cache[dataset_id]

        df = self.get_dataframe(dataset_id)
        if df is None:
            return None

        kpis = self.calculate_kpis(df)
        meta = {
            "dataset_id": dataset_id,
            "file_name": f"Dataset_{dataset_id[:8]}",
            "file_size": "Cached",
            "file_size_bytes": 0,
            "records": int(df.shape[0]),
            "features": int(df.shape[1]),
            "kpis": kpis
        }
        self._meta_cache[dataset_id] = meta
        return meta

    def calculate_kpis(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Dynamically compute KPI metrics."""
        return {
            "total_rows": int(df.shape[0]),
            "total_columns": int(df.shape[1]),
            "missing_values": int(df.isna().sum().sum()),
            "duplicate_rows": int(df.duplicated().sum())
        }

    def get_preview(self, dataset_id: str, limit: int = 20) -> Optional[List[Dict[str, Any]]]:
        """Return the first N rows as sanitized JSON-serializable dictionaries."""
        df = self.get_dataframe(dataset_id)
        if df is None:
            return None

        sample_df = df.head(limit).copy()
        # Replace NaN / inf values with None for clean JSON serialization
        sample_df = sample_df.replace({np.nan: None, np.inf: None, -np.inf: None})
        
        # Convert timestamp / objects to string
        for col in sample_df.columns:
            if pd.api.types.is_datetime64_any_dtype(sample_df[col]):
                sample_df[col] = sample_df[col].astype(str)

        return sample_df.to_dict(orient="records")

    def get_column_details(self, dataset_id: str) -> Optional[List[Dict[str, Any]]]:
        """Compute column schema, data types, missing counts, and unique value counts."""
        df = self.get_dataframe(dataset_id)
        if df is None:
            return None

        total_rows = len(df)
        col_data = []

        for col in df.columns:
            dtype_str = str(df[col].dtype)
            missing_count = int(df[col].isna().sum())
            missing_pct = (missing_count / total_rows * 100) if total_rows > 0 else 0
            unique_count = int(df[col].nunique(dropna=False))

            col_data.append({
                "column_name": str(col),
                "data_type": dtype_str,
                "missing_values_count": missing_count,
                "missing_values_formatted": f"{missing_count} ({missing_pct:.1f}%)",
                "missing_percentage": round(missing_pct, 2),
                "unique_values": unique_count
            })

        return col_data
