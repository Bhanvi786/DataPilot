"""
Time Series Analyzer Service for EDA.
Aggregates numerical features across detected temporal sequences with full support for:
- Frequencies: Daily (D), Weekly (W), Monthly (ME), Quarterly (QE), Yearly (YE)
- Aggregations: Mean, Sum, Median, Count, Min, Max
- Statistical trend detection using Ordinary Least Squares (OLS) Linear Regression slope
"""
from typing import Dict, Any, Optional
import pandas as pd
import numpy as np


class TimeSeriesAnalyzer:
    """Prepares chronological trend data with robust frequency parsing, aggregation, and regression slope."""

    FREQ_MAP = {
        "D": "D",
        "W": "W-MON",
        "M": "ME",      # Modern pandas month-end alias
        "Q": "QE",      # Modern pandas quarter-end alias
        "Y": "YE"       # Modern pandas year-end alias
    }

    FREQ_NAMES = {
        "D": "Daily",
        "W": "Weekly",
        "M": "Monthly",
        "Q": "Quarterly",
        "Y": "Yearly"
    }

    @staticmethod
    def _coerce_numeric(series: pd.Series) -> pd.Series:
        if pd.api.types.is_numeric_dtype(series):
            return pd.to_numeric(series, errors='coerce')
        cleaned = series.astype(str).str.replace(r'[$,₹€£,\s]', '', regex=True)
        return pd.to_numeric(cleaned, errors='coerce')

    @staticmethod
    def analyze_time_series(
        df: pd.DataFrame,
        date_col: str,
        metric_col: str,
        freq: str = "M",
        agg_func: str = "mean"
    ) -> Optional[Dict[str, Any]]:
        if date_col not in df.columns or metric_col not in df.columns:
            return None

        # Clean datetime and numeric metric
        dates_parsed = pd.to_datetime(df[date_col], errors='coerce')
        metrics_numeric = TimeSeriesAnalyzer._coerce_numeric(df[metric_col])

        clean_mask = dates_parsed.notna() & metrics_numeric.notna()
        if clean_mask.sum() < 2:
            return None

        ts_df = pd.DataFrame({
            "ds": dates_parsed[clean_mask],
            "y": metrics_numeric[clean_mask]
        }).sort_values("ds")

        ts_df.set_index("ds", inplace=True)

        # Normalize freq alias
        resample_rule = TimeSeriesAnalyzer.FREQ_MAP.get(freq.upper(), "ME")
        agg_lower = agg_func.lower().strip()

        try:
            resampler = ts_df["y"].resample(resample_rule)
            if agg_lower == "sum":
                resampled = resampler.sum()
            elif agg_lower == "median":
                resampled = resampler.median()
            elif agg_lower == "count":
                resampled = resampler.count()
            elif agg_lower == "min":
                resampled = resampler.min()
            elif agg_lower == "max":
                resampled = resampler.max()
            else: # default mean
                resampled = resampler.mean()
        except Exception:
            resampled = ts_df["y"].resample("ME").mean()

        # Drop periods that had zero records
        resampled = resampled.dropna()
        if len(resampled) == 0:
            return None

        # Format dates readable by Plotly
        if freq.upper() == "Y":
            date_labels = [d.strftime('%Y') for d in resampled.index]
        elif freq.upper() == "Q":
            date_labels = [f"{d.year}-Q{d.quarter}" for d in resampled.index]
        elif freq.upper() == "M":
            date_labels = [d.strftime('%Y-%m') for d in resampled.index]
        else:
            date_labels = [d.strftime('%Y-%m-%d') for d in resampled.index]

        values = [round(float(v), 2) for v in resampled.values]
        n_points = len(values)

        # Documented statistical trend calculation using OLS Linear Regression slope
        trend = "Stable (0.0%)"
        pct_change = 0.0
        trend_explanation = "Calculated via Ordinary Least Squares (OLS) slope over period sequence."

        if n_points >= 2:
            x_indices = np.arange(n_points)
            y_arr = np.array(values)

            # Fit line y = mx + b
            slope, intercept = np.polyfit(x_indices, y_arr, 1)

            # Baseline reference (first fitted value or mean)
            baseline = abs(values[0]) if abs(values[0]) > 1e-4 else (abs(y_arr.mean()) + 1e-4)
            total_change = slope * (n_points - 1)
            pct_change = round((total_change / baseline) * 100, 1)

            if pct_change >= 5.0:
                trend = f"Upward (+{pct_change}%)"
            elif pct_change <= -5.0:
                trend = f"Downward ({pct_change}%)"
            else:
                trend = f"Stable ({pct_change}%)"

            trend_explanation = (
                f"Evaluated using OLS linear regression across {n_points} time periods. "
                f"Fitted rate of change is {slope:+.2f} per period, representing a {pct_change:+.1f}% cumulative trend relative to baseline."
            )

        # Detect units where possible (e.g. INR, USD, %, etc.)
        m_lower = metric_col.lower()
        unit_label = ""
        if "inr" in m_lower or "rs" in m_lower or "rupee" in m_lower:
            unit_label = " (INR ₹)"
        elif "usd" in m_lower or "dollar" in m_lower or "$" in m_lower:
            unit_label = " (USD $)"
        elif "pct" in m_lower or "percent" in m_lower or "rate" in m_lower:
            unit_label = " (%)"
        elif "qty" in m_lower or "quantity" in m_lower or "count" in m_lower:
            unit_label = " (Units)"

        readable_y_label = f"{agg_lower.capitalize()} of {metric_col}{unit_label}"

        return {
            "date_column": date_col,
            "metric_column": metric_col,
            "frequency": freq,
            "frequency_name": TimeSeriesAnalyzer.FREQ_NAMES.get(freq.upper(), "Monthly"),
            "aggregation": agg_lower,
            "trend": trend,
            "trend_percentage": pct_change,
            "trend_explanation": trend_explanation,
            "dates": date_labels,
            "values": values,
            "total_periods": n_points,
            "readable_y_label": readable_y_label
        }
