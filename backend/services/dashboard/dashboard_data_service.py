"""
Dashboard Data Service for Analytics Dashboard.
Coordinates dataset retrieval, filtered execution, and builds chart data payloads:
- Performance Trends (Time-series / continuous sequences)
- Category Analysis (Bar, Donut, Multi-metric rankings)
- Numerical Analysis (Histogram, Box plot)
- Relationship Analysis (Scatter, Bubble, Correlation)
"""
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np


class DashboardDataService:
    """Computes dynamic chart structures over the active filtered dataset."""

    @staticmethod
    def _coerce_numeric(series: pd.Series) -> pd.Series:
        if pd.api.types.is_numeric_dtype(series):
            return pd.to_numeric(series, errors='coerce')
        cleaned = series.astype(str).str.replace(r'[$,₹€£,\s]', '', regex=True)
        return pd.to_numeric(cleaned, errors='coerce')

    @staticmethod
    def generate_chart_data(df: pd.DataFrame, chart_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Builds chart-ready payload based on chart configuration:
        chart_config = {
           "id": "chart_1",
           "type": "bar" | "line" | "donut" | "scatter" | "histogram" | "box",
           "title": "Sales by Category",
           "x": "ProductCategory",
           "y": "TotalAmount",
           "aggregation": "sum" | "mean" | "count" | "min" | "max",
           "color": "StoreLocation",   # Optional grouping / segmentation
           "freq": "M"                  # For time series line
        }
        """
        chart_id = chart_config.get("id", "chart_dyn")
        chart_type = chart_config.get("type", "bar").lower()
        title = chart_config.get("title", "Chart")
        x_col = chart_config.get("x")
        y_col = chart_config.get("y")
        agg = chart_config.get("aggregation", "sum").lower()
        color_col = chart_config.get("color")

        if len(df) == 0:
            return {
                "id": chart_id,
                "type": chart_type,
                "title": title,
                "data": [],
                "empty": True,
                "message": "No records match current filter criteria"
            }

        # -------------------------------------------------------------
        # 1. TIME-SERIES / TREND LINE CHART
        # -------------------------------------------------------------
        if chart_type in ["line", "trend"]:
            if not x_col or x_col not in df.columns:
                return {"id": chart_id, "type": chart_type, "error": f"Date column '{x_col}' missing"}

            df_temp = df.copy()
            df_temp["_dt"] = pd.to_datetime(df_temp[x_col], errors='coerce')
            df_temp = df_temp.dropna(subset=["_dt"])

            if len(df_temp) == 0:
                return {"id": chart_id, "type": chart_type, "empty": True, "message": "No valid datetime values found"}

            freq = chart_config.get("freq", "M")
            freq_alias_map = {"D": "D", "W": "W-MON", "M": "ME", "Q": "QE", "Y": "YE"}
            freq_code = freq_alias_map.get(freq, "ME")

            if y_col and y_col in df_temp.columns and agg != "count":
                df_temp["_y"] = DashboardDataService._coerce_numeric(df_temp[y_col])
                grouped = df_temp.set_index("_dt").resample(freq_code)["_y"].agg(agg).fillna(0)
            else:
                grouped = df_temp.set_index("_dt").resample(freq_code).size()

            dates = [d.strftime('%Y-%m-%d') for d in grouped.index]
            values = [round(float(v), 2) for v in grouped.values]

            # Calculate trend percent via regression slope
            trend_pct = 0.0
            if len(values) >= 2:
                xs = np.arange(len(values))
                ys = np.array(values, dtype=float)
                mean_val = np.mean(ys)
                if mean_val > 0:
                    slope, _ = np.polyfit(xs, ys, 1)
                    trend_pct = round((slope * (len(values) - 1) / mean_val) * 100, 1)

            return {
                "id": chart_id,
                "type": "line",
                "title": title,
                "x_label": x_col,
                "y_label": f"{agg.upper()} ({y_col or 'Records'})",
                "dates": dates,
                "values": values,
                "trend_percentage": trend_pct,
                "trend_direction": "Upward" if trend_pct > 2 else "Downward" if trend_pct < -2 else "Stable"
            }

        # -------------------------------------------------------------
        # 2. CATEGORICAL BAR OR DONUT CHART
        # -------------------------------------------------------------
        elif chart_type in ["bar", "donut", "pie"]:
            if not x_col or x_col not in df.columns:
                return {"id": chart_id, "type": chart_type, "error": f"Category column '{x_col}' missing"}

            df_temp = df.copy()
            df_temp["_x"] = df_temp[x_col].fillna("Unknown").astype(str)

            if y_col and y_col in df_temp.columns and agg != "count":
                df_temp["_y"] = DashboardDataService._coerce_numeric(df_temp[y_col])
                grouped = df_temp.groupby("_x")["_y"].agg(agg).sort_values(ascending=False).head(15)
            else:
                grouped = df_temp["_x"].value_counts().head(15)

            labels = [str(k) for k in grouped.index]
            values = [round(float(v), 2) for v in grouped.values]
            total_sum = sum(values) if sum(values) > 0 else 1.0
            percentages = [round((v / total_sum * 100), 1) for v in values]

            return {
                "id": chart_id,
                "type": chart_type,
                "title": title,
                "x_label": x_col,
                "y_label": f"{agg.upper()} ({y_col or 'Count'})",
                "labels": labels,
                "values": values,
                "percentages": percentages,
                "cross_filter_col": x_col
            }

        # -------------------------------------------------------------
        # 3. NUMERICAL HISTOGRAM OR BOX PLOT
        # -------------------------------------------------------------
        elif chart_type in ["histogram", "box"]:
            col = y_col or x_col
            if not col or col not in df.columns:
                return {"id": chart_id, "type": chart_type, "error": f"Numerical column '{col}' missing"}

            series = DashboardDataService._coerce_numeric(df[col]).dropna()
            if len(series) == 0:
                return {"id": chart_id, "type": chart_type, "empty": True, "message": "No numeric values to plot"}

            # Sample for performance if large
            sample_series = series.sample(min(len(series), 1000), random_state=42) if len(series) > 1000 else series
            data_pts = [round(float(v), 2) for v in sample_series.tolist()]

            q1 = float(series.quantile(0.25))
            q3 = float(series.quantile(0.75))
            iqr = q3 - q1

            return {
                "id": chart_id,
                "type": chart_type,
                "title": title,
                "column": col,
                "data": data_pts,
                "stats": {
                    "mean": round(float(series.mean()), 2),
                    "median": round(float(series.median()), 2),
                    "min": round(float(series.min()), 2),
                    "max": round(float(series.max()), 2),
                    "q1": round(q1, 2),
                    "q3": round(q3, 2),
                    "iqr": round(iqr, 2),
                    "outliers_count": int(((series < (q1 - 1.5 * iqr)) | (series > (q3 + 1.5 * iqr))).sum())
                }
            }

        # -------------------------------------------------------------
        # 4. RELATIONSHIP SCATTER PLOT
        # -------------------------------------------------------------
        elif chart_type in ["scatter"]:
            if not x_col or not y_col or x_col not in df.columns or y_col not in df.columns:
                return {"id": chart_id, "type": chart_type, "error": f"Both X ({x_col}) and Y ({y_col}) must exist"}

            df_temp = df[[x_col, y_col]].dropna().copy()
            df_temp["_x"] = DashboardDataService._coerce_numeric(df_temp[x_col])
            df_temp["_y"] = DashboardDataService._coerce_numeric(df_temp[y_col])
            df_temp = df_temp.dropna()

            if len(df_temp) == 0:
                return {"id": chart_id, "type": chart_type, "empty": True, "message": "No numeric points for scatter"}

            # Sample for UI responsiveness
            df_sample = df_temp.sample(min(len(df_temp), 800), random_state=42) if len(df_temp) > 800 else df_temp

            corr_val = float(df_temp["_x"].corr(df_temp["_y"])) if len(df_temp) > 2 else 0.0

            return {
                "id": chart_id,
                "type": "scatter",
                "title": title,
                "x_label": x_col,
                "y_label": y_col,
                "x_values": [round(float(v), 2) for v in df_sample["_x"].tolist()],
                "y_values": [round(float(v), 2) for v in df_sample["_y"].tolist()],
                "correlation": round(corr_val, 3)
            }

        return {"id": chart_id, "type": chart_type, "error": f"Unsupported chart type '{chart_type}'"}
