# import requests
# import json

# BASE_URL = "http://localhost:8000"

# def test_full_flow():
#     print("🚀 Testing Complete Database System")
    
#     # 1. Register Driver
#     print("\n1. Registering Driver...")
#     driver_data = {
#         "name": "Rajesh Kumar",
#         "email": "rajesh@happyauto.com",
#         "phone": "9876543210",
#         "password": "SecurePass123",
#         "user_type": "driver"
#     }
    
#     response = requests.post(f"{BASE_URL}/api/v1/auth/register", json=driver_data)
#     print(f"Status: {response.status_code}")
#     if response.status_code == 200:
#         driver_response = response.json()
#         print(f"Driver ID: {driver_response['user']['id']}")
#         driver_token = driver_response['access_token']
#         print(f"Token: {driver_token[:50]}...")
    
#     # 2. Register Customer
#     print("\n2. Registering Customer...")
#     customer_data = {
#         "name": "Priya Sharma",
#         "email": "priya@customer.com",
#         "phone": "9876543211",
#         "password": "CustomerPass123",
#         "user_type": "customer"
#     }
    
#     response = requests.post(f"{BASE_URL}/api/v1/auth/register", json=customer_data)
#     print(f"Status: {response.status_code}")
#     if response.status_code == 200:
#         customer_response = response.json()
#         customer_token = customer_response['access_token']
    
#     # 3. Login
#     print("\n3. Testing Login...")
#     login_data = {
#         "email": "rajesh@happyauto.com",
#         "password": "SecurePass123"
#     }
    
#     response = requests.post(f"{BASE_URL}/api/v1/auth/login", json=login_data)
#     print(f"Status: {response.status_code}")
#     print(f"Response: {json.dumps(response.json(), indent=2)[:200]}...")
    
#     # 4. Get Current User
#     print("\n4. Getting Current User...")
#     headers = {"Authorization": f"Bearer {driver_token}"}
#     response = requests.get(f"{BASE_URL}/api/v1/auth/me", headers=headers)
#     print(f"Status: {response.status_code}")
#     if response.status_code == 200:
#         print(f"User: {response.json()}")
    
#     print("\n✅ All tests completed!")

# if __name__ == "__main__":
#     test_full_flow()

import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"
API_PREFIX = "/api/v1"

def test_full_flow():
    print("🚀 Testing Complete Database System")
    print("=" * 60)
    
    # Create unique test data
    timestamp = int(time.time())
    driver_email = f"rajesh_{timestamp}@happyauto.com"
    customer_email = f"priya_{timestamp}@customer.com"
    
    driver_token = None
    
    # 1. Register Driver
    print("\n1. Registering Driver...")
    driver_data = {
        "name": "Rajesh Kumar",
        "email": driver_email,
        "phone": f"9{timestamp % 1000000000:09d}",  # unique 10-digit phone
        "password": "SecurePass123",  # This password is fine (13 chars)
        "user_type": "driver"
    }
    
    print(f"Sending to /api/v1/auth/register")
    response = requests.post(f"{BASE_URL}{API_PREFIX}/auth/register", json=driver_data)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        driver_response = response.json()
        print("✅ Driver registered successfully!")
        print(f"Driver ID: {driver_response.get('user', {}).get('id', 'N/A')}")
        driver_token = driver_response.get('access_token', '')
        print(f"Token: {driver_token[:50]}...")
    else:
        print(f"❌ Driver registration failed!")
        print(f"Error: {response.text}")
        return
    
    # 2. Register Customer
    print("\n2. Registering Customer...")
    customer_data = {
        "name": "Priya Sharma",
        "email": customer_email,
        "phone": f"8{timestamp % 1000000000:09d}",  # unique 10-digit phone
        "password": "CustomerPass123",  # This password is fine (15 chars)
        "user_type": "customer"
    }
    
    response = requests.post(f"{BASE_URL}{API_PREFIX}/auth/register", json=customer_data)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        customer_response = response.json()
        print("✅ Customer registered successfully!")
        customer_token = customer_response.get('access_token', '')
        print(f"Token: {customer_token[:50]}...")
    else:
        print(f"❌ Customer registration failed!")
        print(f"Error: {response.text}")
    
    # 3. Login
    print("\n3. Testing Login...")
    login_data = {
        "email": driver_email,
        "password": "SecurePass123"
    }
    
    response = requests.post(f"{BASE_URL}{API_PREFIX}/auth/login", json=login_data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)[:200]}...")
    
    # 4. Get Current User
    print("\n4. Getting Current User...")
    headers = {"Authorization": f"Bearer {driver_token}"}
    response = requests.get(f"{BASE_URL}{API_PREFIX}/auth/me", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print(f"User: {response.json()}")
    
    print("\n✅ All tests completed!")

if __name__ == "__main__":
    test_full_flow()