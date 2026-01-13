import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def verify_routes():
    print("🔍 Verifying API Routes")
    print("=" * 60)
    
    # Test with actual data
    test_data = {
        "name": "Test User",
        "email": "test@example.com",
        "phone": "1234567890",
        "password": "test123",
        "user_type": "customer"
    }
    
    print("\n1. Testing /api/v1/auth/register with actual data...")
    response = requests.post(f"{BASE_URL}/api/v1/auth/register", json=test_data)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.text[:500]}...")
    
    print("\n2. Testing other endpoints...")
    
    endpoints = [
        ("GET", "/"),
        ("GET", "/api/health"),
        ("GET", "/api/demo/drivers"),
        ("GET", "/openapi.json"),
        ("GET", "/docs"),
    ]
    
    for method, endpoint in endpoints:
        try:
            if method == "GET":
                response = requests.get(f"{BASE_URL}{endpoint}")
            print(f"   {method} {endpoint}: Status {response.status_code}")
        except Exception as e:
            print(f"   {method} {endpoint}: Error - {e}")

if __name__ == "__main__":
    verify_routes()