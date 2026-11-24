"""
EDA Engine Orchestrator for DataPilot.
Coordinates automated data profiling, numerical/categorical analysis, correlation, and insights.
"""
from typing import Dict, Any, Optional
import pandas as pd

from services.eda.column_detector import ColumnDetector
from services.eda.statistical_analyzer import StatisticalAnalyzer
from services.eda.numerical_analyzer import NumericalAnalyzer
from services.eda.categorical_analyzer import CategoricalAnalyzer
from services.eda.correlation_analyzer import CorrelationAnalyzer
from services.eda.time_series_analyzer import TimeSeriesAnalyzer
from services.eda.relationship_analyzer import RelationshipAnalyzer
from services.eda.insight_generator import InsightGenerator
from services.eda.visualization_engine import VisualizationEngine


class EDAEngine:
    """Master EDA orchestrator."""

    def __init__(self):
        self.column_detector = ColumnDetector()
        self.statistical_analyzer = StatisticalAnalyzer()
        self.numerical_analyzer = NumericalAnalyzer()
        self.categorical_analyzer = CategoricalAnalyzer()
        self.correlation_analyzer = CorrelationAnalyzer()
        self.time_series_analyzer = TimeSeriesAnalyzer()
        self.relationship_analyzer = RelationshipAnalyzer()
        self.insight_generator = InsightGenerator()
        self.visualization_engine = VisualizationEngine()

    def get_overview(self, df: pd.DataFrame) -> Dict[str, Any]:
        cols = self.column_detector.detect_columns(df)
        total_charts = len(cols["numerical"]) + len(cols["temporal_components"]) + len(cols["categorical"])
        if len(cols["numerical"]) >= 2:
            total_charts += 1 # correlation
        if len(cols["datetime"]) > 0 and len(cols["numerical"]) > 0:
            total_charts += 1 # time series

        return {
            "total_records": len(df),
            "total_columns": len(df.columns),
            "numerical_count": len(cols["numerical"]),
            "temporal_components_count": len(cols["temporal_components"]),
            "categorical_count": len(cols["categorical"]),
            "datetime_count": len(cols["datetime"]),
            "boolean_count": len(cols["boolean"]),
            "identifier_count": len(cols["identifiers"]),
            "constant_count": len(cols["constants"]),
            "total_generated_charts": total_charts,
            "column_breakdown": cols
        }
