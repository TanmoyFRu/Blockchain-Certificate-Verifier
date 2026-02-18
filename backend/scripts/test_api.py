import httpx
import time
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_flow():
    with httpx.Client(base_url=BASE_URL, timeout=30.0) as client:
        print("--- Starting API End-to-End Test ---", flush=True)

        # 1. Register User
        email = f"test_{int(time.time())}@example.com"
        print(f"1. Testing Register: {email}", flush=True)
        reg_res = client.post("/auth/register", json={
            "email": email,
            "password": "testpassword123"
        })
        if reg_res.status_code != 200:
            print(f"FAILED: {reg_res.text}", flush=True)
            return
        print("SUCCESS: User registered", flush=True)

        # 2. Login User
        print("2. Testing Login", flush=True)
        login_res = client.post("/auth/login", json={
            "email": email,
            "password": "testpassword123"
        })
        if login_res.status_code != 200:
            print(f"FAILED: {login_res.text}", flush=True)
            return
        token = login_res.json()["access_token"]
        print("SUCCESS: Login successful, token received", flush=True)

        # 3. Create Organization
        org_name = f"University_{int(time.time())}"
        print(f"3. Testing Create Organization: {org_name}", flush=True)
        org_res = client.post("/organizations/", json={
            "name": org_name,
            "wallet_address": "0x1234567890123456789012345678901234567890"
        })
        if org_res.status_code != 200:
            print(f"FAILED: {org_res.text}", flush=True)
            return
        org_id = org_res.json()["id"]
        print(f"SUCCESS: Organization created with ID {org_id}", flush=True)

        # 4. Issue Certificate
        student_name = "John Doe"
        print(f"4. Testing Issue Certificate for {student_name}", flush=True)
        cert_res = client.post("/certificates/issue", json={
            "owner_name": student_name,
            "course_name": "Full Stack Blockchain",
            "organization_id": org_id
        })
        if cert_res.status_code != 200:
            print(f"FAILED: {cert_res.text}", flush=True)
            return
        cert_data = cert_res.json()
        cert_hash = cert_data["cert_hash"]
        print(f"SUCCESS: Certificate issued. Hash: {cert_hash}", flush=True)
        print(f"TX Hash: {cert_data.get('tx_hash', 'None (Mocked)')}", flush=True)

        # 5. Verify Certificate
        print(f"5. Testing Verify Certificate: {cert_hash}", flush=True)
        verify_res = client.get(f"/certificates/verify/{cert_hash}")
        if verify_res.status_code != 200:
            print(f"FAILED: {verify_res.text}", flush=True)
            return
        print("SUCCESS: Certificate verified", flush=True)
        print(f"Response: {verify_res.json()}", flush=True)

        print("\n--- All tests passed! ---", flush=True)

if __name__ == "__main__":
    try:
        test_flow()
    except Exception as e:
        print(f"ERROR: Could not connect to server. Is it running? {e}")
