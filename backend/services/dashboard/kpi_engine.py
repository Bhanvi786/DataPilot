"""
KPI Engine for Analytics Dashboard.
Dynamically calculates business intelligence KPIs based on:
- Numerical metric columns (Sum, Mean, Median, Min, Max, Count)
- Categorical / Identifier columns (Count, Unique Count)
- Excludes identifiers from automatic metric aggregations (unless using count or unique count)
- Automatically recommends intelligent default KPIs based on dataset semantic hints.
"""
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np


class KPIEngine:
    """Prepares and evaluates dynamic business KPI cards."""

    AGGREGATION_NAMES = {
        "sum": "Total",
        "mean": "Average",
        "median": "Median",
        "count": "Total Records",
        "min": "Minimum",
        "max": "Maximum",
        "unique": "Unique Count"
    }

    @staticmethod
    def _coerce_numeric(series: pd.Series) -> pd.Series:
        if pd.api.types.is_numeric_dtype(series):
            return pd.to_numeric(series, errors='coerce')
        cleaned = series.astype(str).str.replace(r'[$,₹€£,\s]', '', regex=True)
        return pd.to_numeric(cleaned, errors='coerce')

    @staticmethod
    def recommend_kpis(df: pd.DataFrame, column_breakdown: Dict[str, List[str]]) -> List[Dict[str, Any]]:
        """Recommends 4-6 high-value KPIs dynamically adapted to dataset structure."""
        recommendations = []
        num_cols = column_breakdown.get("numerical", [])
        cat_cols = column_breakdown.get("categorical", [])
        id_cols = column_breakdown.get("identifiers", [])
        total_rows = len(df)

        # 1. Total Records KPI (always applicable)
        recommendations.append({
            "id": "kpi_total_records",
            "title": "Total Records",
            "column": id_cols[0] if id_cols else (df.columns[0] if len(df.columns) > 0 else "Record"),
            "aggregation": "count",
            "format": "integer"
        })

        # 2. Key Volume / Financial metrics (sum)
        sum_candidates = [
            c for c in num_cols
            if any(term in str(c).lower() for term in ["sale", "amount", "revenue", "profit", "cost", "total", "spend", "balance", "price"])
            and not any(term in str(c).lower() for term in ["unit", "per", "rate", "percent", "pct", "ratio"])
        ]
        if sum_candidates:
            primary_sum = sum_candidates[0]
            recommendations.append({
                "id": f"kpi_sum_{primary_sum}",
                "title": f"Total {primary_sum.replace('_', ' ').title()}",
                "column": primary_sum,
                "aggregation": "sum",
                "format": "currency" if any(term in str(primary_sum).lower() for term in ["sale", "amount", "revenue", "profit", "price", "cost", "salary"]) else "decimal"
            })

        # 3. Key Average / Rate metrics (mean)
        mean_candidates = [
            c for c in num_cols
            if any(term in str(c).lower() for term in ["avg", "rate", "score", "age", "salary", "mark", "grade", "gpa", "rating", "experience", "hour", "attendance", "price", "unit"])
            or c in sum_candidates
        ]
        # Prefer candidate distinct from sum
        distinct_mean = [c for c in mean_candidates if not sum_candidates or c != sum_candidates[0]]
        chosen_mean = distinct_mean[0] if distinct_mean else (num_cols[0] if num_cols else None)

        if chosen_mean:
            recommendations.append({
                "id": f"kpi_avg_{chosen_mean}",
                "title": f"Avg {chosen_mean.replace('_', ' ').title()}",
                "column": chosen_mean,
                "aggregation": "mean",
                "format": "decimal"
            })

        # 4. Secondary numerical metric (max or sum)
        remaining_nums = [c for c in num_cols if c not in [rec["column"] for rec in recommendations]]
        if remaining_nums:
            sec_col = remaining_nums[0]
            agg = "max" if any(term in str(sec_col).lower() for term in ["score", "mark", "rating", "highest", "peak"]) else "mean"
            recommendations.append({
                "id": f"kpi_{agg}_{sec_col}",
                "title": f"{KPIEngine.AGGREGATION_NAMES.get(agg, 'Metric')} {sec_col.replace('_', ' ').title()}",
                "column": sec_col,
                "aggregation": agg,
                "format": "decimal"
            })

        # 5. Distinct Entities KPI (e.g., unique categories, unique customers, unique job roles)
        distinct_candidates = id_cols + cat_cols
        if distinct_candidates:
            chosen_entity = distinct_candidates[0]
            recommendations.append({
                "id": f"kpi_unique_{chosen_entity}",
                "title": f"Unique {chosen_entity.replace('_', ' ').title()}",
                "column": chosen_entity,
                "aggregation": "unique",
                "format": "integer"
            })

        return recommendations[:6]

    @staticmethod
    def calculate_kpi(df: pd.DataFrame, kpi_spec: Dict[str, Any]) -> Dict[str, Any]:
        """Calculates a single KPI value dynamically on the active (filtered) DataFrame."""
        col = kpi_spec.get("column")
        agg = kpi_spec.get("aggregation", "count").lower()
        title = kpi_spec.get("title") or f"{KPIEngine.AGGREGATION_NAMES.get(agg, agg.title())} of {col}"
        fmt = kpi_spec.get("format", "auto")

        if len(df) == 0:
            return {
                "id": kpi_spec.get("id"),
                "title": title,
                "column": col,
                "aggregation": agg,
                "value": 0,
                "formatted_value": "0",
                "format": fmt,
                "records_counted": 0
            }

        if agg == "count":
            val = len(df) if not col or col not in df.columns else int(df[col].notna().sum())
            return {
                "id": kpi_spec.get("id"),
                "title": title,
                "column": col or "Records",
                "aggregation": agg,
                "value": val,
                "formatted_value": f"{val:,}",
                "format": "integer",
                "records_counted": len(df)
            }

        if col not in df.columns:
            return {
                "id": kpi_spec.get("id"),
                "title": title,
                "column": col,
                "aggregation": agg,
                "value": None,
                "formatted_value": "N/A",
                "error": f"Column '{col}' not found",
                "format": fmt
            }

        series = df[col]

        if agg == "unique":
            val = int(series.nunique())
            return {
                "id": kpi_spec.get("id"),
                "title": title,
                "column": col,
                "aggregation": agg,
                "value": val,
                "formatted_value": f"{val:,}",
                "format": "integer",
                "records_counted": len(df)
            }

        # Numerical aggregations: sum, mean, median, min, max
        num_series = KPIEngine._coerce_numeric(series).dropna()
        if len(num_series) == 0:
            return {
                "id": kpi_spec.get("id"),
                "title": title,
                "column": col,
                "aggregation": agg,
                "value": 0,
                "formatted_value": "0",
                "format": fmt,
                "records_counted": 0
            }

        if agg == "sum":
            val = float(num_series.sum())
        elif agg == "mean":
            val = float(num_series.mean())
        elif agg == "median":
            val = float(num_series.median())
        elif agg == "min":
            val = float(num_series.min())
        elif agg == "max":
            val = float(num_series.max())
        else:
            val = float(num_series.mean())

        # Auto-formatting
        rounded_val = round(val, 2)
        if fmt == "currency" or any(term in str(col).lower() for term in ["sale", "revenue", "profit", "price", "amount", "cost", "salary"]):
            formatted = f"{rounded_val:,.2f}"
        elif fmt == "integer" or rounded_val.is_integer():
            formatted = f"{int(rounded_val):,}"
        else:
            formatted = f"{rounded_val:,.2f}"

        return {
            "id": kpi_spec.get("id"),
            "title": title,
            "column": col,
            "aggregation": agg,
            "value": rounded_val,
            "formatted_value": formatted,
            "format": fmt,
            "records_counted": len(num_series)
        }

    @staticmethod
    def calculate_multiple(df: pd.DataFrame, kpi_specs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return [KPIEngine.calculate_kpi(df, spec) for spec in kpi_specs]
