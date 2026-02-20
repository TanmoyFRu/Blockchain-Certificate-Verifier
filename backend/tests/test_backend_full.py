import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.database import SessionLocal, Base, engine
from app.models.user import User
from app.models.organization import Organization
from app.services.auth_service import hash_password
import asyncio

# Setup test database (optional, for now we use the configured DB for simplicity but with Cleanup)
@pytest.fixture(scope="module")
def anyio_backend():
    return "asyncio"

@pytest.fixture(scope="module")
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    # Base.metadata.drop_all(bind=engine) # Dangerous if using production DB URL
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    # Clean up old test data if needed
    db.query(User).filter(User.email.like("test_%@example.com")).delete(synchronize_session=False)
    db.commit()
    db.close()
    yield

@pytest.mark.anyio
async def test_auth_flow(client):
    email = "test_user@example.com"
    password = "testpassword123"

    # 1. Register
    reg_res = await client.post("/auth/register", json={
        "email": email,
        "password": password
    })
    assert reg_res.status_code == 200
    assert reg_res.json()["email"] == email

    # 2. Duplicate Register (Failure)
    dup_res = await client.post("/auth/register", json={
        "email": email,
        "password": password
    })
    assert dup_res.status_code == 400

    # 3. Login
    login_res = await client.post("/auth/login", json={
        "email": email,
        "password": password
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    assert token is not None

    # 4. Login Invalid Password
    bad_login = await client.post("/auth/login", json={
        "email": email,
        "password": "wrongpassword"
    })
    assert bad_login.status_code == 401

@pytest.mark.anyio
async def test_organization_and_certs(client):
    import time
    ts = int(time.time())
    # Get token first
    email = f"test_issuer_{ts}@example.com"
    password = "password123"
    
    # Pre-register user with an org
    db = SessionLocal()
    # Cleanup any leftovers
    db.query(Organization).filter(Organization.name == f"Test Org {ts}").delete()
    db.commit()
    
    org = Organization(name=f"Test Org {ts}", wallet_address=f"0x{ts}")
    db.add(org)
    db.commit()
    db.refresh(org)
    org_id = org.id
    
    user = User(email=email, password_hash=hash_password(password), organization_id=org_id)
    db.add(user)
    db.commit()
    db.close()

    login_res = await client.post("/auth/login", json={"email": email, "password": password})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Get Me (Org)
    me_res = await client.get("/organizations/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["name"] == f"Test Org {ts}"

    # 2. Update Domain
    upd_res = await client.put(f"/organizations/{org_id}", json={"domain": "verify.test.edu"}, headers=headers)
    assert upd_res.status_code == 200
    assert upd_res.json()["domain"] == "verify.test.edu"

    # 3. Issue Certificate
    issue_res = await client.post("/certificates/issue", json={
        "owner_name": "Test Student",
        "course_name": "Testing Course"
    }, headers=headers)
    assert issue_res.status_code == 200
    cert_hash = issue_res.json()["cert_hash"]
    cert_id = issue_res.json()["id"]

    # 4. List Certificates
    list_res = await client.get("/certificates/", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # 5. Verify Certificate
    verify_res = await client.get(f"/certificates/verify/{cert_hash}")
    assert verify_res.status_code == 200
    assert verify_res.json()["on_chain"]["exists"] is True

    # 6. Revoke Certificate
    revoke_res = await client.post(f"/certificates/{cert_id}/revoke", headers=headers)
    assert revoke_res.status_code == 200

    # 7. Verify again (Check Revoked)
    verify_again = await client.get(f"/certificates/verify/{cert_hash}")
    assert verify_again.json()["local_record"]["revoked"] is True
    # Only check on-chain revoked state if not using mock provider
    if verify_again.json()["on_chain"]["issuer"] != "0xMOCK_ISSUER":
        assert verify_again.json()["on_chain"]["revoked"] is True

    # 8. Delete Certificate
    del_res = await client.delete(f"/certificates/{cert_id}", headers=headers)
    assert del_res.status_code == 200
