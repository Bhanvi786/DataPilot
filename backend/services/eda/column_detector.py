"""
Column Detector Service for EDA.
Intelligently classifies columns:
- continuous numerical (including currency strings / formatted numbers)
- discrete temporal components (Year, Month, Day, Quarter)
- low-cardinality categorical
- high-cardinality categorical
- identifiers / keys (e.g. Product_ID, Customer_ID, Order_ID, Outlet_ID)
- boolean, datetime, and constants.
"""
from typing import Dict, Any, List
import pandas as pd
import numpy as np
import re


class ColumnDetector:
    """Intelligently detects column roles and semantic types without hardcoded column names."""

    TEMPORAL_NAME_HINTS = {"year", "yr", "month", "mon", "day", "quarter", "qtr", "week", "wk", "hour", "hr"}

    @staticmethod
    def is_identifier(series: pd.Series, col_name: str) -> bool:
        """Determines if a column is an identifier/key based on name, cardinality, and string/int patterns."""
        name_lower = str(col_name).lower().strip()
        non_null = series.dropna()
        if len(non_null) == 0:
            return False

        unique_cnt = series.nunique()
        unique_ratio = unique_cnt / len(non_null)
        total_len = len(non_null)

        # Do not treat continuous metrics or money amounts as identifiers
        if any(term in name_lower for term in ["sale", "price", "amount", "cost", "profit", "revenue", "rate", "score", "total"]):
            return False

        # Do not treat floats as identifiers (e.g. Unit_Price_INR)
        if pd.api.types.is_float_dtype(series):
            return False

        # Name hints: _id, id_, code, num, number, key, trx, no, ref, outlet_id, product_id, etc.
        has_id_name = any(
            hint in name_lower
            for hint in ["_id", "id_", "identifier", "code", "key", "ref", "trx", "uuid", "guid"]
        ) or name_lower.endswith("_id") or name_lower.startswith("id_") or name_lower == "id"

        # Case 1: High uniqueness with ID name hint (e.g., Outlet_ID with 20-50 unique IDs across rows, Product_ID)
        if has_id_name and (unique_ratio > 0.05 or unique_cnt > 20):
            return True

        # Case 2: Near 100% uniqueness in strings or integer codes (e.g. Transaction codes, barcodes)
        if unique_ratio > 0.85 and total_len >= 10 and not pd.api.types.is_float_dtype(series):
            if pd.api.types.is_string_dtype(series) or pd.api.types.is_object_dtype(series):
                if total_len > 30:
                    return True
            elif pd.api.types.is_integer_dtype(series) and any(hint in name_lower for hint in ["id", "no", "num", "code"]):
                return True

        # Case 3: Strings with alphanumeric patterns like ABC-123 or PRD-001 with ID hint
        if (pd.api.types.is_string_dtype(series) or pd.api.types.is_object_dtype(series)) and has_id_name:
            sample = non_null.head(20).astype(str)
            pattern_matches = sum(1 for val in sample if any(c.isdigit() for c in val) and any(c.isalpha() for c in val))
            if len(sample) > 0 and pattern_matches / len(sample) >= 0.7:
                return True

        return False

    @staticmethod
    def is_temporal_component(series: pd.Series, col_name: str) -> bool:
        """Identifies discrete temporal components like Year, Month, Day, Quarter."""
        name_lower = str(col_name).lower().strip()
        non_null = series.dropna()
        if len(non_null) == 0:
            return False

        is_name_match = any(hint == name_lower or f"_{hint}" in name_lower or f"{hint}_" in name_lower for hint in ColumnDetector.TEMPORAL_NAME_HINTS)

        if not pd.api.types.is_numeric_dtype(series):
            return False

        # Year check: values between 1900 and 2100
        if "year" in name_lower or (series.min() >= 1950 and series.max() <= 2050 and series.nunique() <= 50):
            return True

        # Month check: integers 1 to 12
        if "month" in name_lower or (is_name_match and series.min() >= 1 and series.max() <= 12 and series.nunique() <= 12):
            return True

        # Quarter check: integers 1 to 4
        if "quarter" in name_lower or (is_name_match and series.min() >= 1 and series.max() <= 4 and series.nunique() <= 4):
            return True

        # Day check: integers 1 to 31
        if "day" in name_lower and series.min() >= 1 and series.max() <= 31 and series.nunique() <= 31:
            return True

        return False

    @staticmethod
    def is_coercible_numeric(series: pd.Series) -> bool:
        """Checks if a string series contains formatted numbers (e.g. '$1,200.50', '150.0')."""
        if pd.api.types.is_numeric_dtype(series):
            return True
        if not (pd.api.types.is_string_dtype(series) or pd.api.types.is_object_dtype(series)):
            return False
        non_null = series.dropna()
        if len(non_null) == 0:
            return False
        sample = non_null.head(20).astype(str)
        # Strip currency symbols and commas
        cleaned = sample.str.replace(r'[$,₹€£,\s]', '', regex=True)
        coerced = pd.to_numeric(cleaned, errors='coerce')
        return (coerced.notna().sum() / len(sample)) >= 0.85

    @staticmethod
    def detect_columns(df: pd.DataFrame) -> Dict[str, List[str]]:
        numerical = []
        temporal_components = []
        categorical = []
        high_cardinality = []
        boolean = []
        datetime = []
        text = []
        identifiers = []
        constants = []

        total_rows = len(df)

        for col in df.columns:
            series = df[col]
            non_null = series.dropna()

            # Constant column
            if series.nunique(dropna=False) <= 1:
                constants.append(str(col))
                continue

            # Boolean check
            if pd.api.types.is_bool_dtype(series) or (set(non_null.unique()).issubset({True, False, 0, 1}) and len(non_null.unique()) <= 2 and series.dtype == 'bool'):
                boolean.append(str(col))
                continue

            # Datetime check
            if pd.api.types.is_datetime64_any_dtype(series):
                datetime.append(str(col))
                continue

            # Potential datetime string check
            if pd.api.types.is_string_dtype(series) or pd.api.types.is_object_dtype(series):
                sample = non_null.head(10).astype(str)
                date_matches = 0
                for val in sample:
                    v_str = val.strip()
                    if len(v_str) >= 6 and any(sep in v_str for sep in ["-", "/", "."]):
                        try:
                            pd.to_datetime(v_str, errors='raise')
                            date_matches += 1
                        except Exception:
                            pass
                if len(sample) > 0 and date_matches / len(sample) >= 0.7:
                    datetime.append(str(col))
                    continue

            # Identifier check (Product_ID, Customer_ID, Outlet_ID, Order_ID, etc.)
            if ColumnDetector.is_identifier(series, str(col)):
                identifiers.append(str(col))
                continue

            # Discrete temporal component (Year, Month, Day, Quarter)
            if ColumnDetector.is_temporal_component(series, str(col)):
                temporal_components.append(str(col))
                continue

            # Continuous Numerical (either native numeric or formatted numeric strings like $1,200)
            if pd.api.types.is_numeric_dtype(series) or ColumnDetector.is_coercible_numeric(series):
                numerical.append(str(col))
                continue

            # Categorical vs Free Text
            unique_cnt = series.nunique()
            unique_ratio = unique_cnt / len(non_null) if len(non_null) > 0 else 0
            if unique_ratio > 0.85 and len(non_null) > 20:
                text.append(str(col))
            else:
                categorical.append(str(col))
                if unique_cnt > 20:
                    high_cardinality.append(str(col))

        return {
            "numerical": numerical,
            "temporal_components": temporal_components,
            "categorical": categorical,
            "high_cardinality": high_cardinality,
            "boolean": boolean,
            "datetime": datetime,
            "text": text,
            "identifiers": identifiers,
            "constants": constants,
            "all_columns": [str(c) for c in df.columns]
        }
