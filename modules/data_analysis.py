"""
Data Analysis Module for DataPilot.
(Placeholder for future phases: Exploratory Data Analysis, summary statistics, correlation matrices, etc.)
"""
import pandas as pd


def generate_summary_statistics(df: pd.DataFrame) -> pd.DataFrame:
    """Generate descriptive statistics for numeric & categorical features."""
    return df.describe(include="all").transpose()
