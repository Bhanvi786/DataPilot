"""
Filter Engine for Analytics Dashboard.
Supports multi-type dynamic filtering:
- Categorical: Multi-select category filtering (exact match in list)
- Numerical: Range filters (min <= x <= max)
- Date: Chronological intervals (start_date <= date <= end_date)
- Boolean: True / False matching
- Cross-filtering: Click-to-filter from chart categories or time periods
- Combines all active filters using standard Boolean AND logic.
"""
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np


class FilterEngine:
    """Evaluates filter configurations and generates filter panel schemas from dataset columns."""

    @staticmethod
    def _coerce_numeric(series: pd.Series) -> pd.Series:
        if pd.api.types.is_numeric_dtype(series):
            return pd.to_numeric(series, errors='coerce')
        cleaned = series.astype(str).str.replace(r'[$,₹€£,\s]', '', regex=True)
        return pd.to_numeric(cleaned, errors='coerce')

    @staticmethod
    def detect_available_filters(df: pd.DataFrame, column_breakdown: Dict[str, List[str]]) -> List[Dict[str, Any]]:
        """Generates filter control metadata for the frontend filter bar."""
        filter_specs = []

        cat_cols = column_breakdown.get("categorical", [])
        num_cols = column_breakdown.get("numerical", [])
        date_cols = column_breakdown.get("datetime", [])
        bool_cols = column_breakdown.get("boolean", [])

        # 1. Date Filters
        for col in date_cols:
            if col not in df.columns:
                continue
            dt_series = pd.to_datetime(df[col], errors='coerce').dropna()
            if len(dt_series) > 0:
                filter_specs.append({
                    "column": str(col),
                    "type": "date",
                    "title": str(col).replace('_', ' ').title(),
                    "min": dt_series.min().strftime('%Y-%m-%d'),
                    "max": dt_series.max().strftime('%Y-%m-%d'),
                    "default_start": dt_series.min().strftime('%Y-%m-%d'),
                    "default_end": dt_series.max().strftime('%Y-%m-%d')
                })

        # 2. Categorical Filters (Card < 35 to prevent unmanageable select menus)
        for col in cat_cols:
            if col not in df.columns:
                continue
            series = df[col].dropna()
            n_unique = series.nunique()
            if 1 < n_unique <= 35:
                top_options = series.value_counts().head(30).index.astype(str).tolist()
                filter_specs.append({
                    "column": str(col),
                    "type": "categorical",
                    "title": str(col).replace('_', ' ').title(),
                    "options": sorted(top_options),
                    "total_options": n_unique
                })

        # 3. Numerical Range Filters (Pick meaningful numerical features)
        for col in num_cols:
            if col not in df.columns:
                continue
            num_series = FilterEngine._coerce_numeric(df[col]).dropna()
            if len(num_series) > 1 and num_series.nunique() > 2:
                filter_specs.append({
                    "column": str(col),
                    "type": "numerical",
                    "title": str(col).replace('_', ' ').title(),
                    "min": round(float(num_series.min()), 2),
                    "max": round(float(num_series.max()), 2),
                    "step": round((float(num_series.max()) - float(num_series.min())) / 100, 2) or 1
                })

        # 4. Boolean Filters
        for col in bool_cols:
            if col not in df.columns:
                continue
            filter_specs.append({
                "column": str(col),
                "type": "boolean",
                "title": str(col).replace('_', ' ').title(),
                "options": [True, False]
            })

        return filter_specs

    @staticmethod
    def apply_filters(df: pd.DataFrame, filters: Dict[str, Any]) -> pd.DataFrame:
        """
        Applies a dict of active filters to the dataframe using Boolean AND logic.
        filters schema:
        {
           "CategoryName": ["Apparel", "Footwear"],            # Categorical multi-select
           "Price": {"min": 10, "max": 500},                   # Numerical range
           "OrderDate": {"start": "2023-01-01", "end": "2023-12-31"}, # Date range
           "IsReturned": True,                                 # Boolean
           "__cross_filter__": {"column": "Gender", "value": "Female"} # Chart cross-filter
        }
        """
        if not filters or len(df) == 0:
            return df

        filtered_df = df.copy()

        for col, condition in filters.items():
            if not condition:
                continue

            # Handle cross-filter wrapper if present
            if col == "__cross_filter__":
                cf_col = condition.get("column")
                cf_val = condition.get("value")
                if cf_col and cf_col in filtered_df.columns and cf_val is not None:
                    filtered_df = filtered_df[filtered_df[cf_col].astype(str) == str(cf_val)]
                continue

            if col not in filtered_df.columns:
                continue

            # Case A: List of strings/categories (Categorical Multi-select)
            if isinstance(condition, list):
                if len(condition) > 0:
                    str_conditions = set(str(v).strip() for v in condition)
                    filtered_df = filtered_df[filtered_df[col].astype(str).str.strip().isin(str_conditions)]

            # Case B: Dict with min/max or start/end
            elif isinstance(condition, dict):
                # Date Range
                if "start" in condition or "end" in condition:
                    dt_series = pd.to_datetime(filtered_df[col], errors='coerce')
                    if condition.get("start"):
                        start_dt = pd.to_datetime(condition["start"], errors='coerce')
                        if pd.notna(start_dt):
                            filtered_df = filtered_df[dt_series >= start_dt]
                    if condition.get("end"):
                        end_dt = pd.to_datetime(condition["end"], errors='coerce')
                        if pd.notna(end_dt):
                            # Set time to end of day if only date is specified
                            if len(str(condition["end"])) <= 10:
                                end_dt = end_dt + pd.Timedelta(days=1, microseconds=-1)
                            filtered_df = filtered_df[dt_series <= end_dt]

                # Numerical Range
                elif "min" in condition or "max" in condition:
                    num_series = FilterEngine._coerce_numeric(filtered_df[col])
                    if condition.get("min") is not None:
                        try:
                            min_v = float(condition["min"])
                            filtered_df = filtered_df[num_series >= min_v]
                        except (ValueError, TypeError):
                            pass
                    if condition.get("max") is not None:
                        try:
                            max_v = float(condition["max"])
                            filtered_df = filtered_df[num_series <= max_v]
                        except (ValueError, TypeError):
                            pass

            # Case C: Boolean / Primitive Exact Match
            elif isinstance(condition, bool):
                bool_series = filtered_df[col].astype(bool)
                filtered_df = filtered_df[bool_series == condition]
            elif isinstance(condition, (int, float, str)):
                filtered_df = filtered_df[filtered_df[col].astype(str) == str(condition)]

        return filtered_df
