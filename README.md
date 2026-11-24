# DataPilot — AI-Powered Automated Data Analytics Platform

> **Turn Raw Data Into Intelligence.**

DataPilot is an automated data analytics platform designed to bridge raw data and decision-grade intelligence. Built on a clean full-stack architecture with a **FastAPI backend** (Python / Pandas / NumPy) and a **React frontend** (Vite / Tailwind CSS / Lucide React / React-Plotly).

---

## 🚀 Platform Capabilities

### Phase 1: Ingestion & Dynamic Profiling
- **CSV & Excel Upload**: Fast multipart file parsing with multi-encoding fallback (`utf-8`, `utf-8-sig`, `latin1`, `cp1252`, `iso-8859-1`).
- **Dynamic KPI Metrics**: Automatic calculation of Total Rows, Total Columns, Missing Values, and Duplicate Rows.
- **Interactive Dataset Preview**: View first N records with interactive row limit selector.
- **Column Schema Intelligence**: Profiles raw data types, null counts/percentages, and cardinality.
- **Session Management**: Persistent active dataset retained across page routing.

### Phase 2: Dynamic Data Processing & Automated Cleaning Engine
- **Data Profiling & Quality Scoring**: Real-time 0–100 health score, semantic type classification (Integer, Float, String, Boolean, Datetime, Categorical), date candidates, and constant column detection.
- **Missing Value Handling**: Column-wise imputation (Mean, Median, Mode, User-defined Constant) or Row Dropping.
- **Duplicate Management**: Identifies and previews duplicate clusters; removes duplicate rows with user confirmation.
- **Data Type Casting**: Explicit safe casting with anomaly detection.
- **Interquartile Range (IQR) Outlier Mitigation**: Automatic detection with $[Q_1 - 1.5 \times IQR, Q_3 + 1.5 \times IQR]$ thresholding; user-configurable Capping (`clip`) or Row Removal.
- **Data Standardization**: Whitespace trimming, converting blank strings to NaNs, text casing formatting, and ISO-8601 date parsing.
- **Non-Destructive Workflow**: Original dataset is never modified. Cleaned copies exist separately and can be previewed, applied, reset, or downloaded as CSV/Excel.

### Phase 3: Automated Exploratory Data Analysis (EDA) & Intelligent Visualizations
- **Automatic Role Detection**: Identifies numerical, categorical, boolean, datetime, identifier, and constant columns without hardcoded column names.
- **Comprehensive Descriptive Statistics**: Mean, median, mode, standard deviation, variance, min/max, quartiles, skewness, and kurtosis.
- **Numerical Distributions**: Auto-generated Plotly Histograms and Boxplots for every numerical feature.
- **Categorical Proportions**: Auto-generated Donut/Pie and Bar charts with automatic tail grouping for high cardinality.
- **Bivariate Correlation Analysis**: Interactive Pearson / Spearman heatmaps with automatic detection of strong positive ($r \ge 0.5$) and negative ($r \le -0.5$) associations.
- **Chronological Time-Series Trends**: Aggregated time-series trend lines (Daily, Weekly, Monthly) with trend direction indicators.
- **Automated Rule-Based Insights**: Real mathematical observations on distribution skewness, class imbalances, missing data concentrations, and correlations without external LLM dependencies.
- **Custom Visualization Builder**: Flexible interactive chart builder supporting Bar, Line, Scatter, Histogram, Box, and Donut charts with custom aggregations.

---

## 🎨 UI/UX Theme Specifications

DataPilot features a dark green SaaS theme:
- **Main Background**: `#080D0C`
- **Sidebar Background**: `#0D1512`
- **Card Background**: `#14231E`
- **Primary Accent**: `#20C997` (Emerald)
- **Secondary Accent**: `#6EE7B7` (Mint)
- **Borders & Dividers**: `#244536`
- **Primary Text**: `#FFFFFF`
- **Secondary Text**: `#A7B5AE`

---

## 📂 Project Architecture

```
DataPilot/
├── frontend/                   # Modern React.js + Vite Frontend
│   ├── src/
│   │   ├── components/         # KPICards, UploadBox, DatasetPreviewTable, ColumnInfoTable
│   │   ├── pages/              # HomePage, UploadPage, OverviewPage, CleaningPage, EDAPage, SettingsPage, AboutPage
│   │   ├── layouts/            # Layout (Sidebar, TopHeader)
│   │   ├── context/            # DatasetContext (Session State & localStorage sync)
│   │   ├── services/           # Axios API client (health, upload, preview, clean, eda, export)
│   │   ├── App.jsx             # React Router setup
│   │   └── main.jsx            # React root mount
│   ├── package.json
│   └── vite.config.js
│
├── backend/                    # High-Performance FastAPI Backend
│   ├── main.py                 # FastAPI application & CORS configuration
│   ├── config.py               # Settings & storage configuration
│   ├── requirements.txt        # Backend dependencies
│   ├── routes/
│   │   ├── dataset_routes.py   # Ingestion, cleaning & export endpoints
│   │   └── eda_routes.py       # Phase 3 Automated EDA endpoints
│   ├── services/
│   │   ├── eda/                # Phase 3 Modular EDA Services:
│   │   │   ├── column_detector.py      # Numerical, Categorical, Datetime, ID separation
│   │   │   ├── statistical_analyzer.py # Descriptive statistics calculations
│   │   │   ├── numerical_analyzer.py   # Histograms & Boxplot distributions
│   │   │   ├── categorical_analyzer.py # Bar & Donut chart frequency proportions
│   │   │   ├── correlation_analyzer.py # Pearson / Spearman heatmap & matrices
│   │   │   ├── time_series_analyzer.py # Chronological trend aggregation
│   │   │   ├── relationship_analyzer.py# Bivariate interaction plots
│   │   │   ├── insight_generator.py    # Statistical observation generation
│   │   │   ├── visualization_engine.py # Custom Plotly chart builder
│   │   │   └── eda_engine.py           # EDA orchestrator
│   │   └── cleaning_engine.py  # Cleaning pipeline & version manager
│   └── storage/                # Sanitized temporary dataset storage
│
├── sample_data/                # Verified test datasets (CSV and XLSX)
│   ├── retail_sales.csv
│   ├── retail_sales.xlsx
│   ├── student_performance.csv
│   └── employee_records.csv
│
├── assets/                     # Brand logos (SVG and PNG)
├── run.sh                      # Single command runner for local dev
├── .gitignore
└── README.md
```

---

## 🚀 How to Run the Application

### Running with Two Separate Terminals

#### Terminal 1 — Backend (FastAPI):
```bash
cd backend
python3 -m pip install -r requirements.txt
python3 -m uvicorn main:app --reload --port 8000
```
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

#### Terminal 2 — Frontend (React):
```bash
cd frontend
npm install
npm run dev
```
- **React Frontend**: [http://localhost:5173](http://localhost:5173)

---

### Running with Single Command:
```bash
./run.sh
```

---

## ⚡ API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Backend status & system health check |
| `POST` | `/api/upload` | Multipart CSV/XLSX ingest, KPIs, DataFrame caching |
| `GET` | `/api/dataset/{id}` | Retrieves metadata and KPIs for a stored dataset |
| `GET` | `/api/dataset/{id}/preview` | Returns first N rows (uses cleaned version if available) |
| `GET` | `/api/dataset/{id}/columns` | Returns column schema & missing value statistics |
| `GET` | `/api/dataset/{id}/profile` | Comprehensive profiling (missing, duplicates, outliers, types) |
| `GET` | `/api/dataset/{id}/quality` | Quality health score (0-100) and attention columns |
| `POST` | `/api/dataset/{id}/clean/preview` | In-memory simulation of proposed transformations |
| `POST` | `/api/dataset/{id}/clean/apply` | Applies cleaning pipeline to separate cleaned version |
| `GET` | `/api/dataset/{id}/clean/summary` | Before-and-after comparison and transformation audit log |
| `POST` | `/api/dataset/{id}/clean/reset` | Resets active dataset state back to original upload |
| `GET` | `/api/dataset/{id}/export` | Downloads cleaned or original data as CSV or Excel |
| `GET` | `/api/dataset/{id}/eda/overview` | Column type counts & total generated chart count |
| `GET` | `/api/dataset/{id}/eda/statistics` | Descriptive statistics table across all feature types |
| `GET` | `/api/dataset/{id}/eda/numerical` | Numerical distribution data for Histograms & Boxplots |
| `GET` | `/api/dataset/{id}/eda/categorical` | Categorical frequency distributions for Bar & Donut charts |
| `GET` | `/api/dataset/{id}/eda/correlation` | Pearson / Spearman correlation matrix & strong pairs |
| `GET` | `/api/dataset/{id}/eda/timeseries` | Temporal aggregation data across date features |
| `GET` | `/api/dataset/{id}/eda/insights` | Statistically backed mathematical observations |
| `POST` | `/api/dataset/{id}/eda/custom-chart` | User-configured Plotly chart builder |
