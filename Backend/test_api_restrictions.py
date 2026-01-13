# test_api_restrictions.py
import sys
sys.path.append('.')
from app.core.config import settings
import googlemaps
import requests

def test_api_restrictions():
    print("🔧 Testing API Key Restrictions")
    print("=" * 60)
    
    if not settings.GOOGLE_MAPS_API_KEY:
        print("❌ No API key found")
        return
    
    api_key = settings.GOOGLE_MAPS_API_KEY
    print(f"API Key: {api_key[:10]}...")
    
    # Test direct API call without googlemaps library
    print("\n1. Testing direct API call...")
    
    # Test Geocoding API
    url = f"https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "address": "Bangalore, India",
        "key": api_key
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        
        status = data.get("status")
        print(f"   API Status: {status}")
        
        if status == "OK":
            print("   ✅ API key works without referer restrictions!")
            print(f"   Found: {data['results'][0]['formatted_address'][:50]}...")
        elif status == "REQUEST_DENIED":
            print("   ❌ API key has referer restrictions")
            print("   Solution: Change key restrictions to 'IP addresses' or 'None' in Google Cloud Console")
        else:
            print(f"   ⚠️  Other issue: {status}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test Directions API
    print("\n2. Testing Directions API...")
    url = f"https://maps.googleapis.com/maps/api/directions/json"
    params = {
        "origin": "12.9716,77.5946",
        "destination": "13.0827,80.2707",
        "key": api_key
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        
        status = data.get("status")
        print(f"   Directions API Status: {status}")
        
        if status == "OK":
            print("   ✅ Directions API works!")
        elif status == "REQUEST_DENIED":
            print("   ❌ Directions API blocked by restrictions")
            print("   Make sure 'Directions API' is ENABLED in Google Cloud Console")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")

if __name__ == "__main__":
    test_api_restrictions()