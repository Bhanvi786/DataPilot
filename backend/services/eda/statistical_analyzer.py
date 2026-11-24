"""
Statistical Analyzer Service for EDA.
Computes comprehensive descriptive metrics for Numerical, Categorical, and Date columns.
"""
from typing import Dict, Any, List
import pandas as pd
import numpy as np


class StatisticalAnalyzer:
    """Computes exact statistical properties dynamically."""

    @staticmethod
    def get_numerical_statistics(df: pd.DataFrame, num_cols: List[str]) -> List[Dict[str, Any]]:
        stats_list = []
        for col in num_cols:
            if col not in df.columns:
                continue
            series = pd.to_numeric(df[col], errors='coerce').dropna()
            if len(series) == 0:
                continue

            mean_val = float(series.mean())
            median_val = float(series.median())
            mode_val = float(series.mode().iloc[0]) if not series.mode().empty else mean_val
            std_val = float(series.std()) if len(series) > 1 else 0.0
            var_val = float(series.var()) if len(series) > 1 else 0.0
            min_val = float(series.min())
            max_val = float(series.max())
            q1 = float(series.quantile(0.25))
            q3 = float(series.quantile(0.75))
            iqr = q3 - q1
            skewness = float(series.skew()) if len(series) > 2 else 0.0
            kurt = float(series.kurtosis()) if len(series) > 3 else 0.0
            missing_count = int(df[col].isna().sum())
            missing_pct = round((missing_count / len(df) * 100), 2) if len(df) > 0 else 0

            stats_list.append({
                "column_name": str(col),
                "count": len(series),
                "mean": round(mean_val, 2),
                "median": round(median_val, 2),
                "mode": round(mode_val, 2),
                "std": round(std_val, 2),
                "variance": round(var_val, 2),
                "min": round(min_val, 2),
                "max": round(max_val, 2),
                "q1": round(q1, 2),
                "q3": round(q3, 2),
                "iqr": round(iqr, 2),
                "skewness": round(skewness, 2),
                "kurtosis": round(kurt, 2),
                "missing_pct": missing_pct
            })
        return stats_list

    @staticmethod
    def get_categorical_statistics(df: pd.DataFrame, cat_cols: List[str]) -> List[Dict[str, Any]]:
        stats_list = []
        for col in cat_cols:
            if col not in df.columns:
                continue
            series = df[col].astype(str)
            non_null = df[col].dropna().astype(str)
            if len(non_null) == 0:
                continue

            counts = non_null.value_counts()
            top_category = str(counts.index[0]) if not counts.empty else "N/A"
            top_freq = int(counts.iloc[0]) if not counts.empty else 0
            unique_count = int(series.nunique())
            missing_count = int(df[col].isna().sum())
            missing_pct = round((missing_count / len(df) * 100), 2) if len(df) > 0 else 0

            # Frequency breakdown (top 10 categories)
            frequencies = []
            for cat_name, cnt in counts.head(10).items():
                pct = round((cnt / len(non_null) * 100), 2)
                frequencies.append({
                    "category": str(cat_name),
                    "count": int(cnt),
                    "percentage": pct
                })

            stats_list.append({
                "column_name": str(col),
                "unique_categories": unique_count,
                "most_frequent_category": top_category,
                "frequency": top_freq,
                "top_percentage": round((top_freq / len(non_null) * 100), 2),
                "missing_pct": missing_pct,
                "categories": frequencies
            })
        return stats_list

    @staticmethod
    def get_datetime_statistics(df: pd.DataFrame, dt_cols: List[str]) -> List[Dict[str, Any]]:
        stats_list = []
        for col in dt_cols:
            if col not in df.columns:
                continue
            parsed = pd.to_datetime(df[col], errors='coerce').dropna()
            if len(parsed) == 0:
                continue

            earliest = parsed.min().strftime('%Y-%m-%d')
            latest = parsed.max().strftime('%Y-%m-%d')
            span_days = int((parsed.max() - parsed.min()).days)
            missing_count = int(df[col].isna().sum())
            missing_pct = round((missing_count / len(df) * 100), 2) if len(df) > 0 else 0

            stats_list.append({
                "column_name": str(col),
                "earliest_date": earliest,
                "latest_date": latest,
                "date_range_days": span_days,
                "missing_pct": missing_pct
            })
        return stats_list
