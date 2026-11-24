"""
Duplicate Handler for DataPilot.
Detects, previews, and removes duplicate rows safely.
"""
from typing import Dict, Any, Tuple, List
import pandas as pd
import numpy as np


class DuplicateHandler:
    """Handles duplicate row detection, inspection, and removal."""

    @staticmethod
    def inspect_duplicates(df: pd.DataFrame, limit: int = 10) -> Dict[str, Any]:
        dup_mask = df.duplicated(keep=False)
        total_dup_rows = int(df.duplicated(keep='first').sum())
        all_duplicate_records = int(dup_mask.sum())

        sample_rows = []
        if all_duplicate_records > 0:
            sample_df = df[dup_mask].head(limit).copy()
            sample_df = sample_df.replace({np.nan: None, np.inf: None, -np.inf: None})
            sample_rows = sample_df.to_dict(orient="records")

        return {
            "duplicate_count": total_dup_rows,
            "total_duplicate_cluster_records": all_duplicate_records,
            "preview_records": sample_rows
        }

    @staticmethod
    def remove_duplicates(df: pd.DataFrame, keep: str = "first") -> Tuple[pd.DataFrame, int]:
        initial_count = len(df)
        cleaned_df = df.drop_duplicates(keep=keep)
        removed_count = initial_count - len(cleaned_df)
        return cleaned_df, removed_count
