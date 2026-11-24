"""
Data Cleaning Module for DataPilot.
(Placeholder for future phases: Handling missing values, outliers, duplicate removal, encoding, etc.)
"""
import pandas as pd


def remove_duplicates(df: pd.DataFrame) -> pd.DataFrame:
    """Remove duplicate rows from dataset."""
    return df.drop_duplicates()


def handle_missing_values(df: pd.DataFrame, strategy: str = "drop") -> pd.DataFrame:
    """Handle missing values with basic strategies."""
    if strategy == "drop":
        return df.dropna()
    return df
