
import requests
import json
import sys

# Define the base URL
BASE_URL = "http://127.0.0.1:8000"

def get_token():
    try:
        url = f"{BASE_URL}/auth/login"
        payload = {"email": "admin@certverifier.com", "password": "password123"}
        response = requests.post(url, json=payload)
        response.raise_for_status()
        return response.json().get("access_token")
    except Exception as e:
        print(f"Error fetching token: {e}")
        return None

def test_endpoints():
    token = get_token()
    if not token:
        print("Failed to authenticate. Exiting.")
        return

    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Test Fetch Certificates
    # Assuming org_id 1 exists from init_db_data.py
    org_id = 1 
    try:
        print("\nTesting GET /certificates/...")
        response = requests.get(f"{BASE_URL}/certificates/?org_id={org_id}", headers=headers)
        if response.status_code == 200:
            print("✓ GET /certificates/ Success")
            print(f"  Data: {json.dumps(response.json(), indent=2)}")
        else:
            print(f"✗ GET /certificates/ Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"✗ Error testing GET /certificates/: {e}")

    # 2. Test Issue Certificate
    try:
        print("\nTesting POST /certificates/issue...")
        payload = {
            "owner_name": "Test Student",
            "course_name": "Test Course",
            "organization_id": org_id
        }
        response = requests.post(f"{BASE_URL}/certificates/issue", json=payload, headers=headers)
        if response.status_code == 200:
            print("✓ POST /certificates/issue Success")
            print(f"  Data: {json.dumps(response.json(), indent=2)}")
        else:
            print(f"✗ POST /certificates/issue Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"✗ Error testing POST /certificates/issue: {e}")

if __name__ == "__main__":
    test_endpoints()
