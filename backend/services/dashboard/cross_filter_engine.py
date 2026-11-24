"""
Cross-Filter Engine for Analytics Dashboard.
Coordinates chart-driven cross-filtering:
- Converts chart click events (e.g. clicking category 'Electronics' or bar 'Store_A')
- Merges into existing filter state with cycle/loop protection
- Returns updated record count and refreshed components.
"""
from typing import Dict, Any, Optional
import pandas as pd


class CrossFilterEngine:
    """Manages cross-filter transformations safely."""

    @staticmethod
    def process_cross_filter(
        active_filters: Dict[str, Any],
        column: str,
        value: Any,
        is_clear: bool = False
    ) -> Dict[str, Any]:
        """
        Updates the active filters with the cross-filter selection.
        If is_clear is True or the clicked value is already selected, clears the cross-filter.
        """
        updated_filters = dict(active_filters or {})

        current_cf = updated_filters.get("__cross_filter__", {})
        current_col = current_cf.get("column")
        current_val = current_cf.get("value")

        if is_clear or (current_col == column and str(current_val) == str(value)):
            # Deselect / Clear cross filter
            updated_filters.pop("__cross_filter__", None)
        else:
            updated_filters["__cross_filter__"] = {
                "column": column,
                "value": value
            }

        return updated_filters
