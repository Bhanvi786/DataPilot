"""
Numerical Analyzer Service for EDA.
Generates separated Histogram and Boxplot payloads with:
- Summary statistics: Mean, Median, Std, Min, Max, Q1, Q3, IQR, Skewness, Outlier Count
- Lower/Upper IQR Boundaries
- Outlier sample records & separation of outlier points
- Log scale arrays with safe handling of non-positive values (offset shifting or log1p)
- Discrete temporal component frequency distributions (Year, Month, Quarter, Day)
  with month name mapping and chronological preserved ordering.
"""
from typing import Dict, Any, List
import pandas as pd
import numpy as np


class NumericalAnalyzer:
    """Prepares structured distribution payloads for Plotly rendering."""

    MONTH_NAMES = {
        1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr",
        5: "May", 6: "Jun", 7: "Jul", 8: "Aug",
        9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec"
    }

    @staticmethod
    def analyze_numerical_distributions(df: pd.DataFrame, num_cols: List[str], max_sample: int = 1500) -> List[Dict[str, Any]]:
        results = []
        for col in num_cols:
            if col not in df.columns:
                continue
            series = pd.to_numeric(df[col], errors='coerce').dropna()
            if len(series) < 2:
                continue

            q1 = float(series.quantile(0.25))
            q3 = float(series.quantile(0.75))
            median_val = float(series.median())
            mean_val = float(series.mean())
            std_val = float(series.std()) if len(series) > 1 else 0.0
            skew_val = float(series.skew()) if len(series) > 2 else 0.0
            min_val = float(series.min())
            max_val = float(series.max())

            iqr = q3 - q1
            lower_bound = q1 - 1.5 * iqr
            upper_bound = q3 + 1.5 * iqr

            # Identify outliers
            outlier_mask = (series < lower_bound) | (series > upper_bound)
            outliers_count = int(outlier_mask.sum())
            outlier_series = series[outlier_mask]

            # Sample of actual outlier records (up to 15 representative values)
            outlier_samples = [round(float(v), 2) for v in outlier_series.head(15).tolist()]

            is_skewed = abs(skew_val) >= 1.5

            # Sample for client rendering to ensure smooth performance on large datasets
            sample_series = series.sample(min(len(series), max_sample), random_state=42) if len(series) > max_sample else series
            sample_data = [round(float(v), 2) for v in sample_series.tolist()]

            # Safe Log Transformation
            # If all values are non-negative, use log1p(x).
            # If negative values exist, compute log1p(x - min(x) + 1) or warn.
            can_log = True
            log_note = ""
            if min_val >= 0:
                log_data = [round(float(np.log1p(v)), 3) for v in sample_data]
                log_note = "log1p(x) transformation applied"
            else:
                shift = abs(min_val) + 1.0
                log_data = [round(float(np.log(v + shift)), 3) for v in sample_data]
                log_note = f"log(x + {round(shift, 2)}) applied to accommodate negative values"

            # Compute log statistics for accurate box plot rendering on log scale
            if log_data:
                log_series = pd.Series(log_data)
                log_q1 = float(log_series.quantile(0.25))
                log_q3 = float(log_series.quantile(0.75))
                log_iqr = log_q3 - log_q1
                log_stats = {
                    "mean": round(float(log_series.mean()), 3),
                    "median": round(float(log_series.median()), 3),
                    "q1": round(log_q1, 3),
                    "q3": round(log_q3, 3),
                    "iqr": round(log_iqr, 3),
                    "lower_bound": round(log_q1 - 1.5 * log_iqr, 3),
                    "upper_bound": round(log_q3 + 1.5 * log_iqr, 3),
                    "min": round(float(log_series.min()), 3),
                    "max": round(float(log_series.max()), 3)
                }
            else:
                log_stats = None

            results.append({
                "column_name": str(col),
                "data": sample_data,
                "log_data": log_data,
                "log_note": log_note,
                "log_stats": log_stats,
                "is_skewed": is_skewed,
                "skewness": round(skew_val, 2),
                "stats": {
                    "mean": round(mean_val, 2),
                    "median": round(median_val, 2),
                    "std": round(std_val, 2),
                    "min": round(min_val, 2),
                    "max": round(max_val, 2),
                    "q1": round(q1, 2),
                    "q3": round(q3, 2),
                    "iqr": round(iqr, 2),
                    "lower_bound": round(lower_bound, 2),
                    "upper_bound": round(upper_bound, 2),
                    "outliers_count": outliers_count,
                    "outlier_samples": outlier_samples,
                    "total_count": len(series)
                }
            })
        return results

    @staticmethod
    def analyze_temporal_components(df: pd.DataFrame, temp_cols: List[str]) -> List[Dict[str, Any]]:
        """Handles discrete temporal units (Year, Month, Quarter, Day) as ordered bar distributions."""
        results = []
        for col in temp_cols:
            if col not in df.columns:
                continue
            series = pd.to_numeric(df[col], errors='coerce').dropna().astype(int)
            if len(series) == 0:
                continue

            name_lower = str(col).lower()
            is_month = "month" in name_lower or (series.min() >= 1 and series.max() <= 12 and series.nunique() <= 12)

            counts = series.value_counts().sort_index()
            labels = [str(k) for k in counts.index]
            values = [int(v) for v in counts.values]
            total = len(series)
            percentages = [round((v / total * 100), 1) for v in values]

            # If month, generate month name labels as an option
            named_labels = None
            if is_month:
                named_labels = [NumericalAnalyzer.MONTH_NAMES.get(int(k), str(k)) for k in counts.index]

            results.append({
                "column_name": str(col),
                "is_month": is_month,
                "labels": labels,
                "named_labels": named_labels,
                "values": values,
                "percentages": percentages,
                "unique_count": int(series.nunique()),
                "total_count": total
            })
        return results
