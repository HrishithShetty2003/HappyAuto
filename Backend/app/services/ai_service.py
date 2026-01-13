# File: app/services/ai_service.py
import json
import math
from typing import Dict, List, Tuple, Optional
from app.core.config import settings
from datetime import datetime

class AIService:
    def __init__(self):
        self.use_real_api = False
        self.gmaps = None
        self.api_error = None
        
        # Try to use real Google Maps if API key is available
        if settings.GOOGLE_MAPS_API_KEY and settings.GOOGLE_MAPS_API_KEY.strip():
            try:
                import googlemaps
                self.gmaps = googlemaps.Client(key=settings.GOOGLE_MAPS_API_KEY)
                self.use_real_api = True
                print("✅ Google Maps API initialized successfully")
            except ImportError:
                self.api_error = "Google Maps module not installed"
                print(f"⚠️  {self.api_error}")
            except Exception as e:
                self.api_error = str(e)
                print(f"⚠️  Google Maps initialization error: {e}")
        else:
            self.api_error = "No Google Maps API key configured"
            print(f"⚠️  {self.api_error}")
    
    def calculate_route(
        self, 
        origin: Tuple[float, float], 
        destination: Tuple[float, float]
    ) -> Dict:
        """Calculate optimal route - uses Google Maps API if available, otherwise fallback"""
        
        if self.use_real_api and self.gmaps:
            try:
                return self._calculate_route_google(origin, destination)
            except Exception as e:
                print(f"⚠️  Google Maps API error during calculation: {e}")
                # Fall back to calculation
                return self._calculate_route_fallback(origin, destination)
        else:
            return self._calculate_route_fallback(origin, destination)
    
    def _calculate_route_google(
        self, 
        origin: Tuple[float, float], 
        destination: Tuple[float, float]
    ) -> Dict:
        """Calculate route using Google Maps API"""
        try:
            directions = self.gmaps.directions(
                origin=origin,
                destination=destination,
                mode="driving",
                alternatives=True
            )
            
            if not directions:
                raise ValueError("No directions returned from Google Maps")
            
            # Choose best route (shortest distance)
            best_route = min(directions, key=lambda x: x['legs'][0]['distance']['value'])
            
            return {
                "distance_km": best_route['legs'][0]['distance']['value'] / 1000,
                "duration_min": best_route['legs'][0]['duration']['value'] / 60,
                "polyline": best_route['overview_polyline']['points'],
                "steps": [
                    {
                        "instruction": step['html_instructions'],
                        "distance": step['distance']['text'],
                        "duration": step['duration']['text']
                    }
                    for step in best_route['legs'][0]['steps']
                ],
                "source": "google_maps"
            }
        except Exception as e:
            print(f"⚠️  Google Maps API error: {e}")
            # Re-raise to be caught by calculate_route
            raise
    
    def _calculate_route_fallback(
        self, 
        origin: Tuple[float, float], 
        destination: Tuple[float, float]
    ) -> Dict:
        """Fallback route calculation using Haversine formula"""
        lat1, lon1 = origin
        lat2, lon2 = destination
        
        # Haversine formula for distance
        R = 6371  # Earth's radius in km
        
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        
        a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        distance_km = R * c
        
        # Estimate time (assume 30 km/h average speed in city traffic)
        duration_min = (distance_km / 30) * 60
        
        # Generate a simple polyline (for demo purposes)
        polyline = self._generate_simple_polyline(origin, destination)
        
        return {
            "distance_km": round(distance_km, 2),
            "duration_min": round(duration_min, 2),
            "polyline": polyline,
            "steps": [
                {
                    "instruction": f"Start at coordinates {origin}",
                    "distance": f"{round(distance_km/2, 2)} km",
                    "duration": f"{round(duration_min/2, 1)} mins"
                },
                {
                    "instruction": f"Continue to destination {destination}",
                    "distance": f"{round(distance_km/2, 2)} km",
                    "duration": f"{round(duration_min/2, 1)} mins"
                }
            ],
            "source": "fallback_calculation"
        }
    
    def _generate_simple_polyline(self, origin: Tuple[float, float], destination: Tuple[float, float]) -> str:
        """Generate a simple encoded polyline for demonstration"""
        # This is a very simplified version - real polyline encoding is complex
        lat1, lon1 = origin
        lat2, lon2 = destination
        
        # For demo, just return coordinates as string
        return f"{lat1},{lon1};{lat2},{lon2}"
    
    def find_nearest_drivers(
        self, 
        pickup_location: Tuple[float, float], 
        drivers: List[Dict],
        max_distance_km: float = 10.0
    ) -> List[Dict]:
        """Find nearest available drivers within max_distance_km"""
        
        pickup_lat, pickup_lng = pickup_location
        
        for driver in drivers:
            if not (driver.get('current_location_lat') and driver.get('current_location_lng')):
                driver['distance_km'] = float('inf')
                continue
            
            lat1, lon1 = math.radians(pickup_lat), math.radians(pickup_lng)
            lat2, lon2 = math.radians(driver['current_location_lat']), math.radians(driver['current_location_lng'])
            
            dlat = lat2 - lat1
            dlon = lon2 - lon1
            
            a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
            
            driver['distance_km'] = 6371 * c  # Distance in km
        
        # Filter available drivers within range and sort by distance
        available_drivers = [
            d for d in drivers 
            if d.get('is_available', False) and d.get('distance_km', float('inf')) <= max_distance_km
        ]
        
        return sorted(available_drivers, key=lambda x: x['distance_km'])
    
    def estimate_delivery_cost(
        self,
        distance_km: float,
        vehicle_type: str = "auto"
    ) -> Dict:
        """Estimate delivery cost based on distance and vehicle type"""
        
        # Base rates (in ₹)
        base_rates = {
            "auto": 50,
            "mini_truck": 100,
            "truck": 200,
            "bike": 30
        }
        
        # Per km rates (in ₹)
        per_km_rates = {
            "auto": 15,
            "mini_truck": 25,
            "truck": 40,
            "bike": 10
        }
        
        vehicle = vehicle_type.lower()
        base_rate = base_rates.get(vehicle, base_rates["auto"])
        per_km_rate = per_km_rates.get(vehicle, per_km_rates["auto"])
        
        estimated_cost = base_rate + (distance_km * per_km_rate)
        
        # Add surge pricing during peak hours (simplified)
        hour = datetime.now().hour
        if 7 <= hour <= 10 or 17 <= hour <= 20:  # Peak hours
            surge_multiplier = 1.2
            estimated_cost *= surge_multiplier
        
        return {
            "base_fare": base_rate,
            "distance_fare": round(distance_km * per_km_rate, 2),
            "estimated_total": round(estimated_cost, 2),
            "currency": "₹",
            "vehicle_type": vehicle,
            "distance_km": round(distance_km, 2)
        }