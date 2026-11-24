"""
Cleaning Engine for DataPilot.
Orchestrates preview and execution across all handlers.
Maintains Original, Cleaned, and Proposed versions strictly.
"""
from typing import Dict, Any, Tuple, Optional
import os
import pandas as pd
import numpy as np

from services.data_profiler import DataProfiler
from services.missing_value_handler import MissingValueHandler
from services.duplicate_handler import DuplicateHandler
from services.datatype_handler import DataTypeHandler
from services.outlier_handler import OutlierHandler
from services.data_standardizer import DataStandardizer


class CleaningEngine:
    """Manages cleaning pipelines and versioned dataset states."""

    def __init__(self, storage_dir: str):
        self.storage_dir = storage_dir
        os.makedirs(self.storage_dir, exist_ok=True)
        # Store cleaning history per dataset
        self._history: Dict[str, list[Dict[str, Any]]] = {}

    def _get_cleaned_path(self, dataset_id: str) -> str:
        return os.path.join(self.storage_dir, f"{dataset_id}_cleaned.parquet")

    def run_cleaning_pipeline(
        self,
        df: pd.DataFrame,
        config: Dict[str, Any]
    ) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        Executes pipeline in deterministic order:
        1. Data Standardization (whitespace, empty string handling)
        2. Data Type Corrections
        3. Duplicate Removal
        4. Outlier Handling (Cap/Remove)
        5. Missing Value Imputation / Dropping
        """
        transformed_df = df.copy()
        transformation_log = []
        modified_columns = set()

        # 1. Standardization
        std_cfg = config.get("standardization", {})
        if std_cfg:
            transformed_df, std_report = DataStandardizer.standardize(
                df=transformed_df,
                strip_whitespace=std_cfg.get("strip_whitespace", True),
                empty_strings_to_nan=std_cfg.get("empty_strings_to_nan", True),
                case_standardization=std_cfg.get("case_standardization", {}),
                date_columns=std_cfg.get("date_columns", [])
            )
            if std_report["empty_strings_handled"] > 0:
                transformation_log.append(f"Standardized empty strings ({std_report['empty_strings_handled']} converted to NaN)")
            if std_report["casing_applied"]:
                transformation_log.append(f"Standardized text casing on {len(std_report['casing_applied'])} column(s)")
                modified_columns.update(std_report["casing_applied"].keys())
            if std_report["dates_standardized"]:
                transformation_log.append(f"Formatted dates to ISO-8601 on {len(std_report['dates_standardized'])} column(s)")
                modified_columns.update(std_report["dates_standardized"])

        # 2. Data Type Conversions
        types_cfg = config.get("data_types", {})
        if types_cfg:
            for col, target_type in types_cfg.items():
                if col in transformed_df.columns and target_type:
                    transformed_df[col], cast_report = DataTypeHandler.convert_column(
                        transformed_df[col], target_type
                    )
                    transformation_log.append(f"Converted '{col}' to {target_type}")
                    modified_columns.add(col)

        # 3. Duplicate Handling
        dup_cfg = config.get("duplicates", {})
        if dup_cfg.get("action") == "remove":
            transformed_df, removed_dups = DuplicateHandler.remove_duplicates(
                transformed_df, keep=dup_cfg.get("keep", "first")
            )
            if removed_dups > 0:
                transformation_log.append(f"Removed {removed_dups} duplicate row(s)")

        # 4. Outliers
        outlier_cfg = config.get("outliers", {})
        if outlier_cfg:
            transformed_df, outlier_report = OutlierHandler.apply_treatment(
                transformed_df, outlier_cfg
            )
            if outlier_report["capped_columns"]:
                transformation_log.append(f"Capped outliers on {len(outlier_report['capped_columns'])} column(s)")
                modified_columns.update(outlier_report["capped_columns"].keys())
            if outlier_report["removed_rows"] > 0:
                transformation_log.append(f"Removed {outlier_report['removed_rows']} outlier row(s)")

        # 5. Missing Values
        missing_cfg = config.get("missing_values", {})
        if missing_cfg:
            transformed_df, missing_report = MissingValueHandler.apply_treatment(
                transformed_df, missing_cfg
            )
            if missing_report["imputed_columns"]:
                transformation_log.append(f"Imputed missing values across {len(missing_report['imputed_columns'])} column(s)")
                modified_columns.update(missing_report["imputed_columns"].keys())
            if missing_report["dropped_rows"] > 0:
                transformation_log.append(f"Dropped {missing_report['dropped_rows']} row(s) containing missing values")

        summary = {
            "initial_rows": len(df),
            "cleaned_rows": len(transformed_df),
            "initial_missing": int(df.isna().sum().sum()),
            "remaining_missing": int(transformed_df.isna().sum().sum()),
            "initial_duplicates": int(df.duplicated().sum()),
            "remaining_duplicates": int(transformed_df.duplicated().sum()),
            "transformations_applied": transformation_log,
            "modified_columns": list(modified_columns)
        }

        return transformed_df, summary

    def save_cleaned_version(self, dataset_id: str, cleaned_df: pd.DataFrame, summary: Dict[str, Any]):
        """Persist cleaned version without touching original dataset."""
        parquet_path = self._get_cleaned_path(dataset_id)
        try:
            cleaned_df.to_parquet(parquet_path, index=False)
        except Exception:
            cleaned_df.to_pickle(parquet_path.replace(".parquet", ".pkl"))

        if dataset_id not in self._history:
            self._history[dataset_id] = []
        self._history[dataset_id].append(summary)

    def get_cleaned_version(self, dataset_id: str) -> Optional[pd.DataFrame]:
        parquet_path = self._get_cleaned_path(dataset_id)
        pkl_path = parquet_path.replace(".parquet", ".pkl")

        if os.path.exists(parquet_path):
            try:
                return pd.read_parquet(parquet_path)
            except Exception:
                pass
        if os.path.exists(pkl_path):
            try:
                return pd.read_pickle(pkl_path)
            except Exception:
                pass
        return None

    def reset_cleaned_version(self, dataset_id: str) -> bool:
        """Removes cleaned copy, resetting active state back to original."""
        parquet_path = self._get_cleaned_path(dataset_id)
        pkl_path = parquet_path.replace(".parquet", ".pkl")
        removed = False
        if os.path.exists(parquet_path):
            os.remove(parquet_path)
            removed = True
        if os.path.exists(pkl_path):
            os.remove(pkl_path)
            removed = True
        if dataset_id in self._history:
            self._history[dataset_id] = []
        return removed

    def get_cleaning_history(self, dataset_id: str) -> list[Dict[str, Any]]:
        return self._history.get(dataset_id, [])
