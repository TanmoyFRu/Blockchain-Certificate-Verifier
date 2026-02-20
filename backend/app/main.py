from fastapi import FastAPI
from app.db.database import Base, engine
from app.routes import auth, certificates, organizations
import app.models.user
import app.models.organization
import app.models.certificate

app = FastAPI(title="Cyphire API", version="1.0.0")

@app.on_event("startup")
def startup_event():
    print("Starting Cyphire API...")
    try:
        Base.metadata.create_all(bind=engine)
        print("Database initialized.")
    except Exception as e:
        print(f"Database Initialization Error: {e}")

from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

from fastapi.staticfiles import StaticFiles
import os

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
