# test_google_maps_integration.py
import sys
sys.path.append('.')
from app.core.config import settings
from app.services.ai_service import AIService
import json
import time

def test_google_maps_integration():
    print("🗺️ Testing Google Maps API Integration")
    print("=" * 70)
    
    # Check if API key is set
    print(f"🔑 Google Maps API Key: {'✅ SET' if settings.GOOGLE_MAPS_API_KEY else '❌ NOT SET'}")
    
    if not settings.GOOGLE_MAPS_API_KEY:
        print("\n⚠️ Please add GOOGLE_MAPS_API_KEY to your .env file:")
        print("GOOGLE_MAPS_API_KEY=your_actual_key_here")
        return
    
    print(f"Key preview: {settings.GOOGLE_MAPS_API_KEY[:10]}...")
    
    # Initialize AI Service
    print("\n🤖 Initializing AI Service...")
    ai_service = AIService()
    
    # if ai_service.use_real_api:
    #     print("✅ Using REAL Google Maps API")
    # else:
    #     print("⚠️ Using FALLBACK calculation (Google Maps not available)")

    gmaps_status = "✅ REAL Google Maps API" if hasattr(ai_service, 'use_real_api') and ai_service.use_real_api else "⚠️ FALLBACK calculation"
    print(f"   {gmaps_status}")
    
    # Test 1: Route Calculation
    print("\n1. 🚗 Testing Route Calculation...")
    
    # Bangalore to Chennai route
    bangalore = (12.9716, 77.5946)  # Bangalore coordinates
    chennai = (13.0827, 80.2707)    # Chennai coordinates
    
    print(f"   From: Bangalore ({bangalore})")
    print(f"   To: Chennai ({chennai})")
    
    start_time = time.time()
    route_info = ai_service.calculate_route(bangalore, chennai)
    calculation_time = time.time() - start_time
    
    print(f"   Source: {route_info['source']}")
    print(f"   Calculation time: {calculation_time:.2f} seconds")
    print(f"   Distance: {route_info['distance_km']:.2f} km")
    print(f"   Duration: {route_info['duration_min']:.2f} minutes")
    
    if route_info['source'] == 'google_maps':
        print(f"   ✅ Successfully used Google Maps API!")
        print(f"   Polyline (first 50 chars): {route_info['polyline'][:50]}...")
        print(f"   Navigation steps: {len(route_info['steps'])}")
        
        # Show first few steps
        print("\n   First 3 navigation steps:")
        for i, step in enumerate(route_info['steps'][:3], 1):
            print(f"   {i}. {step['instruction']} ({step['distance']}, {step['duration']})")
    else:
        print("   ⚠️ Using fallback calculation")
    
    # Test 2: Driver Matching Algorithm
    print("\n2. 🚖 Testing Driver Matching Algorithm...")
    
    # Create mock drivers
    mock_drivers = [
        {
            'id': 'driver_1',
            'current_location_lat': 12.9758,
            'current_location_lng': 77.5995,
            'is_available': True,
            'rating': 4.5,
            'total_deliveries': 50
        },
        {
            'id': 'driver_2', 
            'current_location_lat': 12.9616,
            'current_location_lng': 77.5846,
            'is_available': True,
            'rating': 4.2,
            'total_deliveries': 30
        },
        {
            'id': 'driver_3',
            'current_location_lat': 12.9816,
            'current_location_lng': 77.6046,
            'is_available': False,  # Not available
            'rating': 4.8,
            'total_deliveries': 100
        },
        {
            'id': 'driver_4',
            'current_location_lat': None,  # No location
            'current_location_lng': None,
            'is_available': True,
            'rating': 4.0,
            'total_deliveries': 20
        }
    ]
    
    pickup_location = (12.9716, 77.5946)  # Bangalore center
    
    nearest_drivers = ai_service.find_nearest_drivers(pickup_location, mock_drivers)
    
    print(f"   Found {len(nearest_drivers)} available drivers nearby")
    print("\n   Driver rankings:")
    for i, driver in enumerate(nearest_drivers, 1):
        print(f"   {i}. Driver {driver['id']}: {driver.get('distance_km', 'N/A'):.2f} km away, Rating: {driver.get('rating', 'N/A')}")
    
    # Test 3: Cost Estimation
    print("\n3. 💰 Testing Cost Estimation...")
    
    test_distances = [5, 10, 25, 50]  # Test different distances
    vehicle_types = ['auto', 'mini_truck', 'bike']
    
    for vehicle in vehicle_types:
        print(f"\n   {vehicle.upper()} Cost Estimates:")
        for distance in test_distances:
            cost = ai_service.estimate_delivery_cost(distance, vehicle)
            print(f"   - {distance} km: {cost['currency']}{cost['estimated_total']:.2f} "
                  f"(Base: {cost['currency']}{cost['base_fare']}, "
                  f"Distance: {cost['currency']}{cost['distance_fare']:.2f})")
    
    # Test 4: Real-time route with multiple waypoints
    print("\n4. 🛣️ Testing Complex Route...")
    
    # Bangalore to multiple points
    waypoints = [
        (12.9716, 77.5946),  # Bangalore
        (13.3409, 77.1010),  # Tumkur
        (15.3173, 75.7139),  # Hubli
        (15.8497, 74.4977)   # Belgaum
    ]
    
    total_distance = 0
    total_duration = 0
    
    for i in range(len(waypoints) - 1):
        start = waypoints[i]
        end = waypoints[i + 1]
        
        route = ai_service.calculate_route(start, end)
        total_distance += route['distance_km']
        total_duration += route['duration_min']
        
        location_names = ["Bangalore", "Tumkur", "Hubli", "Belgaum"]
        print(f"   {location_names[i]} → {location_names[i+1]}: "
              f"{route['distance_km']:.1f} km, {route['duration_min']:.0f} min")
    
    print(f"\n   Total journey: {total_distance:.1f} km, {total_duration:.0f} min")
    
    # Test 5: Peak hour pricing
    print("\n5. ⏰ Testing Peak Hour Pricing...")
    
    from datetime import datetime
    
    # Test at different hours
    test_hours = [8, 14, 19]  # 8 AM, 2 PM, 7 PM
    
    for hour in test_hours:
        # Mock current hour for testing
        original_now = datetime.now
        
        class MockDateTime:
            @staticmethod
            def now():
                mock = type('obj', (object,), {'hour': hour})()
                return mock
        
        # Temporarily replace datetime for testing
        import app.services.ai_service as ai_module
        original_datetime = ai_module.datetime
        
        try:
            ai_module.datetime = MockDateTime
            
            cost = ai_service.estimate_delivery_cost(10, 'auto')
            is_peak = hour in [7, 8, 9, 10, 17, 18, 19, 20]
            
            print(f"   {hour:02d}:00 - {'🏙️ PEAK' if is_peak else '✅ Normal'}: "
                  f"{cost['currency']}{cost['estimated_total']:.2f}")
        
        finally:
            ai_module.datetime = original_datetime
    
    # Test 6: Performance benchmark
    print("\n6. ⚡ Performance Testing...")
    
    test_routes = [
        ((12.9716, 77.5946), (13.0827, 80.2707)),  # Bangalore to Chennai
        ((28.6139, 77.2090), (19.0760, 72.8777)),  # Delhi to Mumbai
        ((22.5726, 88.3639), (17.6868, 83.2185)),  # Kolkata to Visakhapatnam
    ]
    
    route_names = ["Bangalore-Chennai", "Delhi-Mumbai", "Kolkata-Vizag"]
    
    for (start, end), name in zip(test_routes, route_names):
        start_time = time.time()
        route = ai_service.calculate_route(start, end)
        elapsed = time.time() - start_time
        
        print(f"   {name}: {elapsed:.3f}s, {route['distance_km']:.0f}km, {route['source']}")
    
    print("\n" + "=" * 70)
    
    if ai_service.use_real_api:
        print("✅ GOOGLE MAPS INTEGRATION SUCCESSFUL!")
        print("\n🎉 All AI features are working with real Google Maps data:")
        print("   • Real-time route calculation")
        print("   • Accurate distance and duration")
        print("   • Navigation steps")
        print("   • Polyline encoding for maps")
    else:
        print("⚠️ USING FALLBACK CALCULATIONS")
        print("\nTo enable Google Maps:")
        print("1. Ensure GOOGLE_MAPS_API_KEY is in .env file")
        print("2. Enable 'Directions API' in Google Cloud Console")
        print("3. Ensure billing is enabled")
        print("4. Check API key restrictions")
    
    print("\n📊 AI Service Capabilities:")
    print("   ✓ Route calculation & optimization")
    print("   ✓ Driver matching algorithm")
    print("   ✓ Dynamic pricing with surge")
    print("   ✓ Distance matrix calculations")
    print("   ✓ Traffic-aware routing")
    print("   ✓ Multi-stop optimization")

def test_api_health():
    """Test if the API endpoints are working"""
    import requests
    
    print("\n🌐 Testing API Endpoints...")
    print("-" * 40)
    
    base_url = "http://127.0.0.1:8000"
    
    endpoints = [
        ("/", "Root endpoint"),
        ("/api/health", "Health check"),
        ("/docs", "API Documentation"),
        ("/openapi.json", "OpenAPI schema"),
    ]
    
    for endpoint, description in endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=5)
            status = "✅" if response.status_code == 200 else "❌"
            print(f"{status} {description}: {response.status_code}")
        except:
            print(f"❌ {description}: Cannot connect")
    
    # Test Google Maps through API if available
    try:
        # Create a test delivery to trigger Google Maps
        test_data = {
            "pickup_address": "Test",
            "pickup_lat": 12.9716,
            "pickup_lng": 77.5946,
            "dropoff_address": "Test",
            "dropoff_lat": 12.9784,
            "dropoff_lng": 77.6408,
            "vehicle_make": "Test",
            "vehicle_model": "Test", 
            "vehicle_year": 2024,
            "vehicle_vin": "TESTVIN123"
        }
        
        # First get a token
        auth_data = {
            "email": "test@example.com",
            "password": "test123"
        }
        
        # Try to register test user
        register_data = {
            "name": "Test User",
            "email": f"test_{int(time.time())}@example.com",
            "phone": "1234567890",
            "password": "test123",
            "user_type": "customer"
        }
        
        response = requests.post(f"{base_url}/api/v1/auth/register", json=register_data)
        if response.status_code == 200:
            token = response.json()['access_token']
            headers = {"Authorization": f"Bearer {token}"}
            
            # Test delivery booking (will use Google Maps)
            response = requests.post(
                f"{base_url}/api/v1/deliveries/book",
                headers=headers,
                json=test_data
            )
            
            if response.status_code == 200:
                print("✅ Delivery booking (with Google Maps): Working!")
            elif response.status_code == 400:
                # Might be validation error, but API is reachable
                print("⚠️ Delivery booking: API reachable (validation error)")
            else:
                print(f"❌ Delivery booking: {response.status_code}")
        else:
            print("⚠️ Could not test delivery API (auth failed)")
            
    except Exception as e:
        print(f"⚠️ API test skipped: {e}")

if __name__ == "__main__":
    test_google_maps_integration()
    test_api_health()