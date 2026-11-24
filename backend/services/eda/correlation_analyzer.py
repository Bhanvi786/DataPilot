"""
Correlation Analyzer Service for EDA.
Computes Pearson & Spearman correlation matrices and detects strong positive/negative associations.
- Rounds correlation values to 3 decimal places.
- Normalizes very small negative values (e.g. -0.00001) to 0.000.
- Excludes identifiers and constants only when justified, and provides explicit exclusion explanations.
- Generates exact text annotations and hovertooltips for Plotly rendering.
"""
from typing import Dict, Any, List
import pandas as pd
import numpy as np


class CorrelationAnalyzer:
    """Computes correlation matrices safely without including IDs or constants."""

    @staticmethod
    def _coerce_numeric(series: pd.Series) -> pd.Series:
        """Cleans strings with currency symbols or commas to floats."""
        if pd.api.types.is_numeric_dtype(series):
            return pd.to_numeric(series, errors='coerce')
        # Clean currency/commas
        cleaned = series.astype(str).str.replace(r'[$,₹€£,\s]', '', regex=True)
        return pd.to_numeric(cleaned, errors='coerce')

    @staticmethod
    def compute_correlations(
        df: pd.DataFrame,
        num_cols: List[str],
        method: str = "pearson",
        exclude_identifiers: List[str] = None
    ) -> Dict[str, Any]:
        exclude_set = set(exclude_identifiers or [])
        valid_cols = []
        excluded_columns = []

        # Document exclusions
        for c in num_cols:
            if c not in df.columns:
                continue
            if c in exclude_set:
                excluded_columns.append({
                    "column_name": str(c),
                    "reason": "Excluded: Classified as an entity identifier / key (unsuitable for correlation measurement)"
                })
                continue

            series_num = CorrelationAnalyzer._coerce_numeric(df[c]).dropna()
            if series_num.nunique() <= 1:
                excluded_columns.append({
                    "column_name": str(c),
                    "reason": "Excluded: Zero variance or constant column (std dev = 0)"
                })
                continue

            valid_cols.append(str(c))

        if len(valid_cols) < 2:
            return {
                "columns": [],
                "matrix": [],
                "annotations": [],
                "hover_texts": [],
                "strong_positive": [],
                "strong_negative": [],
                "excluded_columns": excluded_columns,
                "note": "At least two varying numerical features are required for correlation analysis."
            }

        # Build clean numeric DataFrame
        num_df = pd.DataFrame({
            c: CorrelationAnalyzer._coerce_numeric(df[c]) for c in valid_cols
        })

        # Calculate exact Pandas correlation
        corr_matrix = num_df.corr(method=method).fillna(0.0)

        columns = list(corr_matrix.columns)
        matrix = []
        annotations = []
        hover_texts = []

        for r_idx in range(len(columns)):
            row_vals = []
            row_annots = []
            row_hovers = []
            for c_idx in range(len(columns)):
                val = float(corr_matrix.iloc[r_idx, c_idx])

                # Handle NaNs
                if np.isnan(val):
                    val = 0.0

                # Normalize small negative floating errors close to 0 to 0.000
                if -1e-6 < val < 0.0:
                    val = 0.0

                val = max(-1.0, min(1.0, val))
                rounded_val = round(val, 3)

                row_vals.append(rounded_val)
                row_annots.append(f"{rounded_val:.3f}")
                row_hovers.append(f"{columns[r_idx]} ↔ {columns[c_idx]}<br>Correlation ({method.capitalize()}): {rounded_val:.3f}")

            matrix.append(row_vals)
            annotations.append(row_annots)
            hover_texts.append(row_hovers)

        # Identify strong correlations (|r| >= 0.5, excluding diagonal)
        strong_pos = []
        strong_neg = []

        for i in range(len(columns)):
            for j in range(i + 1, len(columns)):
                val = float(corr_matrix.iloc[i, j])
                c1, c2 = columns[i], columns[j]
                if val >= 0.5:
                    strong_pos.append({
                        "col1": c1,
                        "col2": c2,
                        "correlation": round(val, 3)
                    })
                elif val <= -0.5:
                    strong_neg.append({
                        "col1": c1,
                        "col2": c2,
                        "correlation": round(val, 3)
                    })

        strong_pos.sort(key=lambda x: x["correlation"], reverse=True)
        strong_neg.sort(key=lambda x: x["correlation"])

        return {
            "method": method,
            "columns": columns,
            "matrix": matrix,
            "annotations": annotations,
            "hover_texts": hover_texts,
            "strong_positive": strong_pos[:5],
            "strong_negative": strong_neg[:5],
            "excluded_columns": excluded_columns,
            "note": "Correlation reflects mathematical association, not causation."
        }
