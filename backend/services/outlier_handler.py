"""
Outlier Handler for DataPilot.
Applies Interquartile Range (IQR = Q3 - Q1) outlier detection, capping, and removal.
"""
from typing import Dict, Any, Tuple, List
import pandas as pd
import numpy as np


class OutlierHandler:
    """Detects and mitigates numerical outliers using IQR methodology."""

    @staticmethod
    def detect_outliers(df: pd.DataFrame, exclude_cols: List[str] = None) -> List[Dict[str, Any]]:
        exclude = set(exclude_cols or [])
        results = []

        for col in df.columns:
            if col in exclude:
                continue

            series = df[col]
            # Exclude boolean types explicitly (in pandas, bool can pass is_numeric_dtype)
            if pd.api.types.is_bool_dtype(series) or not pd.api.types.is_numeric_dtype(series):
                continue

            # Skip identifiers (high-cardinality integers or 100% unique sequences)
            if pd.api.types.is_integer_dtype(series) and series.nunique() == len(series.dropna()) and len(series) > 5:
                continue

            non_null = series.dropna()
            if len(non_null) < 4:
                continue

            q1 = float(non_null.quantile(0.25))
            q3 = float(non_null.quantile(0.75))
            iqr = q3 - q1

            if iqr == 0:
                continue

            lower_bound = q1 - 1.5 * iqr
            upper_bound = q3 + 1.5 * iqr

            outliers_mask = (series < lower_bound) | (series > upper_bound)
            outlier_count = int(outliers_mask.sum())
            outlier_pct = round((outlier_count / len(non_null) * 100), 2) if len(non_null) > 0 else 0

            # Sample records
            sample_outlier_vals = non_null[outliers_mask].head(5).tolist()

            results.append({
                "column_name": str(col),
                "q1": round(q1, 2),
                "q3": round(q3, 2),
                "iqr": round(iqr, 2),
                "lower_bound": round(lower_bound, 2),
                "upper_bound": round(upper_bound, 2),
                "outlier_count": outlier_count,
                "outlier_percentage": outlier_pct,
                "sample_outliers": [round(float(v), 2) for v in sample_outlier_vals],
                "action": "keep"
            })

        return results

    @staticmethod
    def apply_treatment(df: pd.DataFrame, outlier_configs: Dict[str, str]) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        outlier_configs example:
        {
          "Price": "cap",      # cap at lower/upper bound
          "Score": "remove",   # drop rows where outlier occurs
          "Age": "keep"        # do nothing
        }
        """
        modified_df = df.copy()
        report = {
            "capped_columns": {},
            "removed_rows": 0
        }

        rows_to_remove = pd.Series(False, index=modified_df.index)

        for col, action in outlier_configs.items():
            if col not in modified_df.columns or action == "keep":
                continue

            series = modified_df[col]
            if pd.api.types.is_bool_dtype(series) or not pd.api.types.is_numeric_dtype(series):
                continue

            non_null = series.dropna()
            if len(non_null) < 4:
                continue

            q1 = float(non_null.quantile(0.25))
            q3 = float(non_null.quantile(0.75))
            iqr = q3 - q1
            lower_bound = q1 - 1.5 * iqr
            upper_bound = q3 + 1.5 * iqr

            outliers_mask = (series < lower_bound) | (series > upper_bound)

            if action == "cap":
                capped_series = series.clip(lower=lower_bound, upper=upper_bound)
                modified_df[col] = capped_series
                report["capped_columns"][col] = f"Capped to [{round(lower_bound, 2)}, {round(upper_bound, 2)}]"

            elif action == "remove":
                rows_to_remove = rows_to_remove | outliers_mask.fillna(False)

        if rows_to_remove.any():
            initial_len = len(modified_df)
            modified_df = modified_df[~rows_to_remove]
            report["removed_rows"] = initial_len - len(modified_df)

        return modified_df, report
