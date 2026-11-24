"""
Insight Generator Service for EDA.
Deterministic, rule-based mathematical insight engine based exclusively on real calculations.
"""
from typing import Dict, Any, List
import pandas as pd
import numpy as np


class InsightGenerator:
    """Produces objective data insights without external LLM API dependency."""

    @staticmethod
    def generate_insights(
        df: pd.DataFrame,
        num_stats: List[Dict[str, Any]],
        cat_stats: List[Dict[str, Any]],
        correlations: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        insights = []

        # 1. High Missing Data Alerts
        total_rows = len(df)
        for col in df.columns:
            missing_cnt = int(df[col].isna().sum())
            if missing_cnt > 0:
                pct = round((missing_cnt / total_rows * 100), 1)
                if pct >= 15:
                    insights.append({
                        "category": "Data Quality",
                        "severity": "warning",
                        "title": f"High Missingness in '{col}'",
                        "observation": f"Column '{col}' has {missing_cnt} missing values ({pct}% of dataset). Consider imputation or evaluation before training models."
                    })

        # 2. Skewness / Distribution Extremes
        for stat in num_stats:
            col = stat["column_name"]
            skew = stat["skewness"]
            if abs(skew) >= 1.5:
                direction = "right (positively)" if skew > 0 else "left (negatively)"
                insights.append({
                    "category": "Distribution",
                    "severity": "info",
                    "title": f"Skewed Distribution in '{col}'",
                    "observation": f"'{col}' is highly skewed {direction} with a skewness coefficient of {skew}. Median ({stat['median']}) represents central tendency better than Mean ({stat['mean']})."
                })

        # 3. Dominant Category Concentration
        for stat in cat_stats:
            col = stat["column_name"]
            top_pct = stat["top_percentage"]
            top_cat = stat["most_frequent_category"]
            if top_pct >= 60 and stat["unique_categories"] > 1:
                insights.append({
                    "category": "Categorical Balance",
                    "severity": "info",
                    "title": f"Dominant Category in '{col}'",
                    "observation": f"Category '{top_cat}' accounts for {top_pct}% of all records in '{col}', indicating potential class imbalance."
                })

        # 4. Significant Correlation Pairs
        for pos in correlations.get("strong_positive", []):
            insights.append({
                "category": "Correlation",
                "severity": "success",
                "title": f"Strong Positive Association: {pos['col1']} & {pos['col2']}",
                "observation": f"Calculated Pearson correlation is +{pos['correlation']}. As {pos['col1']} increases, {pos['col2']} strongly tends to increase proportionally."
            })

        for neg in correlations.get("strong_negative", []):
            insights.append({
                "category": "Correlation",
                "severity": "info",
                "title": f"Inverse Association: {neg['col1']} & {neg['col2']}",
                "observation": f"Calculated correlation is {neg['correlation']}, showing an inverse trend between {neg['col1']} and {neg['col2']}."
            })

        # 5. Dataset Dimension Summary
        insights.append({
            "category": "Overview",
            "severity": "info",
            "title": "Dataset Shape & Feature Depth",
            "observation": f"The dataset contains {len(df):,} records across {len(df.columns)} attributes ({len(num_stats)} numerical, {len(cat_stats)} categorical)."
        })

        return insights
