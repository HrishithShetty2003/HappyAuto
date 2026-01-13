import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def test_fixed():
    print("🔧 Testing with fixed password length")
    print("=" * 60)
    
    timestamp = int(time.time())
    test_email = f"test_{timestamp}@example.com"
    
    # Use SHORTER password
    register_data = {
        "name": "Test User",
        "email": test_email,
        "phone": "1234567890",
        "password": "test123",  # Short password
        "user_type": "customer"
    }
    
    print(f"\n1. Registering with short password...")
    response = requests.post(f"{BASE_URL}/api/v1/auth/register", json=register_data)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.text[:200]}...")
    
    if response.status_code == 200:
        print("\n✅ Registration successful!")
        token = response.json().get('access_token', '')
        print(f"   Token: {token[:30]}...")
        
        # Test login
        print("\n2. Testing login...")
        login_data = {
            "email": test_email,
            "password": "test123"
        }
        response = requests.post(f"{BASE_URL}/api/v1/auth/login", json=login_data)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text[:200]}...")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    test_fixed()