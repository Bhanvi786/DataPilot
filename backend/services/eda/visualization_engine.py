"""
Visualization Engine for Custom Chart Generation.
Validates configurations and formats Plotly chart data structures dynamically.
Prevents unmeaningful default identifier selections and provides actionable compatibility errors.
"""
from typing import Dict, Any
import pandas as pd
import numpy as np


class VisualizationEngine:
    """Validates and builds user-customized Plotly chart payloads."""

    @staticmethod
    def build_chart(
        df: pd.DataFrame,
        chart_type: str,
        x_col: str,
        y_col: str = None,
        color_col: str = None,
        agg_func: str = "mean"
    ) -> Dict[str, Any]:
        if not x_col:
            return {"error": "X-axis column must be specified."}

        if x_col not in df.columns:
            return {"error": f"X-axis column '{x_col}' does not exist in dataset."}

        chart_type = chart_type.lower().strip()

        # 1. Validation & Generation by Chart Type
        if chart_type in ["bar", "donut", "pie"]:
            # Needs categorical or discrete X
            if y_col and y_col in df.columns:
                sub_df = df[[x_col, y_col]].dropna()
                if len(sub_df) == 0:
                    return {"error": f"No overlapping data found between '{x_col}' and '{y_col}'."}

                sub_df[y_col] = pd.to_numeric(sub_df[y_col], errors='coerce')
                sub_df = sub_df.dropna()

                if len(sub_df) == 0:
                    return {"error": f"Y-axis column '{y_col}' contains no valid numerical values for aggregation."}

                agg = agg_func.lower()
                if agg == "sum":
                    grouped = sub_df.groupby(x_col)[y_col].sum()
                elif agg == "median":
                    grouped = sub_df.groupby(x_col)[y_col].median()
                elif agg == "count":
                    grouped = sub_df.groupby(x_col)[y_col].count()
                elif agg == "min":
                    grouped = sub_df.groupby(x_col)[y_col].min()
                elif agg == "max":
                    grouped = sub_df.groupby(x_col)[y_col].max()
                else:
                    grouped = sub_df.groupby(x_col)[y_col].mean()

                # Sort by value descending and cap to top 20
                grouped = grouped.sort_values(ascending=False).head(20)
                labels = [str(i) for i in grouped.index]
                values = [round(float(v), 2) for v in grouped.values]
            else:
                counts = df[x_col].dropna().value_counts().head(20)
                if len(counts) == 0:
                    return {"error": f"Column '{x_col}' contains no non-null values."}
                labels = [str(i) for i in counts.index]
                values = [int(v) for v in counts.values]

            # High cardinality warning
            warning = None
            if df[x_col].nunique() > 30:
                warning = f"'{x_col}' has {df[x_col].nunique()} unique categories. Showing top 20 to prevent overcrowding."

            return {
                "chart_type": chart_type,
                "x_column": x_col,
                "y_column": y_col,
                "labels": labels,
                "values": values,
                "warning": warning
            }

        elif chart_type == "histogram":
            sub_series = pd.to_numeric(df[x_col], errors='coerce').dropna()
            if len(sub_series) < 2:
                return {"error": f"Histogram requires a numerical column with at least 2 records. '{x_col}' is not suitable."}

            return {
                "chart_type": "histogram",
                "x_column": x_col,
                "data": [round(float(v), 2) for v in sub_series.head(1500).tolist()]
            }

        elif chart_type == "box":
            if y_col and y_col in df.columns:
                sub_df = df[[x_col, y_col]].dropna()
                sub_df[y_col] = pd.to_numeric(sub_df[y_col], errors='coerce')
                sub_df = sub_df.dropna()
                if len(sub_df) < 2:
                    return {"error": f"Box plot requires numerical values on Y-axis. '{y_col}' contains no numbers."}

                # Limit categories if too many
                top_cats = sub_df[x_col].value_counts().head(10).index
                sub_df = sub_df[sub_df[x_col].isin(top_cats)].head(800)

                return {
                    "chart_type": "box",
                    "x_column": x_col,
                    "y_column": y_col,
                    "x": [str(v) for v in sub_df[x_col]],
                    "y": [round(float(v), 2) for v in sub_df[y_col]]
                }
            else:
                # Single column boxplot
                sub_series = pd.to_numeric(df[x_col], errors='coerce').dropna()
                if len(sub_series) < 2:
                    return {"error": f"Box plot requires numerical data. '{x_col}' is not numeric."}
                return {
                    "chart_type": "box",
                    "x_column": x_col,
                    "y": [round(float(v), 2) for v in sub_series.head(800).tolist()]
                }

        elif chart_type in ["scatter", "line"]:
            if not y_col or y_col not in df.columns:
                return {"error": f"{chart_type.capitalize()} chart requires both an X-axis and a Y-axis column."}

            cols = [x_col, y_col]
            if color_col and color_col in df.columns:
                cols.append(color_col)

            sub_df = df[cols].dropna()
            if len(sub_df) < 2:
                return {"error": "Not enough overlapping non-null data between selected columns."}

            is_x_num = pd.api.types.is_numeric_dtype(sub_df[x_col])
            is_y_num = pd.api.types.is_numeric_dtype(sub_df[y_col])

            if chart_type == "scatter" and (not is_x_num or not is_y_num):
                # Try coercing
                x_conv = pd.to_numeric(sub_df[x_col], errors='coerce')
                y_conv = pd.to_numeric(sub_df[y_col], errors='coerce')
                valid = x_conv.notna() & y_conv.notna()
                if valid.sum() < 2:
                    return {"error": "Scatter plots require continuous numerical data on both X and Y axes."}
                sub_df = sub_df[valid].copy()
                sub_df[x_col] = x_conv[valid]
                sub_df[y_col] = y_conv[valid]
                is_x_num = True
                is_y_num = True

            # Sort for line charts
            if chart_type == "line":
                try:
                    sub_df["_sort_key"] = pd.to_datetime(sub_df[x_col], errors='coerce')
                    sub_df = sub_df.sort_values("_sort_key").drop(columns=["_sort_key"])
                except Exception:
                    sub_df = sub_df.sort_values(x_col)

            sub_df = sub_df.head(600)

            return {
                "chart_type": chart_type,
                "x_column": x_col,
                "y_column": y_col,
                "color_column": color_col,
                "x": [round(float(v), 2) if is_x_num else str(v) for v in sub_df[x_col]],
                "y": [round(float(v), 2) if is_y_num else str(v) for v in sub_df[y_col]],
                "color": [str(v) for v in sub_df[color_col]] if color_col and color_col in sub_df.columns else None
            }

        return {"error": f"Unsupported chart type '{chart_type}'."}
