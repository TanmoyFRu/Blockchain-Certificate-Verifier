from fastapi import FastAPI
from app.db.database import Base, engine
from app.routes import auth, certificates, organizations
import app.models.user
import app.models.organization
import app.models.certificate

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Blockchain Certificate Verifier", version="1.0.0")

app.include_router(auth.router)
app.include_router(certificates.router)
app.include_router(organizations.router)

@app.get("/")
def root():
    return {"status": "running"}
