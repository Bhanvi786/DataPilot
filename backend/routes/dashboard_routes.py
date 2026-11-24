from fastapi import APIRouter, HTTPException, Query, Body, Response
from fastapi.responses import StreamingResponse, HTMLResponse
from typing import Optional, Dict, Any, List
import pandas as pd

from config import settings
from services.dataset_service import DatasetService
from services.cleaning_engine import CleaningEngine
from services.eda.column_detector import ColumnDetector
from services.dashboard.kpi_engine import KPIEngine
from services.dashboard.filter_engine import FilterEngine
from services.dashboard.dashboard_data_service import DashboardDataService
from services.dashboard.dashboard_config import DashboardConfigManager
from services.dashboard.dashboard_export import DashboardExportService
from services.dashboard.cross_filter_engine import CrossFilterEngine

router = APIRouter(prefix="", tags=["Analytics Dashboard"])
dataset_service = DatasetService(storage_dir=settings.STORAGE_DIR)
cleaning_engine = CleaningEngine(storage_dir=settings.STORAGE_DIR)
config_manager = DashboardConfigManager(storage_dir=settings.STORAGE_DIR)


def get_active_dataframe(dataset_id: str, version: str = "cleaned") -> pd.DataFrame:
    """Helper to fetch either cleaned or original DataFrame."""
    if version == "cleaned":
        df = cleaning_engine.get_cleaned_version(dataset_id)
        if df is not None:
            return df
    df = dataset_service.get_dataframe(dataset_id)
    if df is None:
        raise HTTPException(status_code=404, detail="Dataset not found or expired.")
    return df


@router.get("/dataset/{dataset_id}/dashboard/overview")
def get_dashboard_overview(dataset_id: str, version: str = Query("cleaned")):
    """
    Returns complete dataset overview for dashboard bootstrap:
    - Column breakdown
    - Available dynamic filters
    - Suggested KPI cards
    - Saved or default dashboard layout & charts
    """
    df = get_active_dataframe(dataset_id, version)
    cols = ColumnDetector.detect_columns(df)

    available_filters = FilterEngine.detect_available_filters(df, cols)
    recommended_kpis = KPIEngine.recommend_kpis(df, cols)

    # Saved or default layout
    saved_config = config_manager.get_config(dataset_id)
    if not saved_config:
        saved_config = DashboardConfigManager.build_default_config(dataset_id, cols, recommended_kpis)
        config_manager.save_config(dataset_id, saved_config)

    meta = dataset_service.get_metadata(dataset_id)
    dataset_name = (
        meta.get("file_name", "Dataset") if isinstance(meta, dict) else getattr(meta, "file_name", "Dataset")
    ) if meta else "Dataset"

    # Evaluate default KPIs over full dataset initially
    initial_kpi_results = KPIEngine.calculate_multiple(df, saved_config.get("kpis", recommended_kpis))

    return {
        "dataset_id": dataset_id,
        "dataset_name": dataset_name,
        "version_used": version,
        "total_records": len(df),
        "total_columns": len(df.columns),
        "column_breakdown": cols,
        "available_filters": available_filters,
        "config": saved_config,
        "kpis": initial_kpi_results
    }


@router.post("/dataset/{dataset_id}/dashboard/filters")
def evaluate_dashboard_filters(
    dataset_id: str,
    payload: Dict[str, Any] = Body(...),
    version: str = Query("cleaned")
):
    """
    Accepts active filters dictionary and evaluates filtered dataset:
    Returns remaining records count, active filter summary, and filtered KPIs.
    """
    df = get_active_dataframe(dataset_id, version)
    filters = payload.get("filters", {})
    kpi_specs = payload.get("kpi_specs", [])

    filtered_df = FilterEngine.apply_filters(df, filters)
    cols = ColumnDetector.detect_columns(filtered_df)

    # If kpi_specs provided, calculate directly on filtered dataframe
    kpi_results = []
    if kpi_specs:
        kpi_results = KPIEngine.calculate_multiple(filtered_df, kpi_specs)

    return {
        "dataset_id": dataset_id,
        "version_used": version,
        "total_records": len(df),
        "filtered_records": len(filtered_df),
        "filter_ratio": round((len(filtered_df) / len(df) * 100), 1) if len(df) > 0 else 0,
        "kpis": kpi_results
    }


@router.post("/dataset/{dataset_id}/dashboard/kpis")
def calculate_dashboard_kpis(
    dataset_id: str,
    payload: Dict[str, Any] = Body(...),
    version: str = Query("cleaned")
):
    """Calculates custom KPI list over active filters."""
    df = get_active_dataframe(dataset_id, version)
    filters = payload.get("filters", {})
    kpi_specs = payload.get("kpi_specs", [])

    filtered_df = FilterEngine.apply_filters(df, filters)
    results = KPIEngine.calculate_multiple(filtered_df, kpi_specs)

    return {
        "dataset_id": dataset_id,
        "filtered_records": len(filtered_df),
        "kpis": results
    }


@router.post("/dataset/{dataset_id}/dashboard/chart")
def get_dashboard_chart_data(
    dataset_id: str,
    payload: Dict[str, Any] = Body(...),
    version: str = Query("cleaned")
):
    """Generates chart-ready payload for a specific chart config on filtered data."""
    df = get_active_dataframe(dataset_id, version)
    filters = payload.get("filters", {})
    chart_config = payload.get("chart_config", {})

    filtered_df = FilterEngine.apply_filters(df, filters)
    chart_data = DashboardDataService.generate_chart_data(filtered_df, chart_config)

    return {
        "dataset_id": dataset_id,
        "filtered_records": len(filtered_df),
        "chart_data": chart_data
    }


@router.post("/dataset/{dataset_id}/dashboard/cross-filter")
def handle_cross_filter(
    dataset_id: str,
    payload: Dict[str, Any] = Body(...),
    version: str = Query("cleaned")
):
    """Processes cross-filter clicks from charts, returning updated filter state and record count."""
    df = get_active_dataframe(dataset_id, version)
    active_filters = payload.get("active_filters", {})
    column = payload.get("column", "")
    value = payload.get("value")
    is_clear = payload.get("is_clear", False)

    updated_filters = CrossFilterEngine.process_cross_filter(
        active_filters, column, value, is_clear=is_clear
    )
    filtered_df = FilterEngine.apply_filters(df, updated_filters)

    return {
        "dataset_id": dataset_id,
        "updated_filters": updated_filters,
        "filtered_records": len(filtered_df),
        "cross_filter_active": "__cross_filter__" in updated_filters
    }


@router.get("/dataset/{dataset_id}/dashboard/config")
def get_dashboard_config(dataset_id: str):
    """Fetches saved dashboard configuration."""
    config = config_manager.get_config(dataset_id)
    if not config:
        raise HTTPException(status_code=404, detail="No custom dashboard config found.")
    return config


@router.post("/dataset/{dataset_id}/dashboard/config")
def save_dashboard_config(
    dataset_id: str,
    config: Dict[str, Any] = Body(...)
):
    """Persists customized layout, KPIs, and charts."""
    success = config_manager.save_config(dataset_id, config)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to save dashboard configuration.")
    return {"message": "Dashboard configuration saved successfully."}


@router.post("/dataset/{dataset_id}/dashboard/export")
def export_dashboard(
    dataset_id: str,
    payload: Dict[str, Any] = Body(...),
    version: str = Query("cleaned")
):
    """
    Exports filtered dataset or dashboard report:
    format: 'csv' | 'excel' | 'report_html'
    """
    df = get_active_dataframe(dataset_id, version)
    filters = payload.get("filters", {})
    export_format = payload.get("format", "csv").lower()
    kpis = payload.get("kpis", [])
    charts = payload.get("charts", [])

    filtered_df = FilterEngine.apply_filters(df, filters)
    meta = dataset_service.get_metadata(dataset_id)
    file_name = (
        meta.get("file_name", f"dataset_{dataset_id[:8]}") if isinstance(meta, dict) else getattr(meta, "file_name", f"dataset_{dataset_id[:8]}")
    ) if meta else f"dataset_{dataset_id[:8]}"
    name_prefix = file_name.rsplit('.', 1)[0]

    if export_format == "csv":
        buf = DashboardExportService.export_csv(filtered_df)
        return StreamingResponse(
            buf,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={name_prefix}_filtered.csv"}
        )

    elif export_format in ["excel", "xlsx"]:
        buf = DashboardExportService.export_excel(filtered_df)
        return StreamingResponse(
            buf,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={name_prefix}_filtered.xlsx"}
        )

    elif export_format in ["report", "report_html", "pdf"]:
        html_content = DashboardExportService.generate_html_report(
            dataset_name=file_name,
            version=version,
            total_records=len(df),
            filtered_records=len(filtered_df),
            active_filters=filters,
            kpis=kpis,
            charts=charts
        )
        return HTMLResponse(content=html_content, status_code=200)

    else:
        raise HTTPException(status_code=400, detail=f"Unsupported export format '{export_format}'")
