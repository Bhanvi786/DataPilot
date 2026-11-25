"""
Natural Language Query Search Engine for DataPilot.
Translates plain English queries (e.g. "which area had max sales", "total revenue by city",
"average profit by category", "top 5 products", "how many transactions", "what is the average sales")
into dynamic Pandas aggregations.

Zero external LLM API dependencies, runs 100% locally with high precision and speed.
"""

from typing import Dict, Any, List, Optional, Tuple
import re
import pandas as pd
import numpy as np


class QueryEngine:
    """Interprets free-text queries over arbitrary tabular datasets and returns answers, tables, and chart data."""

    AGG_KEYWORDS = {
        "max": ["max", "maximum", "highest", "top", "peak", "most", "largest", "biggest", "best"],
        "min": ["min", "minimum", "lowest", "bottom", "least", "smallest", "worst"],
        "sum": ["sum", "total", "overall", "aggregate", "combined", "cumulative"],
        "mean": ["average", "avg", "mean"],
        "count": ["count", "how many", "number of", "total number", "frequency", "occurrences", "records", "rows"],
        "median": ["median", "middle"],
    }

    # Explicit phrases for grouped queries vs purely single scalar metrics
    GROUP_INDICATORS = ["which", "by", "per", "each", "group by", "broken down by", "across", "where", "who"]

    @staticmethod
    def _clean_token(s: str) -> str:
        return re.sub(r"[^a-zA-Z0-9]", "", s).lower()

    @classmethod
    def _match_column(cls, text: str, available_columns: List[str]) -> Optional[str]:
        """
        Fuzzy / semantic matching of words in query against dataset columns.
        E.g. "sales" matches "Sales_INR" or "Sales". "area" matches "City", "Region", "Store_Location", "Area".
        """
        text_lower = text.lower()
        tokens = [cls._clean_token(t) for t in re.split(r"\s+", text_lower) if cls._clean_token(t)]

        # 1. Exact case-insensitive match
        for col in available_columns:
            clean_col = cls._clean_token(col)
            if clean_col and clean_col in text_lower:
                return col

        # 2. Substring match inside column name or tokens
        for col in available_columns:
            clean_col = cls._clean_token(col)
            for t in tokens:
                if len(t) >= 3:
                    if t in clean_col or clean_col in t:
                        return col

        # 3. Semantic synonyms dictionary
        synonyms = {
            "area": ["city", "region", "location", "state", "zone", "territory", "district", "country", "place", "address", "branch"],
            "location": ["city", "region", "state", "zone", "area", "country", "store", "outlet"],
            "place": ["city", "region", "location", "state"],
            "item": ["product", "sku", "item_name", "product_name", "goods", "merchandise"],
            "product": ["item", "sku", "product_name", "title"],
            "cost": ["price", "unit_price", "rate", "cost_price", "expense", "amount"],
            "sales": ["revenue", "turnover", "total_sales", "sales_amount", "sale", "sales_inr", "sales_usd", "selling_price"],
            "revenue": ["sales", "turnover", "total_sales", "income", "sales_inr"],
            "profit": ["margin", "gain", "net_profit", "earnings"],
            "people": ["customer", "client", "buyer", "employee", "user", "staff", "person"],
            "customer": ["client", "buyer", "user", "patron", "consumer"],
            "client": ["customer", "buyer", "user"],
            "date": ["time", "day", "month", "year", "timestamp", "period", "order_date"],
            "time": ["date", "timestamp", "hour", "year", "month"],
            "quantity": ["qty", "units", "count", "volume", "amount"],
            "discount": ["rebate", "deduction", "offer"],
            "category": ["type", "group", "class", "genre", "segment", "department"]
        }

        for token in tokens:
            if token in synonyms:
                target_words = synonyms[token]
                for col in available_columns:
                    col_clean = cls._clean_token(col)
                    for target in target_words:
                        if target in col_clean or col_clean in target:
                            return col

        return None

    @classmethod
    def process_query(cls, df: pd.DataFrame, query: str) -> Dict[str, Any]:
        """
        Execute natural query over pandas dataframe.
        """
        if df is None or df.empty:
            return {
                "success": False,
                "error": "Dataset is empty.",
                "query": query
            }

        q_clean = query.strip()
        q_lower = q_clean.lower()

        # Identify numerical and categorical columns
        num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        cat_cols = [c for c in df.columns if c not in num_cols]

        # Detect desired aggregation operation
        agg_op = "sum" if "total" in q_lower or "sum" in q_lower else ("max" if "max" in q_lower or "highest" in q_lower or "top" in q_lower else None)
        if not agg_op:
            for op, keywords in cls.AGG_KEYWORDS.items():
                for kw in keywords:
                    if re.search(r"\b" + re.escape(kw) + r"\b", q_lower):
                        agg_op = op
                        break
                if agg_op:
                    break
        
        # Default agg_op to sum if asking for revenue/sales by something, else mean
        if not agg_op:
            agg_op = "sum" if any(w in q_lower for w in ["sale", "revenue", "profit", "amount"]) else "mean"

        # Check for row count queries
        is_row_count_query = any(re.search(r"\b" + re.escape(p) + r"\b", q_lower) for p in [
            "how many rows", "row count", "number of rows", "total rows", "how many records", "dataset size"
        ])
        if is_row_count_query:
            row_count = len(df)
            col_count = len(df.columns)
            return {
                "success": True,
                "query": query,
                "answer": f"The dataset contains **{row_count:,} rows** across **{col_count} columns**.",
                "top_result": {
                    "category": "Total Records",
                    "value": row_count,
                    "formatted": f"{row_count:,}",
                    "operation": "Count"
                },
                "chart": None,
                "table": [
                    {"Metric": "Total Rows", "Value": f"{row_count:,}"},
                    {"Metric": "Total Columns", "Value": str(col_count)}
                ],
                "interpretation": {
                    "detected_dimension": None,
                    "detected_metric": None,
                    "aggregation": "Row Count"
                }
            }

        # Check for top / bottom limit (e.g. "top 5", "top 10")
        limit_match = re.search(r"\b(?:top|first|highest|bottom|lowest)\s+(\d+)\b", q_lower)
        limit = int(limit_match.group(1)) if limit_match else 5
        is_bottom = any(kw in q_lower for kw in ["bottom", "lowest", "smallest", "least", "min"])

        # Detect target numerical column (metric)
        metric_col = cls._match_column(q_lower, num_cols)

        # Detect target categorical / group column (dimension)
        # Check if the query has grouping intentions
        wants_grouping = any(ind in q_lower for ind in cls.GROUP_INDICATORS)
        
        candidate_cat_cols = [c for c in cat_cols if c != metric_col]
        group_col = cls._match_column(q_lower, candidate_cat_cols)

        # If user explicitly asked "which area", "which city", "which product", etc.
        # but group_col wasn't directly a column name, search using synonyms
        if not group_col and wants_grouping:
            group_col = cls._match_column(q_lower, [c for c in df.columns if c != metric_col])

        # If user did NOT specify grouping or a group column (e.g. "what is the total sales", "average price")
        if not group_col and not wants_grouping and metric_col:
            try:
                s = df[metric_col].dropna()
                val = 0.0
                agg_display = "Total"
                if agg_op == "max":
                    val = float(s.max())
                    agg_display = "Maximum"
                elif agg_op == "min":
                    val = float(s.min())
                    agg_display = "Minimum"
                elif agg_op == "mean":
                    val = float(s.mean())
                    agg_display = "Average"
                elif agg_op == "count":
                    val = float(len(s))
                    agg_display = "Count"
                elif agg_op == "median":
                    val = float(s.median())
                    agg_display = "Median"
                else: # sum
                    val = float(s.sum())
                    agg_display = "Total"

                if val >= 1_000_000:
                    formatted_val = f"{val/1_000_000:.2f}M"
                elif val >= 1_000:
                    formatted_val = f"{val:,.2f}"
                elif val.is_integer():
                    formatted_val = f"{int(val)}"
                else:
                    formatted_val = f"{val:.2f}"

                answer_text = f"The overall {agg_display.lower()} for **{metric_col}** is **{formatted_val}** across {len(s):,} entries."

                return {
                    "success": True,
                    "query": query,
                    "answer": answer_text,
                    "top_result": {
                        "category": metric_col,
                        "value": round(val, 2),
                        "formatted": formatted_val,
                        "group_column": None,
                        "metric_column": metric_col,
                        "operation": agg_display
                    },
                    "chart": None,
                    "table": [
                        {"Metric": metric_col, "Operation": agg_display, "Value": formatted_val, "Sample Size": f"{len(s):,}"}
                    ],
                    "interpretation": {
                        "detected_dimension": None,
                        "detected_metric": metric_col,
                        "aggregation": agg_display
                    }
                }
            except Exception:
                pass

        # If grouping is needed or implied (e.g. "which area had max sales")
        if not group_col and cat_cols:
            # Fallback group col
            group_col = cat_cols[0]
        if not metric_col and num_cols:
            preferred_nums = [c for c in num_cols if any(k in c.lower() for k in ["sale", "rev", "amount", "price", "val", "total", "qty", "profit"])]
            metric_col = preferred_nums[0] if preferred_nums else num_cols[0]

        # Execute Grouped Aggregation
        if group_col and (metric_col or agg_op == "count"):
            try:
                working_df = df.dropna(subset=[group_col] + ([metric_col] if metric_col else []))
                
                if agg_op == "count" and not metric_col:
                    grouped = working_df.groupby(group_col).size().reset_index(name="Count")
                    val_col = "Count"
                    agg_display = "Count"
                else:
                    if agg_op == "max":
                        grouped = working_df.groupby(group_col)[metric_col].max().reset_index()
                        agg_display = "Maximum"
                    elif agg_op == "min":
                        grouped = working_df.groupby(group_col)[metric_col].min().reset_index()
                        agg_display = "Minimum"
                    elif agg_op == "sum":
                        grouped = working_df.groupby(group_col)[metric_col].sum().reset_index()
                        agg_display = "Total"
                    elif agg_op == "count":
                        grouped = working_df.groupby(group_col)[metric_col].count().reset_index(name="Count")
                        val_col = "Count"
                        agg_display = "Count"
                    elif agg_op == "median":
                        grouped = working_df.groupby(group_col)[metric_col].median().reset_index()
                        agg_display = "Median"
                    else: # mean
                        grouped = working_df.groupby(group_col)[metric_col].mean().reset_index()
                        agg_display = "Average"
                    
                    val_col = "Count" if agg_op == "count" else metric_col

                # Sort
                grouped = grouped.sort_values(by=val_col, ascending=is_bottom)

                top_row = grouped.iloc[0] if len(grouped) > 0 else None
                top_entity = str(top_row[group_col]) if top_row is not None else "N/A"
                top_val = float(top_row[val_col]) if top_row is not None else 0.0

                # Slice top rows for table & chart
                top_n = max(limit, 8)
                chart_data = grouped.head(top_n).to_dict(orient="records")

                if top_val >= 1_000_000:
                    formatted_val = f"{top_val/1_000_000:.2f}M"
                elif top_val >= 1_000:
                    formatted_val = f"{top_val:,.2f}"
                elif top_val.is_integer():
                    formatted_val = f"{int(top_val)}"
                else:
                    formatted_val = f"{top_val:.2f}"

                answer_text = (
                    f"**{top_entity}** had the {'lowest' if is_bottom else 'highest'} {agg_display.lower()} "
                    f"**{metric_col or 'records'}** with **{formatted_val}**."
                )

                return {
                    "success": True,
                    "query": query,
                    "answer": answer_text,
                    "top_result": {
                        "category": top_entity,
                        "value": round(top_val, 2),
                        "formatted": formatted_val,
                        "group_column": group_col,
                        "metric_column": metric_col or val_col,
                        "operation": agg_display
                    },
                    "chart": {
                        "type": "bar",
                        "x": [str(r[group_col]) for r in chart_data],
                        "y": [round(float(r[val_col]), 2) for r in chart_data],
                        "x_label": group_col,
                        "y_label": f"{agg_display} of {metric_col or val_col}",
                        "title": f"{agg_display} {metric_col or 'Records'} by {group_col}"
                    },
                    "table": [
                        {group_col: str(r[group_col]), (f"{agg_display} {metric_col or val_col}"): round(float(r[val_col]), 2)}
                        for r in chart_data
                    ],
                    "interpretation": {
                        "detected_dimension": group_col,
                        "detected_metric": metric_col,
                        "aggregation": agg_display,
                        "order": "Lowest" if is_bottom else "Highest"
                    }
                }
            except Exception as e:
                pass

        # Fallback general answer
        return {
            "success": True,
            "query": query,
            "answer": f"Found {len(df):,} records across {len(df.columns)} attributes.",
            "top_result": {
                "category": "Total Records",
                "value": len(df),
                "formatted": f"{len(df):,}",
                "operation": "Count"
            },
            "chart": None,
            "table": [
                {"Column": col, "Data Type": str(df[col].dtype), "Unique Values": int(df[col].nunique())}
                for col in df.columns[:10]
            ],
            "interpretation": {
                "detected_dimension": None,
                "detected_metric": None,
                "aggregation": "Overview"
            }
        }
