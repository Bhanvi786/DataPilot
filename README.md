# DataPilot — AI-Powered Automated Data Analytics Platform

> **Turn Raw Data Into Intelligence.**

DataPilot is an automated data analytics platform designed to bridge raw data and decision-grade intelligence. Built on a modular **FastAPI** backend (Python / Pandas / NumPy) and a **React** frontend (Vite / Tailwind CSS / Lucide React / Axios).

---

## 🚀 Features

### Phase 1: Ingestion & Dynamic Profiling
- **CSV & Excel Upload**: Fast multipart file parsing with multi-encoding fallback (`utf-8`, `utf-8-sig`, `latin1`, `cp1252`, `iso-8859-1`).
- **Dynamic KPI Metrics**: Automatic calculation of Total Rows, Total Columns, Missing Values, and Duplicate Rows.
- **Interactive Dataset Preview**: View first N records with interactive row limit selector.
- **Column Schema Intelligence**: Profiles raw data types, null counts/percentages, and cardinality.
- **Session Management**: Persistent active dataset retained across page routing.

### Phase 2: Dynamic Data Processing & Automated Cleaning Engine
- **Data Profiling & Quality Scoring**: Real-time 0–100 health score, non-null counts, semantic type classification (Integer, Float, String, Boolean, Datetime, Categorical), date candidates, and constant column detection.
- **Missing Value Handling**: Column-wise imputation (Mean, Median, Mode, User-defined Constant) or Row Dropping.
- **Duplicate Management**: Identifies and previews duplicate clusters; removes duplicate rows with user confirmation.
- **Data Type Casting**: Explicit safe casting with anomaly detection.
- **Interquartile Range (IQR) Outlier Mitigation**: Automatic detection with $[Q_1 - 1.5 \times IQR, Q_3 + 1.5 \times IQR]$ thresholding; user-configurable Capping (`clip`) or Row Removal.
- **Data Standardization**: Whitespace trimming, converting blank strings to NaNs, text casing formatting, and ISO-8601 date parsing.
- **Version Management & Non-Destructive Workflow**:
  - Original dataset is **never overwritten**.
  - **Preview Changes**: Simulates transformations in-memory before committing.
  - **Reset**: Revert cleaned states back to the original upload at any time.
  - **Export Cleaned Data**: Download cleaned datasets as CSV or Excel (`.xlsx`).

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
├── streamlit_backup/           # Complete backup of original working Streamlit app
│   ├── app.py
│   ├── modules/
│   ├── assets/
│   ├── sample_data/
│   └── requirements.txt
│
├── frontend/                   # Modern React.js + Vite Frontend
│   ├── src/
│   │   ├── components/         # KPICards, UploadBox, DatasetPreviewTable, ColumnInfoTable
│   │   ├── pages/              # HomePage, UploadPage, OverviewPage, CleaningPage, SettingsPage, AboutPage
│   │   ├── layouts/            # Layout (Sidebar, TopHeader)
│   │   ├── context/            # DatasetContext (Session State & localStorage sync)
│   │   ├── services/           # Axios API client (health, upload, preview, clean, export)
│   │   ├── App.jsx             # React Router setup
│   │   └── main.jsx            # React root mount
│   ├── package.json
│   └── vite.config.js
│
├── backend/                    # High-Performance FastAPI Backend
│   ├── main.py                 # FastAPI application & CORS configuration
│   ├── config.py               # Settings & storage configuration
│   ├── requirements.txt        # Backend dependencies
│   ├── routes/                 # APIRouter (/health, /upload, /dataset/{id}/clean, etc.)
│   ├── services/               # Reusable Modular Services:
│   │   ├── data_profiler.py    # Schema & semantic classification
│   │   ├── missing_value_handler.py # Mean, Median, Mode, Constant imputation
│   │   ├── duplicate_handler.py# Duplicate inspection & removal
│   │   ├── datatype_handler.py # Safe type casting
│   │   ├── outlier_handler.py  # IQR detection & capping
│   │   ├── data_standardizer.py# Whitespace & empty string handling
│   │   ├── cleaning_engine.py  # Pipeline orchestration & version control
│   │   └── dataset_service.py  # Core dataset ingest & persistence
│   └── storage/                # Sanitized temporary dataset storage
│
├── sample_data/                # Verified test datasets (CSV and XLSX)
│   ├── retail_sales.csv
│   ├── retail_sales.xlsx
│   ├── student_performance.csv
│   └── employee_records.csv
│
├── app.py                      # Original Streamlit entry point (still fully runnable)
└── README.md
```

---

## 🚀 Running the Application

### Running with Two Separate Terminals

#### Terminal 1 — Backend (FastAPI):
```bash
cd backend
python3 -m uvicorn main:app --reload --port 8000
```
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

#### Terminal 2 — Frontend (React):
```bash
cd frontend
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
