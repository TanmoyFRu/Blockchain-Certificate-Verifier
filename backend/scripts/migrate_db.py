from sqlalchemy import create_engine, text
import sys
import os

sys.path.append(os.getcwd())
from app.config.settings import settings

def migrate():
    engine = create_engine(settings.DATABASE_URL)
    with engine.connect() as conn:
        print("Checking organizations table...")
        try:
            conn.execute(text("ALTER TABLE organizations ADD COLUMN IF NOT EXISTS domain VARCHAR;"))
            conn.commit()
            print("Migration successful: Added 'domain' column to organizations.")
        except Exception as e:
            print(f"Migration Error: {e}")

if __name__ == "__main__":
    migrate()
