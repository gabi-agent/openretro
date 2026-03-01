from fastapi import FastAPI
from .routers import sessions, cards, comments
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(
    title="OpenRetro API",
    description="API for OpenRetro - a retrospective tool",
    version="1.0.0",
)

# Include API routers
app.include_router(sessions.router, prefix="/api")
app.include_router(cards.router, prefix="/api")
app.include_router(comments.router, prefix="/api")

# Serve static files for frontend
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")

@app.on_event("startup")
async def startup_event():
    # Create all database tables if they don't exist
    from .database import engine, Base
    Base.metadata.create_all(bind=engine)
    print("Database tables checked/created.")
