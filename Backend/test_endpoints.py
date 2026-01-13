import requests

BASE_URL = "http://127.0.0.1:8000"

def test_all_endpoints():
    print("🔍 Testing all endpoints...")
    print("=" * 60)
    
    endpoints = [
        "/",
        "/api/health",
        "/api/demo/drivers",
        "/api/v1/auth/register",
        "/auth/register",  # Try without /api/v1
        "/api/v1/auth/login",
        "/auth/login",
        "/openapi.json",
        "/docs"
    ]
    
    for endpoint in endpoints:
        print(f"\nTesting: {endpoint}")
        try:
            if endpoint in ["/api/v1/auth/register", "/auth/register", "/api/v1/auth/login", "/auth/login"]:
                # Use POST for auth endpoints
                response = requests.post(f"{BASE_URL}{endpoint}", json={})
            else:
                response = requests.get(f"{BASE_URL}{endpoint}")
            
            print(f"  Status: {response.status_code}")
            if response.status_code != 200:
                print(f"  Response: {response.text[:100]}")
        except Exception as e:
            print(f"  Error: {e}")

if __name__ == "__main__":
    test_all_endpoints()