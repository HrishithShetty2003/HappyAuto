import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def diagnose_routes():
    print("🔍 Route Diagnosis")
    print("=" * 60)
    
    test_data = {
        "name": "Test User",
        "email": "test@example.com",
        "phone": "1234567890",
        "password": "test123",
        "user_type": "customer"
    }
    
    # Test with minimal data for validation errors
    minimal_data = {"email": "test@example.com", "password": "test123"}
    
    print("\n1. Testing WITHOUT /auth/ in path:")
    routes1 = ["/api/v1/register", "/api/v1/login"]
    for route in routes1:
        print(f"\n  Testing {route}")
        data = test_data if "register" in route else minimal_data
        response = requests.post(f"{BASE_URL}{route}", json=data)
        print(f"    Status: {response.status_code}")
        if response.status_code != 200:
            print(f"    Response: {response.text[:150]}")
    
    print("\n2. Testing WITH /auth/ in path:")
    routes2 = ["/api/v1/auth/register", "/api/v1/auth/login", "/auth/register", "/auth/login"]
    for route in routes2:
        print(f"\n  Testing {route}")
        data = test_data if "register" in route else minimal_data
        response = requests.post(f"{BASE_URL}{route}", json=data)
        print(f"    Status: {response.status_code}")
        if response.status_code != 200:
            print(f"    Response: {response.text[:150]}")

if __name__ == "__main__":
    diagnose_routes()