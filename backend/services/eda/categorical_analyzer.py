"""
Categorical Analyzer Service for EDA.
Features:
- Excludes identifiers (Product_ID, Customer_ID, etc.) from default pie/donut charts
- High-cardinality handling: horizontal bar charts with top 5, 10, 20 rankings and unaggregated tail count
- Donut/pie charts reserved for meaningful categorical features
- Separate identifier profiles
"""
from typing import Dict, Any, List
import pandas as pd


class CategoricalAnalyzer:
    """Prepares structured categorical distributions and identifier summaries."""

    @staticmethod
    def analyze_categorical_distributions(df: pd.DataFrame, cat_cols: List[str]) -> List[Dict[str, Any]]:
        results = []
        for col in cat_cols:
            if col not in df.columns:
                continue
            series = df[col].dropna().astype(str)
            if len(series) == 0:
                continue

            val_counts = series.value_counts()
            total_count = len(series)
            unique_count = int(series.nunique())

            is_high_cardinality = unique_count > 12

            # Top 5, 10, 20 views
            top5 = val_counts.head(5)
            top10 = val_counts.head(10)
            top20 = val_counts.head(20)

            # Check max label length in top categories to recommend horizontal bar if long labels could clip in donut/pie
            max_label_len = max([len(str(lbl)) for lbl in top10.index]) if len(top10) > 0 else 0
            has_long_labels = max_label_len > 14

            # Default chart type: horizontal bar for high-cardinality or long labels, donut for compact categories
            chart_type = "horizontal_bar" if (is_high_cardinality or has_long_labels) else "donut"

            results.append({
                "column_name": str(col),
                "total_unique": unique_count,
                "total_records": total_count,
                "is_high_cardinality": is_high_cardinality,
                "has_long_labels": has_long_labels,
                "max_label_length": max_label_len,
                "recommended_chart": chart_type,
                "top_category": str(val_counts.index[0]),
                "top_category_count": int(val_counts.iloc[0]),
                "top_category_pct": round((val_counts.iloc[0] / total_count * 100), 1),
                "top5": {
                    "labels": list(top5.index),
                    "values": [int(v) for v in top5.values],
                    "percentages": [round((v / total_count * 100), 1) for v in top5.values]
                },
                "top10": {
                    "labels": list(top10.index),
                    "values": [int(v) for v in top10.values],
                    "percentages": [round((v / total_count * 100), 1) for v in top10.values]
                },
                "top20": {
                    "labels": list(top20.index),
                    "values": [int(v) for v in top20.values],
                    "percentages": [round((v / total_count * 100), 1) for v in top20.values]
                },
                "remaining_categories_count": max(0, unique_count - 20)
            })
        return results

    @staticmethod
    def analyze_identifiers(df: pd.DataFrame, id_cols: List[str]) -> List[Dict[str, Any]]:
        """Summarizes identifier columns separately without plotting misleading pie charts."""
        results = []
        for col in id_cols:
            if col not in df.columns:
                continue
            series = df[col].dropna()
            total_count = len(series)
            unique_count = int(series.nunique())
            sample_values = [str(v) for v in series.head(5).tolist()]

            results.append({
                "column_name": str(col),
                "total_records": total_count,
                "unique_keys": unique_count,
                "uniqueness_ratio": round((unique_count / total_count * 100), 1) if total_count > 0 else 0,
                "sample_values": sample_values,
                "data_type": str(series.dtype)
            })
        return results
