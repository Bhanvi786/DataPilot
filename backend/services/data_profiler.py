"""
Data Profiler Service for DataPilot.
Analyzes column types, cardinality, missingness, date candidates, and constant columns dynamically.
"""
from typing import Dict, Any, List
import pandas as pd
import numpy as np


class DataProfiler:
    """Performs deep dynamic schema and quality profiling without hardcoded assumptions."""

    @staticmethod
    def profile_dataset(df: pd.DataFrame) -> Dict[str, Any]:
        total_rows = len(df)
        total_columns = len(df.columns)
        total_cells = total_rows * total_columns
        total_missing = int(df.isna().sum().sum())
        missing_pct = round((total_missing / total_cells * 100), 2) if total_cells > 0 else 0
        total_duplicates = int(df.duplicated().sum())

        columns_profile = []
        attention_columns = []

        for col in df.columns:
            series = df[col]
            missing_count = int(series.isna().sum())
            col_missing_pct = round((missing_count / total_rows * 100), 2) if total_rows > 0 else 0
            unique_count = int(series.nunique(dropna=False))
            non_null_count = int(series.notna().sum())

            # Detect classified semantic type
            classified_type, is_date_candidate, is_constant = DataProfiler.classify_column_type(series)

            if col_missing_pct > 0 or is_constant or unique_count == 1:
                attention_columns.append(str(col))

            columns_profile.append({
                "column_name": str(col),
                "raw_data_type": str(series.dtype),
                "classified_type": classified_type,
                "non_null_count": non_null_count,
                "missing_count": missing_count,
                "missing_percentage": col_missing_pct,
                "unique_values": unique_count,
                "is_date_candidate": is_date_candidate,
                "is_constant": is_constant,
                "sample_values": [
                    None if pd.isna(v) else str(v)
                    for v in series.dropna().head(3).tolist()
                ]
            })

        return {
            "total_records": total_rows,
            "total_columns": total_columns,
            "total_missing_values": total_missing,
            "missing_percentage": missing_pct,
            "total_duplicate_rows": total_duplicates,
            "columns_requiring_attention": attention_columns,
            "columns": columns_profile
        }

    @staticmethod
    def classify_column_type(series: pd.Series) -> tuple[str, bool, bool]:
        """Classify column into Integer, Float, String, Boolean, Datetime, or Categorical."""
        non_null = series.dropna()
        if len(non_null) == 0:
            return "Empty", False, True

        is_constant = (series.nunique(dropna=False) <= 1)
        dtype = series.dtype

        # Boolean
        if pd.api.types.is_bool_dtype(dtype) or (set(non_null.unique()).issubset({True, False, 0, 1}) and len(non_null.unique()) <= 2 and dtype == 'bool'):
            return "Boolean", False, is_constant

        # Datetime
        if pd.api.types.is_datetime64_any_dtype(dtype):
            return "Datetime", True, is_constant

        # Check date string candidate
        is_date_candidate = False
        if pd.api.types.is_string_dtype(dtype) or pd.api.types.is_object_dtype(dtype):
            sample = non_null.head(10).astype(str)
            date_matches = 0
            for val in sample:
                val_clean = val.strip()
                if len(val_clean) >= 6 and any(sep in val_clean for sep in ["-", "/", "."]):
                    try:
                        pd.to_datetime(val_clean, errors='raise')
                        date_matches += 1
                    except Exception:
                        pass
            if len(sample) > 0 and date_matches / len(sample) >= 0.7:
                is_date_candidate = True

        # Numeric
        if pd.api.types.is_integer_dtype(dtype):
            # Check if it looks like an identifier vs real metric
            return "Integer", False, is_constant

        if pd.api.types.is_float_dtype(dtype):
            return "Float", False, is_constant

        # Object / String / Categorical
        if pd.api.types.is_categorical_dtype(dtype) or (len(non_null) > 10 and series.nunique() / len(non_null) < 0.2):
            return "Categorical", is_date_candidate, is_constant

        return "String", is_date_candidate, is_constant
