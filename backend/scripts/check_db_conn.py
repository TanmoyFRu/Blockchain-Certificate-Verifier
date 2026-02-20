from sqlalchemy import create_engine
import sys
import os

sys.path.append(os.getcwd())
from app.config.settings import settings

def check_db():
    print(f"Connecting to {settings.DATABASE_URL}...")
    try:
        engine = create_engine(settings.DATABASE_URL, connect_args={'connect_timeout': 5})
        with engine.connect() as conn:
            print("SUCCESS: Connection established.")
            from sqlalchemy import text
            res = conn.execute(text("SELECT 1")).fetchone()
            print(f"Query Result: {res}")
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == "__main__":
    check_db()
