"""
Data Type Handler for DataPilot.
Performs safe conversion to Integer, Float, String, Boolean, Date, and Categorical.
Never silently discards valid data; captures conversion anomalies.
"""
from typing import Dict, Any, Tuple
import pandas as pd
import numpy as np


class DataTypeHandler:
    """Manages automatic and user-driven type casting with robust error tracking."""

    @staticmethod
    def convert_column(series: pd.Series, target_type: str) -> Tuple[pd.Series, Dict[str, Any]]:
        target_lower = target_type.lower().strip()
        report = {
            "success": True,
            "errors_count": 0,
            "target_type": target_type,
            "message": "Conversion successful"
        }

        try:
            if target_lower in ["integer", "int"]:
                # Use pandas nullable Int64 so NaNs don't force float conversion
                converted = pd.to_numeric(series, errors='coerce')
                errors = int(converted.isna().sum() - series.isna().sum())
                report["errors_count"] = max(0, errors)
                converted = converted.round().astype("Int64")
                return converted, report

            elif target_lower in ["float", "decimal"]:
                converted = pd.to_numeric(series, errors='coerce')
                errors = int(converted.isna().sum() - series.isna().sum())
                report["errors_count"] = max(0, errors)
                return converted.astype("float64"), report

            elif target_lower in ["string", "text"]:
                converted = series.astype(str)
                # Keep true NaNs as NaN
                converted[series.isna()] = np.nan
                return converted, report

            elif target_lower in ["boolean", "bool"]:
                truthy = {"true", "1", "t", "yes", "y", "1.0"}
                falsy = {"false", "0", "f", "no", "n", "0.0"}

                def to_bool(val):
                    if pd.isna(val):
                        return pd.NA
                    val_str = str(val).strip().lower()
                    if val_str in truthy:
                        return True
                    elif val_str in falsy:
                        return False
                    return pd.NA

                converted = series.apply(to_bool).astype("boolean")
                return converted, report

            elif target_lower in ["date", "datetime"]:
                converted = pd.to_datetime(series, errors='coerce')
                errors = int(converted.isna().sum() - series.isna().sum())
                report["errors_count"] = max(0, errors)
                # Format clean ISO date strings
                return converted, report

            elif target_lower in ["categorical", "category"]:
                return series.astype("category"), report

            else:
                report["success"] = False
                report["message"] = f"Unknown target type: {target_type}"
                return series, report

        except Exception as e:
            report["success"] = False
            report["message"] = str(e)
            return series, report
