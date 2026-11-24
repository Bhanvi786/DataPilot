"""
Missing Value Handler for DataPilot.
Supports Mean, Median, Mode, User-Defined Constants, Row Dropping, and Column Retaining.
"""
from typing import Dict, Any, Tuple
import pandas as pd
import numpy as np


class MissingValueHandler:
    """Applies column-wise missing value treatments dynamically."""

    @staticmethod
    def get_missing_report(df: pd.DataFrame) -> list[Dict[str, Any]]:
        total_rows = len(df)
        report = []
        for col in df.columns:
            missing_count = int(df[col].isna().sum())
            if missing_count > 0:
                is_numeric = pd.api.types.is_numeric_dtype(df[col])
                report.append({
                    "column_name": str(col),
                    "missing_count": missing_count,
                    "missing_percentage": round((missing_count / total_rows * 100), 2) if total_rows > 0 else 0,
                    "is_numeric": is_numeric,
                    "default_treatment": "mean" if is_numeric else "mode"
                })
        return report

    @staticmethod
    def apply_treatment(df: pd.DataFrame, strategy_map: Dict[str, Dict[str, Any]]) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        strategy_map example:
        {
           "ColumnA": {"action": "mean"},
           "ColumnB": {"action": "constant", "value": "Unknown"},
           "ColumnC": {"action": "drop_rows"},
           "ColumnD": {"action": "keep"}
        }
        """
        modified_df = df.copy()
        report = {
            "imputed_columns": {},
            "dropped_rows": 0
        }

        # Columns marked for drop_rows are handled in batch
        cols_to_drop_rows = [col for col, cfg in strategy_map.items() if cfg.get("action") == "drop_rows" and col in modified_df.columns]
        if cols_to_drop_rows:
            initial_rows = len(modified_df)
            modified_df = modified_df.dropna(subset=cols_to_drop_rows)
            report["dropped_rows"] = initial_rows - len(modified_df)

        for col, cfg in strategy_map.items():
            if col not in modified_df.columns:
                continue

            action = cfg.get("action", "keep")
            series = modified_df[col]
            missing_before = int(series.isna().sum())
            if missing_before == 0 or action == "keep" or action == "drop_rows":
                continue

            if action == "mean" and pd.api.types.is_numeric_dtype(series):
                mean_val = series.mean()
                if not pd.isna(mean_val):
                    modified_df[col] = series.fillna(mean_val)
                    report["imputed_columns"][col] = f"Mean ({round(float(mean_val), 2)})"

            elif action == "median" and pd.api.types.is_numeric_dtype(series):
                median_val = series.median()
                if not pd.isna(median_val):
                    modified_df[col] = series.fillna(median_val)
                    report["imputed_columns"][col] = f"Median ({round(float(median_val), 2)})"

            elif action == "mode":
                mode_vals = series.mode(dropna=True)
                if not mode_vals.empty:
                    fill_val = mode_vals.iloc[0]
                    modified_df[col] = series.fillna(fill_val)
                    report["imputed_columns"][col] = f"Mode ({fill_val})"

            elif action == "constant":
                custom_val = cfg.get("value", "")
                # Attempt to cast constant to numeric if column is numeric
                if pd.api.types.is_numeric_dtype(series):
                    try:
                        custom_val = float(custom_val) if "." in str(custom_val) else int(custom_val)
                    except (ValueError, TypeError):
                        pass
                modified_df[col] = series.fillna(custom_val)
                report["imputed_columns"][col] = f"Constant ('{custom_val}')"

        return modified_df, report
