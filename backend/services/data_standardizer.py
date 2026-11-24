"""
Data Standardizer for DataPilot.
Strips whitespace, converts empty strings to NaN, handles casing, and date parsing safely.
"""
from typing import Dict, Any, Tuple
import pandas as pd
import numpy as np


class DataStandardizer:
    """Performs non-destructive textual and schema standardization."""

    @staticmethod
    def standardize(
        df: pd.DataFrame,
        strip_whitespace: bool = True,
        empty_strings_to_nan: bool = True,
        case_standardization: Dict[str, str] = None, # e.g. {"Category": "lower" | "upper" | "title"}
        date_columns: list[str] = None
    ) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        modified_df = df.copy()
        report = {
            "stripped_columns": [],
            "empty_strings_handled": 0,
            "casing_applied": {},
            "dates_standardized": []
        }

        # 1. Whitespace stripping & empty string conversions
        for col in modified_df.columns:
            if pd.api.types.is_string_dtype(modified_df[col]) or pd.api.types.is_object_dtype(modified_df[col]):
                if strip_whitespace:
                    modified_df[col] = modified_df[col].apply(lambda x: x.strip() if isinstance(x, str) else x)
                    report["stripped_columns"].append(str(col))

                if empty_strings_to_nan:
                    empty_mask = (modified_df[col] == "") | (modified_df[col] == " ")
                    empty_count = int(empty_mask.sum())
                    if empty_count > 0:
                        modified_df.loc[empty_mask, col] = np.nan
                        report["empty_strings_handled"] += empty_count

        # 2. Case standardization
        if case_standardization:
            for col, casing in case_standardization.items():
                if col in modified_df.columns and casing:
                    series = modified_df[col]
                    if casing == "lower":
                        modified_df[col] = series.apply(lambda x: x.lower() if isinstance(x, str) else x)
                        report["casing_applied"][col] = "Lowercase"
                    elif casing == "upper":
                        modified_df[col] = series.apply(lambda x: x.upper() if isinstance(x, str) else x)
                        report["casing_applied"][col] = "Uppercase"
                    elif casing == "title":
                        modified_df[col] = series.apply(lambda x: x.title() if isinstance(x, str) else x)
                        report["casing_applied"][col] = "Title Case"

        # 3. Date standardization
        if date_columns:
            for col in date_columns:
                if col in modified_df.columns:
                    try:
                        modified_df[col] = pd.to_datetime(modified_df[col], errors='coerce').dt.strftime('%Y-%m-%d')
                        report["dates_standardized"].append(col)
                    except Exception:
                        pass

        return modified_df, report
