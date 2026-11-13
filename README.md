# DataPilot – Automated Data Analytics & Machine Learning Platform

This repository is split into two independent services:

```
DataPilot/
├── frontend/    # React + Vite + Tailwind CSS dashboard UI
└── backend/     # FastAPI AutoML backend (Phase 2 integration)
```

---

## 1. Frontend Setup (`frontend/`)

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at: **`http://localhost:3000`**

Available scripts:
- `npm run dev`: Starts the Vite development server.
- `npm run build`: Bundles the production build.
- `npm run preview`: Previews the production build locally.

---

## 2. Backend Setup (`backend/`)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API docs are available at: **`http://localhost:8000/docs`**

