import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.db.database import Base, engine
from app.config.settings import settings
from app.routes import auth, certificates, organizations
import app.models.user
import app.models.organization
import app.models.certificate

limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app):
    print("Starting Cyphire API...")
    Base.metadata.create_all(bind=engine)
    print("Ready.")
    yield

app = FastAPI(title="Cyphire API", version="1.0.0", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    settings.FRONTEND_URL,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("storage", exist_ok=True)
app.mount("/storage", StaticFiles(directory="storage"), name="storage")

app.include_router(auth.router)
app.include_router(certificates.router)
app.include_router(organizations.router)

@app.get("/")
def root():
    return {"status": "running"}

