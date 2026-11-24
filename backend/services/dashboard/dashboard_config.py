"""
Dashboard Configuration Manager.
Stores customized dashboard layouts, user-configured KPI cards, and custom charts per dataset.
Uses JSON storage in the dataset storage directory, avoiding external database complexity.
"""
from typing import Dict, Any, List, Optional
import os
import json


class DashboardConfigManager:
    """Manages persistence of user-customized dashboard layouts."""

    def __init__(self, storage_dir: str):
        self.storage_dir = storage_dir

    def _get_config_path(self, dataset_id: str) -> str:
        dataset_dir = os.path.join(self.storage_dir, dataset_id)
        os.makedirs(dataset_dir, exist_ok=True)
        return os.path.join(dataset_dir, "dashboard_config.json")

    def get_config(self, dataset_id: str) -> Optional[Dict[str, Any]]:
        path = self._get_config_path(dataset_id)
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                return None
        return None

    def save_config(self, dataset_id: str, config: Dict[str, Any]) -> bool:
        path = self._get_config_path(dataset_id)
        try:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(config, f, indent=2)
            return True
        except Exception:
            return False

    @staticmethod
    def build_default_config(
        dataset_id: str,
        column_breakdown: Dict[str, List[str]],
        recommended_kpis: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Constructs a professional default dashboard tailored to available columns."""
        nums = column_breakdown.get("numerical", [])
        cats = column_breakdown.get("categorical", [])
        dates = column_breakdown.get("datetime", [])

        charts = []

        # Chart 1: Time series line chart (if dates exist)
        if dates and nums:
            charts.append({
                "id": "chart_main_trend",
                "type": "line",
                "title": f"{nums[0].replace('_', ' ').title()} Over Time",
                "x": dates[0],
                "y": nums[0],
                "aggregation": "sum" if any(term in str(nums[0]).lower() for term in ["sale", "amount", "total", "revenue", "cost"]) else "mean",
                "freq": "M",
                "grid_col": "full"  # Full width
            })

        # Chart 2: Primary Categorical Breakdown
        if cats and nums:
            charts.append({
                "id": "chart_cat_breakdown",
                "type": "bar",
                "title": f"{nums[0].replace('_', ' ').title()} by {cats[0].replace('_', ' ').title()}",
                "x": cats[0],
                "y": nums[0],
                "aggregation": "sum" if any(term in str(nums[0]).lower() for term in ["sale", "amount", "revenue", "profit"]) else "mean",
                "grid_col": "half"
            })
        elif cats:
            charts.append({
                "id": "chart_cat_counts",
                "type": "bar",
                "title": f"Records by {cats[0].replace('_', ' ').title()}",
                "x": cats[0],
                "aggregation": "count",
                "grid_col": "half"
            })

        # Chart 3: Secondary Category Donut
        if len(cats) >= 2:
            sec_cat = cats[1]
            charts.append({
                "id": "chart_cat_donut",
                "type": "donut",
                "title": f"Distribution by {sec_cat.replace('_', ' ').title()}",
                "x": sec_cat,
                "y": nums[0] if nums else None,
                "aggregation": "sum" if nums else "count",
                "grid_col": "half"
            })
        elif len(nums) >= 2:
            charts.append({
                "id": "chart_num_box",
                "type": "box",
                "title": f"{nums[1].replace('_', ' ').title()} Distribution Spread",
                "y": nums[1],
                "grid_col": "half"
            })

        # Chart 4: Bivariate Relationship (if >= 2 numericals)
        if len(nums) >= 2:
            charts.append({
                "id": "chart_relationship",
                "type": "scatter",
                "title": f"{nums[0].replace('_', ' ').title()} vs {nums[1].replace('_', ' ').title()}",
                "x": nums[0],
                "y": nums[1],
                "grid_col": "half"
            })
        elif len(nums) == 1:
            charts.append({
                "id": "chart_num_hist",
                "type": "histogram",
                "title": f"{nums[0].replace('_', ' ').title()} Histogram",
                "x": nums[0],
                "grid_col": "half"
            })

        return {
            "dataset_id": dataset_id,
            "title": "Interactive Analytics Dashboard",
            "kpis": recommended_kpis,
            "charts": charts,
            "theme": "emerald-dark"
        }
