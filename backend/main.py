from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routes.dataset_routes import router as dataset_router
from routes.eda_routes import router as eda_router
from routes.dashboard_routes import router as dashboard_router

app = FastAPI(
    title="DataPilot API",
    description="Automated Data Analytics Platform API — FastAPI Backend",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration for React frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows local dev from 5173 / 3000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes under /api
app.include_router(dataset_router, prefix=settings.API_PREFIX)
app.include_router(eda_router, prefix=settings.API_PREFIX)
app.include_router(dashboard_router, prefix=settings.API_PREFIX)


@app.get("/")
def root():
    return {
        "message": "Welcome to DataPilot API. Explore docs at /docs",
        "status": "online",
        "phase": "Phase 3 (EDA & Intelligent Visualization Active)"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
