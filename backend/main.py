from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import upload, dataset

app = FastAPI(
    title="DataPilot AutoML Backend API",
    description="Automated Data Analytics & Universal Machine Learning Platform Engine - Phase 2 Dataset Services",
    version="2.0.0"
)

# Enable CORS for frontend Vite development & preview origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Phase 2 endpoint routers under /api/v1
app.include_router(upload.router, prefix="/api/v1")
app.include_router(dataset.router, prefix="/api/v1")

# Also register without prefix so /upload and /dataset/ preview work consistently
app.include_router(upload.router)
app.include_router(dataset.router)

@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "service": "DataPilot API Engine",
        "phase": "Phase 2 - Dataset Upload & Backend Integration",
        "version": "2.0.0"
    }
