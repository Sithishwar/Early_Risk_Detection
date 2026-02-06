from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.detect import router as detect_router
from app.api.forecast import router as forecast_router

app = FastAPI(
    title="Crowd Risk ML Service",
    description="Computer vision and forecasting microservice",
    version="1.0.0",
)

# CORS configuration (Node backend will call this service)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(detect_router)
app.include_router(forecast_router)

# Health check
@app.get("/health")
def health_check():
    return {"status": "ML service running"}
