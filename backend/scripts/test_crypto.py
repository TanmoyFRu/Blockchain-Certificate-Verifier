import bcrypt
import time

def test_bcrypt():
    password = "password123".encode('utf-8')
    print("Testing raw bcrypt hash...")
    start = time.time()
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password, salt)
    print(f"Hashed in {time.time() - start:.4f}s")
    
    print("Testing raw bcrypt check...")
    start = time.time()
    match = bcrypt.checkpw(password, hashed)
    print(f"Matched: {match} in {time.time() - start:.4f}s")

def test_passlib():
    from passlib.context import CryptContext
    import os
    
    # Apply the monkey patch as in auth_service
    if not hasattr(bcrypt, '__about__'):
        bcrypt.__about__ = type('about', (object,), {'__version__': bcrypt.__version__})

    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    password = "password123"
    
    print("Testing passlib hash...")
    start = time.time()
    hashed = pwd_context.hash(password)
    print(f"Hashed in {time.time() - start:.4f}s")
    
    print("Testing passlib verify...")
    start = time.time()
    match = pwd_context.verify(password, hashed)
    print(f"Matched: {match} in {time.time() - start:.4f}s")

if __name__ == "__main__":
    test_bcrypt()
    print("-" * 20)
    test_passlib()
