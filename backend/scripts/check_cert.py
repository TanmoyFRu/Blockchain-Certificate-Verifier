from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.database import Base
from app.models.organization import Organization
from app.models.user import User
from app.models.certificate import Certificate
from app.config.settings import settings

# This import order is crucial to register all models with Base
# Organization needs to be imported before User and Certificate because they have ForeignKeys

print(f"Connecting to DB: {settings.DATABASE_URL.lower()}")

engine = create_engine(settings.DATABASE_URL.lower())
Session = sessionmaker(bind=engine)
session = Session()

try:
    certs = session.query(Certificate).all()
    print(f"Total Certs: {len(certs)}")
    for cert in certs:
        print(f"ID: {cert.id}, Hash: {cert.cert_hash}, Owner: {cert.owner_name}")
        print(f"  Tx Hash: {cert.tx_hash}")
except Exception as e:
    print(f"Error querying certificates: {e}")
finally:
    session.close()
