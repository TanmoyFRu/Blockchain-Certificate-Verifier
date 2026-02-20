
import sys
import os
import bcrypt

# Monkey patch for passlib + bcrypt compatibility
if not hasattr(bcrypt, '__about__'):
    bcrypt.__about__ = type('about', (object,), {'__version__': bcrypt.__version__})

# Add the parent directory to sys.path to resolve 'app' modules
# Adjust path assuming run from backend/ directory
if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.dirname(current_dir)
    sys.path.append(backend_dir)

from app.db.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.organization import Organization
from app.services.auth_service import hash_password

def init_data():
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Create Organization
        org_name = "CertVerifier Demo Org"
        org = db.query(Organization).filter(Organization.name == org_name).first()
        if not org:
            print(f"Creating organization: {org_name}")
            org = Organization(name=org_name, wallet_address="0x0000000000000000000000000000000000000000")
            db.add(org)
            db.commit()
            db.refresh(org)
        else:
            print(f"Organization '{org_name}' already exists.")

        # Create User
        email = "admin@certverifier.com"
        password = "password123"
        
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"Creating user: {email}")
            user = User(
                email=email,
                password_hash=hash_password(password),
                role="admin",
                organization_id=org.id
            )
            db.add(user)
            db.commit()
            print(f"User created successfully.\nEmail: {email}\nPassword: {password}")
        else:
            print(f"User '{email}' already exists.")

    except Exception as e:
        print(f"Error initializing data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_data()
