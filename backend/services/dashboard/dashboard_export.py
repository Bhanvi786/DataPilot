"""
Dashboard Export Service.
Generates export artifacts based on the active filtered dataset and current dashboard state:
- Filtered CSV download
- Filtered Excel download
- Professional HTML / Printable PDF Dashboard Report containing active filters, KPIs, and charts.
"""
from typing import Dict, Any, List, Optional
import pandas as pd
import io
import datetime


class DashboardExportService:
    """Handles dataset extraction and formatted document compilation."""

    @staticmethod
    def export_csv(df: pd.DataFrame) -> io.BytesIO:
        """Exports filtered DataFrame as UTF-8 CSV buffer."""
        buffer = io.BytesIO()
        df.to_csv(buffer, index=False, encoding="utf-8")
        buffer.seek(0)
        return buffer

    @staticmethod
    def export_excel(df: pd.DataFrame) -> io.BytesIO:
        """Exports filtered DataFrame as XLSX buffer."""
        buffer = io.BytesIO()
        with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
            df.to_excel(writer, index=False, sheet_name="DataPilot_Filtered")
        buffer.seek(0)
        return buffer

    @staticmethod
    def generate_html_report(
        dataset_name: str,
        version: str,
        total_records: int,
        filtered_records: int,
        active_filters: Dict[str, Any],
        kpis: List[Dict[str, Any]],
        charts: List[Dict[str, Any]]
    ) -> str:
        """Generates a styled, self-contained printable HTML dashboard report suitable for direct browser printing / PDF export."""
        gen_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        filter_rows = ""
        if active_filters:
            for k, v in active_filters.items():
                if k == "__cross_filter__":
                    filter_rows += f"<tr><td style='padding:6px 12px;font-weight:bold;color:#20C997;'>Chart Click: {v.get('column')}</td><td style='padding:6px 12px;'>{v.get('value')}</td></tr>"
                else:
                    filter_rows += f"<tr><td style='padding:6px 12px;font-weight:bold;color:#20C997;'>{k}</td><td style='padding:6px 12px;'>{v}</td></tr>"
        else:
            filter_rows = "<tr><td colspan='2' style='padding:8px 12px;color:#A7B5AE;font-style:italic;'>No active filters applied (Full dataset)</td></tr>"

        kpi_cards = ""
        for kpi in kpis:
            kpi_cards += f"""
            <div style="background:#0D1512;border:1px solid #244536;border-radius:10px;padding:16px;flex:1;min-width:180px;">
                <div style="font-size:11px;color:#A7B5AE;text-transform:uppercase;font-weight:bold;">{kpi.get('title')}</div>
                <div style="font-size:24px;font-weight:800;color:#6EE7B7;margin-top:4px;">{kpi.get('formatted_value')}</div>
                <div style="font-size:11px;color:#20C997;margin-top:2px;">{kpi.get('aggregation', '').upper()} of {kpi.get('column')}</div>
            </div>
            """

        chart_summaries = ""
        for ch in charts:
            c_type = ch.get("type", "").upper()
            c_title = ch.get("title", "")
            chart_summaries += f"""
            <div style="background:#0D1512;border:1px solid #244536;border-radius:10px;padding:16px;margin-bottom:16px;">
                <div style="display:flex;justify-content:space-between;border-bottom:1px solid #244536;padding-bottom:8px;margin-bottom:12px;">
                    <span style="font-weight:bold;color:#FFFFFF;font-size:14px;">{c_title}</span>
                    <span style="font-size:11px;background:#14231E;color:#20C997;padding:2px 8px;border-radius:6px;border:1px solid #244536;">{c_type}</span>
                </div>
                <div style="font-size:12px;color:#A7B5AE;">
                    Metric: <strong style="color:#FFF;">{ch.get('y_label', ch.get('column', 'Records'))}</strong> | 
                    Dimension: <strong style="color:#FFF;">{ch.get('x_label', ch.get('cross_filter_col', 'Category'))}</strong>
                </div>
            </div>
            """

        html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>DataPilot Analytics Dashboard Report</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #080D0C;
            color: #FFFFFF;
            margin: 0;
            padding: 30px;
        }}
        @media print {{
            body {{ background-color: #080D0C; -webkit-print-color-adjust: exact; }}
        }}
    </style>
</head>
<body>
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #244536;padding-bottom:16px;margin-bottom:24px;">
        <div>
            <h1 style="margin:0;font-size:24px;color:#FFFFFF;">⚡ DataPilot Analytics Dashboard Report</h1>
            <p style="margin:4px 0 0 0;font-size:12px;color:#A7B5AE;">Dataset: <strong style="color:#6EE7B7;">{dataset_name}</strong> ({version})</p>
        </div>
        <div style="text-align:right;font-size:11px;color:#A7B5AE;">
            <div>Generated: <strong>{gen_time}</strong></div>
            <div style="color:#20C997;font-weight:bold;margin-top:2px;">Records: {filtered_records:,} of {total_records:,}</div>
        </div>
    </div>

    <h3 style="color:#6EE7B7;font-size:14px;text-transform:uppercase;margin-bottom:12px;">Active Filter Criteria</h3>
    <table style="width:100%;border-collapse:collapse;background:#0D1512;border:1px solid #244536;border-radius:8px;font-size:12px;margin-bottom:24px;">
        <thead>
            <tr style="border-bottom:1px solid #244536;background:#14231E;">
                <th style="padding:8px 12px;text-align:left;color:#A7B5AE;">Dimension / Filter</th>
                <th style="padding:8px 12px;text-align:left;color:#A7B5AE;">Applied Value</th>
            </tr>
        </thead>
        <tbody>
            {filter_rows}
        </tbody>
    </table>

    <h3 style="color:#6EE7B7;font-size:14px;text-transform:uppercase;margin-bottom:12px;">Key Performance Indicators (KPIs)</h3>
    <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:28px;">
        {kpi_cards}
    </div>

    <h3 style="color:#6EE7B7;font-size:14px;text-transform:uppercase;margin-bottom:12px;">Dashboard Visualization Summary</h3>
    <div>
        {chart_summaries}
    </div>

    <div style="border-top:1px solid #244536;padding-top:16px;margin-top:30px;font-size:11px;color:#A7B5AE;display:flex;justify-content:space-between;">
        <span>DataPilot Automated Intelligence v4.0.0</span>
        <span>Confidential & Proprietary Analytics</span>
    </div>
</body>
</html>
"""
        return html
