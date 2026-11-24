import os
import streamlit as st
import pandas as pd
from modules.styles import CUSTOM_CSS
from modules.data_loader import (
    load_dataset,
    get_dataset_kpis,
    get_column_details,
    get_dataset_metadata,
)

# Page configuration
st.set_page_config(
    page_title="DataPilot — Turn Raw Data Into Intelligence",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Inject modern dark-theme SaaS styles
st.markdown(CUSTOM_CSS, unsafe_allow_html=True)

# Initialize Session State
if "df" not in st.session_state:
    st.session_state.df = None
if "uploaded_file_name" not in st.session_state:
    st.session_state.uploaded_file_name = None
if "uploaded_file_size" not in st.session_state:
    st.session_state.uploaded_file_size = None
if "current_page" not in st.session_state:
    st.session_state.current_page = "Home"


# --- Sidebar Navigation & Branding ---
with st.sidebar:
    st.markdown(
        """
        <div style="display: flex; align-items: center; gap: 12px; padding: 10px 0 16px 0;">
            <div style="background: linear-gradient(135deg, #20C997 0%, #14231E 100%); 
                        width: 42px; height: 42px; border-radius: 10px; display: flex; 
                        align-items: center; justify-content: center; border: 1px solid #20C997;">
                <span style="font-size: 22px;">⚡</span>
            </div>
            <div>
                <div style="font-size: 1.35rem; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">DataPilot</div>
                <div style="font-size: 0.72rem; color: #6EE7B7; font-weight: 600;">Automated Data Intelligence</div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.markdown("<div style='height: 1px; background-color: #244536; margin: 8px 0 16px 0;'></div>", unsafe_allow_html=True)

    # Navigation menu
    nav_options = [
        "🏠  Home",
        "📤  Upload Dataset",
        "📊  Data Overview",
        "⚙️  Settings",
        "ℹ️  About DataPilot"
    ]
    
    # Map index to current page
    nav_map = {
        "🏠  Home": "Home",
        "📤  Upload Dataset": "Upload Dataset",
        "📊  Data Overview": "Data Overview",
        "⚙️  Settings": "Settings",
        "ℹ️  About DataPilot": "About DataPilot"
    }
    
    # Reverse map for default index
    reverse_map = {v: k for k, v in nav_map.items()}
    default_index = list(reverse_map.keys()).index(st.session_state.current_page) if st.session_state.current_page in reverse_map else 0

    selected_nav = st.radio(
        "Navigation",
        options=nav_options,
        index=default_index,
        label_visibility="collapsed"
    )
    st.session_state.current_page = nav_map[selected_nav]

    st.markdown("<div style='height: 1px; background-color: #244536; margin: 24px 0 16px 0;'></div>", unsafe_allow_html=True)

    # Active dataset status in sidebar
    if st.session_state.df is not None:
        st.markdown(
            f"""
            <div style="background: #14231E; border: 1px solid #244536; border-radius: 10px; padding: 12px 14px;">
                <div style="font-size: 0.72rem; color: #A7B5AE; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Active Dataset</div>
                <div style="font-size: 0.88rem; font-weight: 700; color: #6EE7B7; margin-top: 4px; word-break: break-all;">
                    📄 {st.session_state.uploaded_file_name}
                </div>
                <div style="font-size: 0.76rem; color: #A7B5AE; margin-top: 4px;">
                    {st.session_state.df.shape[0]:,} rows • {st.session_state.df.shape[1]} columns
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )
    else:
        st.markdown(
            """
            <div style="background: rgba(20, 35, 30, 0.4); border: 1px dashed #244536; border-radius: 10px; padding: 12px 14px; text-align: center;">
                <div style="font-size: 0.78rem; color: #A7B5AE;">No dataset loaded</div>
            </div>
            """,
            unsafe_allow_html=True
        )

    # Sidebar footer
    st.markdown(
        """
        <div style="position: fixed; bottom: 18px; left: 16px; font-size: 0.72rem; color: #A7B5AE;">
            v1.0.0-phase1 &bull; <span style="color: #20C997;">Online</span>
        </div>
        """,
        unsafe_allow_html=True,
    )


# --- Top Header Bar ---
project_name = st.session_state.uploaded_file_name if st.session_state.uploaded_file_name else "New Analytics Project"
st.markdown(
    f"""
    <div class="top-header">
        <div>
            <div class="top-header-title">
                <span>⚡</span>
                <span>DataPilot Workspace</span>
            </div>
            <div class="top-header-subtitle">
                Project: <strong style="color: #FFFFFF;">{project_name}</strong>
            </div>
        </div>
        <div>
            <div class="status-badge">
                <div class="status-dot"></div>
                SYSTEM READY
            </div>
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)


# Helper function to render dataset preview section
def render_dataset_preview():
    df = st.session_state.df
    file_name = st.session_state.uploaded_file_name
    file_size = st.session_state.uploaded_file_size or "N/A"

    if df is None:
        st.info("No dataset is currently uploaded. Please upload a CSV or Excel file to get started.")
        return

    # Dynamic KPI calculation
    kpis = get_dataset_kpis(df)
    
    st.markdown("### 📊 Dataset Key Metrics")
    
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.markdown(
            f"""
            <div class="kpi-card">
                <div class="kpi-label">Total Rows</div>
                <div class="kpi-value">{kpis['total_rows']:,}</div>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with col2:
        st.markdown(
            f"""
            <div class="kpi-card">
                <div class="kpi-label">Total Columns</div>
                <div class="kpi-value kpi-accent">{kpis['total_columns']:,}</div>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with col3:
        st.markdown(
            f"""
            <div class="kpi-card">
                <div class="kpi-label">Missing Values</div>
                <div class="kpi-value">{kpis['missing_values']:,}</div>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with col4:
        st.markdown(
            f"""
            <div class="kpi-card">
                <div class="kpi-label">Duplicate Rows</div>
                <div class="kpi-value">{kpis['duplicate_rows']:,}</div>
            </div>
            """,
            unsafe_allow_html=True,
        )

    st.markdown("<div style='height: 20px;'></div>", unsafe_allow_html=True)

    # Dataset Metadata Cards
    st.markdown("### ℹ️ Dataset File Information")
    meta_c1, meta_c2, meta_c3, meta_c4 = st.columns(4)
    with meta_c1:
        st.markdown(
            f"""
            <div class="meta-box">
                <span style="font-size: 1.4rem;">📄</span>
                <div>
                    <div style="font-size: 0.72rem; color: #A7B5AE; text-transform: uppercase; font-weight: 600;">File Name</div>
                    <div style="font-size: 0.92rem; font-weight: 700; color: #FFFFFF; word-break: break-all;">{file_name}</div>
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )
    with meta_c2:
        st.markdown(
            f"""
            <div class="meta-box">
                <span style="font-size: 1.4rem;">💾</span>
                <div>
                    <div style="font-size: 0.72rem; color: #A7B5AE; text-transform: uppercase; font-weight: 600;">File Size</div>
                    <div style="font-size: 0.92rem; font-weight: 700; color: #FFFFFF;">{file_size}</div>
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )
    with meta_c3:
        st.markdown(
            f"""
            <div class="meta-box">
                <span style="font-size: 1.4rem;">📈</span>
                <div>
                    <div style="font-size: 0.72rem; color: #A7B5AE; text-transform: uppercase; font-weight: 600;">Records</div>
                    <div style="font-size: 0.92rem; font-weight: 700; color: #6EE7B7;">{kpis['total_rows']:,} records</div>
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )
    with meta_c4:
        st.markdown(
            f"""
            <div class="meta-box">
                <span style="font-size: 1.4rem;">🏷️</span>
                <div>
                    <div style="font-size: 0.72rem; color: #A7B5AE; text-transform: uppercase; font-weight: 600;">Features</div>
                    <div style="font-size: 0.92rem; font-weight: 700; color: #6EE7B7;">{kpis['total_columns']:,} columns</div>
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )

    st.markdown("<div style='height: 24px;'></div>", unsafe_allow_html=True)

    # Interactive Table Preview
    st.markdown("### 🔍 Dataset Preview")
    rows_to_show = st.slider("Select number of rows to preview:", min_value=5, max_value=50, value=15, step=5)
    st.dataframe(df.head(rows_to_show), use_container_width=True)

    st.markdown("<div style='height: 24px;'></div>", unsafe_allow_html=True)

    # Column Details
    st.markdown("### 📋 Column Attributes & Profiles")
    col_details_df = get_column_details(df)
    st.dataframe(col_details_df, use_container_width=True, hide_index=True)


# Helper function to render file upload component
def render_upload_component():
    st.markdown(
        """
        <div style="background: #14231E; border: 1px solid #244536; border-radius: 14px; padding: 22px; margin-bottom: 20px;">
            <div style="font-size: 1.15rem; font-weight: 700; color: #FFFFFF; margin-bottom: 4px;">Upload Your Dataset</div>
            <div style="font-size: 0.88rem; color: #A7B5AE;">
                Drag and drop your spreadsheet or comma-separated file below. Supported file types: <strong>.csv, .xlsx</strong>
            </div>
        </div>
        """,
        unsafe_allow_html=True
    )

    uploaded_file = st.file_uploader(
        "Choose a dataset file",
        type=["csv", "xlsx", "xls"],
        label_visibility="collapsed",
        key="dataset_uploader",
    )

    if uploaded_file is not None:
        # Load and validate
        with st.spinner("Processing dataset dynamically..."):
            df, error = load_dataset(uploaded_file)
            
            if error:
                st.error(f"❌ {error}")
            else:
                metadata = get_dataset_metadata(uploaded_file, df)
                st.session_state.df = df
                st.session_state.uploaded_file_name = metadata["file_name"]
                st.session_state.uploaded_file_size = metadata["file_size"]
                
                st.success(f"✅ Successfully loaded **{metadata['file_name']}** ({metadata['file_size']}) with {metadata['records']:,} rows and {metadata['features']} features!")


# --- Page Routing ---

if st.session_state.current_page == "Home":
    # Hero Section
    st.markdown(
        """
        <div class="hero-card">
            <div class="hero-title">Welcome to DataPilot</div>
            <div class="hero-subtitle">Your intelligent data analytics companion.</div>
            <div class="hero-desc">
                DataPilot streamlines your end-to-end data workflows. Upload any raw CSV or Excel dataset to automatically uncover data shapes, inspect schema properties, examine missing values, and prepare for automated analytics.
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # Upload section directly accessible on Home
    render_upload_component()

    st.markdown(
        """
        <div style="margin: 12px 0 28px 0; padding: 12px 18px; background: rgba(32, 201, 151, 0.05); border-left: 3px solid #20C997; border-radius: 6px;">
            <span style="font-size: 0.88rem; color: #A7B5AE;">
                💡 <strong>What happens after uploading:</strong> Your file is parsed in-memory, key quality metrics (missing values, duplicates) are dynamically calculated, and an interactive schema preview is generated instantly.
            </span>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # Feature Cards
    st.markdown("### Platform Capabilities")
    f_col1, f_col2, f_col3 = st.columns(3)

    with f_col1:
        st.markdown(
            """
            <div class="feature-card">
                <div class="feature-icon-wrapper">⚡</div>
                <div class="feature-title">Automated Data Analysis</div>
                <div class="feature-desc">
                    Comprehensive exploratory data analysis, statistical summaries, correlation profiling, and automated anomaly detection.
                </div>
                <span class="badge-tag">Planned for Phase 2</span>
            </div>
            """,
            unsafe_allow_html=True,
        )

    with f_col2:
        st.markdown(
            """
            <div class="feature-card">
                <div class="feature-icon-wrapper">📊</div>
                <div class="feature-title">Interactive Visualizations</div>
                <div class="feature-desc">
                    Dynamic Plotly dashboards, custom charting engines, distribution plots, and executive visual metrics on demand.
                </div>
                <span class="badge-tag">Planned for Phase 2</span>
            </div>
            """,
            unsafe_allow_html=True,
        )

    with f_col3:
        st.markdown(
            """
            <div class="feature-card">
                <div class="feature-icon-wrapper">🤖</div>
                <div class="feature-title">Machine Learning Predictions</div>
                <div class="feature-desc">
                    Automated model selection, feature engineering, classification, regression pipelines, and predictive intelligence.
                </div>
                <span class="badge-tag">Planned for Phase 3</span>
            </div>
            """,
            unsafe_allow_html=True,
        )

    # If dataset is loaded, show preview right below
    if st.session_state.df is not None:
        st.markdown("<div style='height: 32px;'></div>", unsafe_allow_html=True)
        render_dataset_preview()


elif st.session_state.current_page == "Upload Dataset":
    st.markdown("## 📤 Upload Dataset")
    st.markdown("Upload your tabular data file (CSV or XLSX). DataPilot dynamically verifies file structure, character encoding, and content.")
    
    render_upload_component()

    if st.session_state.df is not None:
        st.markdown("<div style='height: 24px;'></div>", unsafe_allow_html=True)
        render_dataset_preview()


elif st.session_state.current_page == "Data Overview":
    st.markdown("## 📊 Data Overview & Schema Intelligence")
    render_dataset_preview()


elif st.session_state.current_page == "Settings":
    st.markdown("## ⚙️ Platform Settings")
    st.markdown("Configure workspace preferences and local analytics runtime.")

    st.markdown(
        """
        <div style="background: #14231E; border: 1px solid #244536; border-radius: 14px; padding: 24px; max-width: 680px;">
            <h4 style="color: #6EE7B7; margin-bottom: 12px;">Data Engine Preferences</h4>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #244536;">
                <div>
                    <strong>Preview Sample Limit</strong><br>
                    <span style="font-size: 0.82rem; color: #A7B5AE;">Maximum rows retrieved during interactive table browsing</span>
                </div>
                <span style="color: #20C997; font-weight: 600;">50 rows</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #244536;">
                <div>
                    <strong>Encoding Detection Strategy</strong><br>
                    <span style="font-size: 0.82rem; color: #A7B5AE;">Fallback hierarchy for international characters</span>
                </div>
                <span style="color: #20C997; font-weight: 600;">UTF-8 / Latin-1</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
                <div>
                    <strong>Dark Theme Accent</strong><br>
                    <span style="font-size: 0.82rem; color: #A7B5AE;">Primary color palette applied across analytics components</span>
                </div>
                <span style="color: #20C997; font-weight: 600;">Emerald (#20C997)</span>
            </div>
        </div>
        """,
        unsafe_allow_html=True
    )


elif st.session_state.current_page == "About DataPilot":
    st.markdown("## ℹ️ About DataPilot")
    st.markdown(
        """
        <div class="hero-card">
            <div class="hero-title" style="font-size: 1.8rem;">DataPilot Platform</div>
            <div class="hero-subtitle">Turn Raw Data Into Intelligence.</div>
            <div class="hero-desc">
                DataPilot is an AI-powered automated data analytics platform designed to bridge the gap between raw data collection and actionable business intelligence.
            </div>
            <div style="margin-top: 20px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                <div style="background: #080D0C; border: 1px solid #244536; border-radius: 10px; padding: 14px;">
                    <div style="color: #6EE7B7; font-weight: 700; font-size: 0.88rem;">Phase 1 (Active)</div>
                    <div style="color: #A7B5AE; font-size: 0.78rem; margin-top: 4px;">Dynamic CSV & Excel ingest, KPI profiling, table & schema browser.</div>
                </div>
                <div style="background: #080D0C; border: 1px solid #244536; border-radius: 10px; padding: 14px;">
                    <div style="color: #A7B5AE; font-weight: 700; font-size: 0.88rem;">Phase 2 (Upcoming)</div>
                    <div style="color: #A7B5AE; font-size: 0.78rem; margin-top: 4px;">Automated EDA, distribution plots, correlation heatmaps, Plotly engine.</div>
                </div>
                <div style="background: #080D0C; border: 1px solid #244536; border-radius: 10px; padding: 14px;">
                    <div style="color: #A7B5AE; font-weight: 700; font-size: 0.88rem;">Phase 3 (Upcoming)</div>
                    <div style="color: #A7B5AE; font-size: 0.78rem; margin-top: 4px;">Predictive machine learning, automated model evaluation, executive reports.</div>
                </div>
            </div>
        </div>
        """,
        unsafe_allow_html=True
    )
