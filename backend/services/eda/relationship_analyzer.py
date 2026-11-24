"""
Relationship Analyzer Service for EDA.
Generates bivariate chart configurations:
- Num vs Num (Scatter)
- Cat vs Num (Box / Grouped Bar)
- Cat vs Cat (Grouped Bar)
- Date vs Num (Line)
"""
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np


class RelationshipAnalyzer:
    """Prepares bivariate interaction payloads."""

    @staticmethod
    def analyze_relationship(
        df: pd.DataFrame,
        x_col: str,
        y_col: str,
        color_col: Optional[str] = None,
        max_points: int = 400
    ) -> Dict[str, Any]:
        if x_col not in df.columns or y_col not in df.columns:
            return {"error": "Specified columns do not exist in dataset."}

        cols_needed = [x_col, y_col]
        if color_col and color_col in df.columns:
            cols_needed.append(color_col)

        sub_df = df[cols_needed].dropna()
        if len(sub_df) == 0:
            return {"error": "No non-null overlapping records found for selected columns."}

        # Subsample for smooth client rendering
        if len(sub_df) > max_points:
            sub_df = sub_df.sample(max_points, random_state=42)

        x_series = sub_df[x_col]
        y_series = sub_df[y_col]

        is_x_num = pd.api.types.is_numeric_dtype(x_series)
        is_y_num = pd.api.types.is_numeric_dtype(y_series)
        is_x_date = pd.api.types.is_datetime64_any_dtype(x_series)

        # Determine chart type recommendation
        if is_x_date and is_y_num:
            chart_type = "line"
        elif is_x_num and is_y_num:
            chart_type = "scatter"
        elif not is_x_num and is_y_num:
            chart_type = "box"
        else:
            chart_type = "bar"

        # Sanitize data
        x_data = [round(float(v), 2) if is_x_num else str(v) for v in x_series]
        y_data = [round(float(v), 2) if is_y_num else str(v) for v in y_series]
        color_data = [str(v) for v in sub_df[color_col]] if color_col and color_col in sub_df.columns else None

        return {
            "x_column": x_col,
            "y_column": y_col,
            "color_column": color_col,
            "chart_type": chart_type,
            "total_points": len(sub_df),
            "x": x_data,
            "y": y_data,
            "color": color_data
        }
