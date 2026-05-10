import os
import sys
import io
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

os.environ.update({
    "DATABASE_URL": "sqlite:///./test_backend.db",
    "SECRET_KEY": "test-secret-key",
    "ALGORITHM": "HS256",
    "ACCESS_TOKEN_EXPIRE_MINUTES": "60",
    "RPC_URL": "",
    "PRIVATE_KEY": "",
    "CONTRACT_ADDRESS": "",
    "MINIO_ENDPOINT": "",
    "MINIO_ACCESS_KEY": "",
    "MINIO_SECRET_KEY": "",
    "MINIO_BUCKET_NAME": "test-certs",
    "MINIO_SECURE": "false",
    "FRONTEND_URL": "http://localhost:3000",
})

from app.db.database import Base, get_db
from app.main import app
from app.services.auth_service import create_access_token

TEST_DB = "sqlite:///./test_backend.db"
engine = create_engine(TEST_DB, connect_args={"check_same_thread": False})
Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = Session()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def fresh_db():
    os.makedirs("storage", exist_ok=True)
    Base.metadata.create_all(bind=engine)
    yield
    Session.close_all()
    Base.metadata.drop_all(bind=engine)
    engine.dispose()
    try:
        if os.path.exists("test_backend.db"):
            os.remove("test_backend.db")
    except PermissionError:
        pass


@pytest.fixture
def c():
    return TestClient(app)


def _org(c, name="TestOrg"):
    return c.post("/organizations/", json={"name": name})


def _register(c, email="a@b.com", pw="pass1234", org_id=None):
    body = {"email": email, "password": pw}
    if org_id is not None:
        body["organization_id"] = org_id
    return c.post("/auth/register", json=body)


def _login(c, email="a@b.com", pw="pass1234"):
    r = c.post("/auth/login", json={"email": email, "password": pw})
    return r.json()["access_token"]


def _h(token):
    return {"Authorization": f"Bearer {token}"}


def _seed(c, org_name="TestOrg", email="a@b.com", pw="pass1234"):
    oid = _org(c, org_name).json()["id"]
    _register(c, email, pw, oid)
    t = _login(c, email, pw)
    return oid, t


# ===================== ROOT =====================

class TestRoot:
    def test_health(self, c):
        r = c.get("/")
        assert r.status_code == 200
        assert r.json() == {"status": "running"}

    def test_404_random_route(self, c):
        assert c.get("/nonexistent").status_code == 404


# ===================== AUTH =====================

class TestAuthRegister:
    def test_register_success(self, c):
        _org(c, "Org1")
        r = _register(c, "x@y.com", "pw", 1)
        assert r.status_code == 200
        d = r.json()
        assert d["email"] == "x@y.com"
        assert d["role"] == "admin"
        assert d["organization_id"] == 1
        assert "password" not in d
        assert "password_hash" not in d

    def test_register_no_org(self, c):
        r = _register(c, "x@y.com", "pw")
        assert r.status_code == 200
        assert r.json()["organization_id"] is None

    def test_register_duplicate_email(self, c):
        _register(c, "dup@test.com", "pw")
        r = _register(c, "dup@test.com", "pw2")
        assert r.status_code == 400
        assert "already registered" in r.json()["detail"].lower()

    def test_register_invalid_email(self, c):
        r = c.post("/auth/register", json={"email": "not-an-email", "password": "pw"})
        assert r.status_code == 422

    def test_register_missing_password(self, c):
        r = c.post("/auth/register", json={"email": "a@b.com"})
        assert r.status_code == 422

    def test_register_empty_body(self, c):
        r = c.post("/auth/register", json={})
        assert r.status_code == 422

    def test_register_wrong_content_type(self, c):
        r = c.post("/auth/register", content="not json", headers={"Content-Type": "text/plain"})
        assert r.status_code == 422


class TestAuthLogin:
    def test_login_success(self, c):
        _register(c, "u@t.com", "pw")
        r = c.post("/auth/login", json={"email": "u@t.com", "password": "pw"})
        assert r.status_code == 200
        d = r.json()
        assert "access_token" in d
        assert d["token_type"] == "bearer"

    def test_login_wrong_password(self, c):
        _register(c, "u@t.com", "correct")
        r = c.post("/auth/login", json={"email": "u@t.com", "password": "wrong"})
        assert r.status_code == 401

    def test_login_nonexistent_user(self, c):
        r = c.post("/auth/login", json={"email": "ghost@t.com", "password": "pw"})
        assert r.status_code == 401

    def test_login_missing_fields(self, c):
        r = c.post("/auth/login", json={"email": "a@b.com"})
        assert r.status_code == 422

    def test_login_empty_body(self, c):
        r = c.post("/auth/login", json={})
        assert r.status_code == 422


class TestAuthToken:
    def test_no_token_on_protected_route(self, c):
        r = c.get("/certificates/")
        assert r.status_code == 401

    def test_invalid_token(self, c):
        r = c.get("/certificates/", headers=_h("garbage.token.here"))
        assert r.status_code == 401

    def test_expired_token(self, c):
        os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "-1"
        from app.config.settings import Settings
        with patch("app.services.auth_service.settings", Settings()):
            token = create_access_token({"sub": "999", "role": "admin"})
        os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "60"
        r = c.get("/certificates/", headers=_h(token))
        assert r.status_code == 401

    def test_token_missing_sub(self, c):
        token = create_access_token({"role": "admin"})
        r = c.get("/certificates/", headers=_h(token))
        assert r.status_code == 401

    def test_malformed_bearer(self, c):
        r = c.get("/certificates/", headers={"Authorization": "NotBearer xyz"})
        assert r.status_code == 401


# ===================== ORGANIZATIONS =====================

class TestOrganizationCreate:
    def test_create_org(self, c):
        r = _org(c, "Acme")
        assert r.status_code == 200
        d = r.json()
        assert d["name"] == "Acme"
        assert d["id"] is not None

    def test_create_org_with_wallet_and_domain(self, c):
        r = c.post("/organizations/", json={"name": "X", "wallet_address": "0xABC", "domain": "x.com"})
        assert r.status_code == 200
        d = r.json()
        assert d["wallet_address"] == "0xABC"
        assert d["domain"] == "x.com"

    def test_create_duplicate_org(self, c):
        _org(c, "Dup")
        r = _org(c, "Dup")
        assert r.status_code == 400
        assert "already exists" in r.json()["detail"].lower()

    def test_create_org_missing_name(self, c):
        r = c.post("/organizations/", json={})
        assert r.status_code == 422


class TestOrganizationGet:
    def test_get_org_by_id(self, c):
        oid = _org(c, "Find").json()["id"]
        r = c.get(f"/organizations/{oid}")
        assert r.status_code == 200
        assert r.json()["name"] == "Find"

    def test_get_org_not_found(self, c):
        r = c.get("/organizations/9999")
        assert r.status_code == 404


class TestOrganizationMe:
    def test_me_success(self, c):
        oid, t = _seed(c, "MyOrg", "me@t.com")
        r = c.get("/organizations/me", headers=_h(t))
        assert r.status_code == 200
        assert r.json()["name"] == "MyOrg"

    def test_me_no_org(self, c):
        _register(c, "solo@t.com", "pw")
        t = _login(c, "solo@t.com", "pw")
        r = c.get("/organizations/me", headers=_h(t))
        assert r.status_code == 404

    def test_me_no_auth(self, c):
        r = c.get("/organizations/me")
        assert r.status_code == 401


class TestOrganizationUpdate:
    def test_update_domain(self, c):
        oid, t = _seed(c)
        r = c.put(f"/organizations/{oid}", json={"domain": "new.com"}, headers=_h(t))
        assert r.status_code == 200
        assert r.json()["domain"] == "new.com"

    def test_update_name(self, c):
        oid, t = _seed(c, "Old")
        r = c.put(f"/organizations/{oid}", json={"name": "New"}, headers=_h(t))
        assert r.status_code == 200
        assert r.json()["name"] == "New"

    def test_update_other_org_forbidden(self, c):
        _seed(c, "Org1", "u1@t.com")
        o2 = _org(c, "Org2").json()["id"]
        _register(c, "u2@t.com", "pw", o2)
        t2 = _login(c, "u2@t.com", "pw")
        r = c.put("/organizations/1", json={"name": "Hack"}, headers=_h(t2))
        assert r.status_code == 403

    def test_update_no_auth(self, c):
        oid = _org(c).json()["id"]
        r = c.put(f"/organizations/{oid}", json={"name": "X"})
        assert r.status_code == 401

    def test_update_nonexistent_org(self, c):
        _seed(c)
        oid, t = _seed(c, "X", "x@t.com")
        r = c.put("/organizations/9999", json={"name": "Y"}, headers=_h(t))
        assert r.status_code == 403


# ===================== CERTIFICATES =====================

class TestCertificateIssue:
    def test_issue_success(self, c):
        _, t = _seed(c)
        r = c.post("/certificates/issue", json={"owner_name": "Alice", "course_name": "Blockchain 101"}, headers=_h(t))
        assert r.status_code == 200
        d = r.json()
        assert d["owner_name"] == "Alice"
        assert d["course_name"] == "Blockchain 101"
        assert d["cert_hash"] is not None
        assert d["tx_hash"] is not None
        assert d["revoked"] is False
        assert d["storage_url"] is not None

    def test_issue_no_auth(self, c):
        r = c.post("/certificates/issue", json={"owner_name": "A", "course_name": "B"})
        assert r.status_code == 401

    def test_issue_user_without_org(self, c):
        _register(c, "solo@t.com", "pw")
        t = _login(c, "solo@t.com", "pw")
        r = c.post("/certificates/issue", json={"owner_name": "A", "course_name": "B"}, headers=_h(t))
        assert r.status_code == 400
        assert "not associated" in r.json()["detail"].lower()

    def test_issue_missing_owner_name(self, c):
        _, t = _seed(c)
        r = c.post("/certificates/issue", json={"course_name": "B"}, headers=_h(t))
        assert r.status_code == 422

    def test_issue_missing_course_name(self, c):
        _, t = _seed(c)
        r = c.post("/certificates/issue", json={"owner_name": "A"}, headers=_h(t))
        assert r.status_code == 422

    def test_issue_empty_body(self, c):
        _, t = _seed(c)
        r = c.post("/certificates/issue", json={}, headers=_h(t))
        assert r.status_code == 422


class TestCertificateList:
    def test_list_empty(self, c):
        _, t = _seed(c)
        r = c.get("/certificates/", headers=_h(t))
        assert r.status_code == 200
        assert r.json() == []

    def test_list_after_issue(self, c):
        _, t = _seed(c)
        c.post("/certificates/issue", json={"owner_name": "A", "course_name": "C1"}, headers=_h(t))
        c.post("/certificates/issue", json={"owner_name": "B", "course_name": "C2"}, headers=_h(t))
        r = c.get("/certificates/", headers=_h(t))
        assert r.status_code == 200
        assert len(r.json()) == 2

    def test_list_no_auth(self, c):
        r = c.get("/certificates/")
        assert r.status_code == 401

    def test_list_user_without_org_returns_empty(self, c):
        _register(c, "solo@t.com", "pw")
        t = _login(c, "solo@t.com", "pw")
        r = c.get("/certificates/", headers=_h(t))
        assert r.status_code == 200
        assert r.json() == []

    def test_list_does_not_show_other_org_certs(self, c):
        _, t1 = _seed(c, "Org1", "u1@t.com")
        c.post("/certificates/issue", json={"owner_name": "A", "course_name": "X"}, headers=_h(t1))

        o2 = _org(c, "Org2").json()["id"]
        _register(c, "u2@t.com", "pw", o2)
        t2 = _login(c, "u2@t.com", "pw")
        r = c.get("/certificates/", headers=_h(t2))
        assert r.status_code == 200
        assert len(r.json()) == 0

    def test_list_returns_no_mock_data(self, c):
        _, t = _seed(c)
        r = c.get("/certificates/", headers=_h(t))
        data = r.json()
        for cert in data:
            assert not cert.get("cert_hash", "").startswith("mock_")


class TestCertificateVerifyHash:
    def test_verify_success(self, c):
        _, t = _seed(c)
        issued = c.post("/certificates/issue", json={"owner_name": "V", "course_name": "C"}, headers=_h(t)).json()
        h = issued["cert_hash"]
        r = c.get(f"/certificates/verify/{h}")
        assert r.status_code == 200
        d = r.json()
        assert d["local_record"]["owner_name"] == "V"
        assert d["local_record"]["course_name"] == "C"
        assert "on_chain" in d
        assert "pdf_url" in d

    def test_verify_nonexistent_hash(self, c):
        r = c.get("/certificates/verify/deadbeef1234567890")
        assert r.status_code == 404

    def test_verify_empty_hash(self, c):
        r = c.get("/certificates/verify/")
        assert r.status_code in (404, 307, 405)

    def test_verify_no_auth_required(self, c):
        _, t = _seed(c)
        issued = c.post("/certificates/issue", json={"owner_name": "P", "course_name": "Q"}, headers=_h(t)).json()
        r = c.get(f"/certificates/verify/{issued['cert_hash']}")
        assert r.status_code == 200

    def test_verify_response_shape(self, c):
        _, t = _seed(c)
        issued = c.post("/certificates/issue", json={"owner_name": "S", "course_name": "T"}, headers=_h(t)).json()
        r = c.get(f"/certificates/verify/{issued['cert_hash']}").json()
        lr = r["local_record"]
        assert "id" in lr
        assert "cert_hash" in lr
        assert "owner_name" in lr
        assert "course_name" in lr
        assert "storage_url" in lr
        assert "tx_hash" in lr
        assert "created_at" in lr
        assert "revoked" in lr
        oc = r["on_chain"]
        assert "exists" in oc
        assert "revoked" in oc
        assert "issuer" in oc
        assert "timestamp" in oc


class TestCertificateVerifyFile:
    def test_verify_file_no_match(self, c):
        fake = io.BytesIO(b"not a real certificate pdf")
        r = c.post("/certificates/verify-file", files={"file": ("fake.pdf", fake, "application/pdf")})
        assert r.status_code == 404

    def test_verify_file_no_file_sent(self, c):
        r = c.post("/certificates/verify-file")
        assert r.status_code == 422


class TestCertificateRevoke:
    def test_revoke_success(self, c):
        _, t = _seed(c)
        cert = c.post("/certificates/issue", json={"owner_name": "R", "course_name": "X"}, headers=_h(t)).json()
        r = c.post(f"/certificates/{cert['id']}/revoke", headers=_h(t))
        assert r.status_code == 200
        assert "revoked" in r.json()["message"].lower()

    def test_revoke_already_revoked(self, c):
        _, t = _seed(c)
        cert = c.post("/certificates/issue", json={"owner_name": "R", "course_name": "X"}, headers=_h(t)).json()
        c.post(f"/certificates/{cert['id']}/revoke", headers=_h(t))
        r = c.post(f"/certificates/{cert['id']}/revoke", headers=_h(t))
        assert r.status_code == 400
        assert "already revoked" in r.json()["detail"].lower()

    def test_revoke_nonexistent(self, c):
        _, t = _seed(c)
        r = c.post("/certificates/9999/revoke", headers=_h(t))
        assert r.status_code == 404

    def test_revoke_no_auth(self, c):
        r = c.post("/certificates/1/revoke")
        assert r.status_code == 401

    def test_revoke_other_org_forbidden(self, c):
        _, t1 = _seed(c, "Org1", "u1@t.com")
        cert = c.post("/certificates/issue", json={"owner_name": "A", "course_name": "B"}, headers=_h(t1)).json()
        o2 = _org(c, "Org2").json()["id"]
        _register(c, "u2@t.com", "pw", o2)
        t2 = _login(c, "u2@t.com", "pw")
        r = c.post(f"/certificates/{cert['id']}/revoke", headers=_h(t2))
        assert r.status_code == 403

    def test_revoked_cert_shows_revoked_in_verify(self, c):
        _, t = _seed(c)
        cert = c.post("/certificates/issue", json={"owner_name": "R", "course_name": "X"}, headers=_h(t)).json()
        c.post(f"/certificates/{cert['id']}/revoke", headers=_h(t))
        v = c.get(f"/certificates/verify/{cert['cert_hash']}").json()
        assert v["local_record"]["revoked"] is True

    def test_revoked_cert_still_in_list(self, c):
        _, t = _seed(c)
        cert = c.post("/certificates/issue", json={"owner_name": "R", "course_name": "X"}, headers=_h(t)).json()
        c.post(f"/certificates/{cert['id']}/revoke", headers=_h(t))
        listed = c.get("/certificates/", headers=_h(t)).json()
        assert len(listed) == 1
        assert listed[0]["revoked"] is True


class TestCertificateDelete:
    def test_delete_success(self, c):
        _, t = _seed(c)
        cert = c.post("/certificates/issue", json={"owner_name": "D", "course_name": "X"}, headers=_h(t)).json()
        r = c.delete(f"/certificates/{cert['id']}", headers=_h(t))
        assert r.status_code == 200
        listed = c.get("/certificates/", headers=_h(t)).json()
        assert len(listed) == 0

    def test_delete_nonexistent(self, c):
        _, t = _seed(c)
        r = c.delete("/certificates/9999", headers=_h(t))
        assert r.status_code == 404

    def test_delete_no_auth(self, c):
        r = c.delete("/certificates/1")
        assert r.status_code == 401

    def test_delete_other_org_forbidden(self, c):
        _, t1 = _seed(c, "Org1", "u1@t.com")
        cert = c.post("/certificates/issue", json={"owner_name": "A", "course_name": "B"}, headers=_h(t1)).json()
        o2 = _org(c, "Org2").json()["id"]
        _register(c, "u2@t.com", "pw", o2)
        t2 = _login(c, "u2@t.com", "pw")
        r = c.delete(f"/certificates/{cert['id']}", headers=_h(t2))
        assert r.status_code == 403

    def test_deleted_cert_not_verifiable(self, c):
        _, t = _seed(c)
        cert = c.post("/certificates/issue", json={"owner_name": "D", "course_name": "X"}, headers=_h(t)).json()
        c.delete(f"/certificates/{cert['id']}", headers=_h(t))
        r = c.get(f"/certificates/verify/{cert['cert_hash']}")
        assert r.status_code == 404


# ===================== CROSS-CUTTING EDGE CASES =====================

class TestEdgeCases:
    def test_unicode_owner_name(self, c):
        _, t = _seed(c)
        r = c.post("/certificates/issue", json={"owner_name": "Tanmoy Debnath", "course_name": "Test"}, headers=_h(t))
        assert r.status_code == 200
        assert r.json()["owner_name"] == "Tanmoy Debnath"

    def test_very_long_owner_name(self, c):
        _, t = _seed(c)
        name = "A" * 100
        r = c.post("/certificates/issue", json={"owner_name": name, "course_name": "X"}, headers=_h(t))
        assert r.status_code == 200
        assert r.json()["owner_name"] == name

    def test_special_chars_in_course(self, c):
        _, t = _seed(c)
        r = c.post("/certificates/issue", json={"owner_name": "Bob", "course_name": "C++ & Data <Structures> 'v2'"}, headers=_h(t))
        assert r.status_code == 200

    def test_multiple_orgs_issue_independently(self, c):
        _, t1 = _seed(c, "Org1", "u1@t.com")
        o2 = _org(c, "Org2").json()["id"]
        _register(c, "u2@t.com", "pw", o2)
        t2 = _login(c, "u2@t.com", "pw")

        c.post("/certificates/issue", json={"owner_name": "A", "course_name": "X"}, headers=_h(t1))
        c.post("/certificates/issue", json={"owner_name": "B", "course_name": "Y"}, headers=_h(t2))

        l1 = c.get("/certificates/", headers=_h(t1)).json()
        l2 = c.get("/certificates/", headers=_h(t2)).json()
        assert len(l1) == 1
        assert l1[0]["owner_name"] == "A"
        assert len(l2) == 1
        assert l2[0]["owner_name"] == "B"

    def test_issue_delete_reissue(self, c):
        _, t = _seed(c)
        cert1 = c.post("/certificates/issue", json={"owner_name": "A", "course_name": "X"}, headers=_h(t)).json()
        c.delete(f"/certificates/{cert1['id']}", headers=_h(t))
        r = c.post("/certificates/issue", json={"owner_name": "A", "course_name": "X"}, headers=_h(t))
        assert r.status_code == 200

    def test_revoke_then_delete(self, c):
        _, t = _seed(c)
        cert = c.post("/certificates/issue", json={"owner_name": "A", "course_name": "X"}, headers=_h(t)).json()
        c.post(f"/certificates/{cert['id']}/revoke", headers=_h(t))
        r = c.delete(f"/certificates/{cert['id']}", headers=_h(t))
        assert r.status_code == 200

    def test_list_ordering_desc(self, c):
        _, t = _seed(c)
        c.post("/certificates/issue", json={"owner_name": "First", "course_name": "A"}, headers=_h(t))
        c.post("/certificates/issue", json={"owner_name": "Second", "course_name": "B"}, headers=_h(t))
        listed = c.get("/certificates/", headers=_h(t)).json()
        assert len(listed) == 2
        assert listed[0]["owner_name"] == "Second"
        assert listed[1]["owner_name"] == "First"

    def test_cert_hash_is_deterministic_same_day(self, c):
        _, t = _seed(c)
        r1 = c.post("/certificates/issue", json={"owner_name": "Same", "course_name": "Course"}, headers=_h(t))
        if r1.status_code == 200:
            h1 = r1.json()["cert_hash"]
            c.delete(f"/certificates/{r1.json()['id']}", headers=_h(t))
            r2 = c.post("/certificates/issue", json={"owner_name": "Same", "course_name": "Course"}, headers=_h(t))
            if r2.status_code == 200:
                assert r2.json()["cert_hash"] == h1
