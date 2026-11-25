from fastapi import APIRouter, HTTPException, Query, Body
from typing import Optional, Dict, Any
import pandas as pd

from config import settings
from services.dataset_service import DatasetService
from services.cleaning_engine import CleaningEngine
from services.eda.eda_engine import EDAEngine

router = APIRouter(prefix="", tags=["EDA"])
dataset_service = DatasetService(storage_dir=settings.STORAGE_DIR)
cleaning_engine = CleaningEngine(storage_dir=settings.STORAGE_DIR)
eda_engine = EDAEngine()


def get_active_dataframe(dataset_id: str, version: str = "cleaned") -> pd.DataFrame:
    """Helper to fetch either cleaned or original DataFrame."""
    if version == "cleaned":
        df = cleaning_engine.get_cleaned_version(dataset_id)
        if df is not None:
            return df
    # Fallback to original
    df = dataset_service.get_dataframe(dataset_id)
    if df is None:
        raise HTTPException(status_code=404, detail="Dataset not found or expired.")
    return df


@router.get("/dataset/{dataset_id}/eda/overview")
def get_eda_overview(dataset_id: str, version: str = Query("cleaned")):
    """Overview of column categories and chart counts."""
    df = get_active_dataframe(dataset_id, version)
    overview = eda_engine.get_overview(df)
    return {
        "dataset_id": dataset_id,
        "version_used": version,
        "overview": overview
    }


@router.get("/dataset/{dataset_id}/eda/statistics")
def get_eda_statistics(dataset_id: str, version: str = Query("cleaned")):
    """Descriptive statistics for Numerical, Categorical, and Datetime columns."""
    df = get_active_dataframe(dataset_id, version)
    cols = eda_engine.column_detector.detect_columns(df)

    num_stats = eda_engine.statistical_analyzer.get_numerical_statistics(df, cols["numerical"])
    cat_stats = eda_engine.statistical_analyzer.get_categorical_statistics(df, cols["categorical"])
    dt_stats = eda_engine.statistical_analyzer.get_datetime_statistics(df, cols["datetime"])

    return {
        "dataset_id": dataset_id,
        "version_used": version,
        "numerical_statistics": num_stats,
        "categorical_statistics": cat_stats,
        "datetime_statistics": dt_stats
    }


@router.get("/dataset/{dataset_id}/eda/numerical")
def get_eda_numerical(dataset_id: str, version: str = Query("cleaned")):
    """Separated numerical distributions (Histograms and Boxplots) & Temporal Components."""
    df = get_active_dataframe(dataset_id, version)
    cols = eda_engine.column_detector.detect_columns(df)
    distributions = eda_engine.numerical_analyzer.analyze_numerical_distributions(df, cols["numerical"])
    temporal_distributions = eda_engine.numerical_analyzer.analyze_temporal_components(df, cols["temporal_components"])
    return {
        "dataset_id": dataset_id,
        "distributions": distributions,
        "temporal_distributions": temporal_distributions
    }


@router.get("/dataset/{dataset_id}/eda/categorical")
def get_eda_categorical(dataset_id: str, version: str = Query("cleaned")):
    """Categorical distributions (High vs Low cardinality) & Separate Identifiers."""
    df = get_active_dataframe(dataset_id, version)
    cols = eda_engine.column_detector.detect_columns(df)
    distributions = eda_engine.categorical_analyzer.analyze_categorical_distributions(df, cols["categorical"])
    identifiers = eda_engine.categorical_analyzer.analyze_identifiers(df, cols["identifiers"])
    return {
        "dataset_id": dataset_id,
        "distributions": distributions,
        "identifiers": identifiers
    }


@router.get("/dataset/{dataset_id}/eda/correlation")
def get_eda_correlation(dataset_id: str, method: str = Query("pearson", pattern="^(pearson|spearman)$"), version: str = Query("cleaned")):
    """Correlation matrix and identified strong relationships."""
    df = get_active_dataframe(dataset_id, version)
    cols = eda_engine.column_detector.detect_columns(df)
    correlations = eda_engine.correlation_analyzer.compute_correlations(
        df=df,
        num_cols=cols["numerical"],
        method=method,
        exclude_identifiers=cols["identifiers"]
    )
    return {
        "dataset_id": dataset_id,
        "correlations": correlations
    }


@router.get("/dataset/{dataset_id}/eda/timeseries")
def get_eda_timeseries(
    dataset_id: str,
    date_col: Optional[str] = None,
    metric_col: Optional[str] = None,
    freq: str = Query("M", pattern="^(D|W|M|Q|Y)$"),
    agg_func: str = Query("mean", pattern="^(mean|sum|median|count|min|max)$"),
    version: str = Query("cleaned")
):
    """Chronological time-series analysis."""
    df = get_active_dataframe(dataset_id, version)
    cols = eda_engine.column_detector.detect_columns(df)

    if not cols["datetime"]:
        return {
            "has_timeseries": False,
            "message": "No date or timestamp columns detected in this dataset."
        }

    selected_date = date_col if date_col and date_col in cols["datetime"] else cols["datetime"][0]
    if not cols["numerical"]:
        return {
            "has_timeseries": False,
            "message": "Date column exists, but no numerical columns are available for time-series aggregation."
        }

    selected_metric = metric_col if metric_col and metric_col in cols["numerical"] else cols["numerical"][0]

    ts_data = eda_engine.time_series_analyzer.analyze_time_series(
        df=df,
        date_col=selected_date,
        metric_col=selected_metric,
        freq=freq,
        agg_func=agg_func
    )

    if not ts_data:
        return {
            "has_timeseries": False,
            "available_date_columns": cols["datetime"],
            "available_metric_columns": cols["numerical"],
            "message": "Insufficient or unparseable date records to compute chronological aggregation."
        }

    return {
        "has_timeseries": True,
        "available_date_columns": cols["datetime"],
        "available_metric_columns": cols["numerical"],
        "analysis": ts_data
    }


@router.get("/dataset/{dataset_id}/eda/insights")
def get_eda_insights(dataset_id: str, version: str = Query("cleaned")):
    """Statistical observations generated dynamically from data properties."""
    df = get_active_dataframe(dataset_id, version)
    cols = eda_engine.column_detector.detect_columns(df)

    num_stats = eda_engine.statistical_analyzer.get_numerical_statistics(df, cols["numerical"])
    cat_stats = eda_engine.statistical_analyzer.get_categorical_statistics(df, cols["categorical"])
    corrs = eda_engine.correlation_analyzer.compute_correlations(df, cols["numerical"])

    insights = eda_engine.insight_generator.generate_insights(df, num_stats, cat_stats, corrs)
    return {
        "dataset_id": dataset_id,
        "total_insights": len(insights),
        "insights": insights
    }


@router.post("/dataset/{dataset_id}/eda/custom-chart")
def generate_custom_chart(dataset_id: str, config: Dict[str, Any] = Body(...), version: str = Query("cleaned")):
    """Custom chart builder supporting Bar, Line, Scatter, Histogram, Box, and Pie."""
    df = get_active_dataframe(dataset_id, version)

    chart_type = config.get("chart_type", "bar")
    x_col = config.get("x_column")
    y_col = config.get("y_column")
    color_col = config.get("color_column")
    agg_func = config.get("agg_func", "none")

    if not x_col:
        raise HTTPException(status_code=400, detail="x_column is required.")

    result = eda_engine.visualization_engine.build_chart(
        df=df,
        chart_type=chart_type,
        x_col=x_col,
        y_col=y_col,
        color_col=color_col,
        agg_func=agg_func
    )

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return result


@router.post("/dataset/{dataset_id}/query")
def ask_natural_query(
    dataset_id: str,
    payload: Dict[str, Any] = Body(...),
    version: str = Query("cleaned")
):
    """
    Search engine endpoint: translates plain English questions into pandas operations.
    e.g., 'which area had max sales', 'total revenue by city', 'average profit'
    """
    query = payload.get("query", "").strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query string is required.")

    df = get_active_dataframe(dataset_id, version)
    from services.eda.query_engine import QueryEngine
    result = QueryEngine.process_query(df, query)
    return result

