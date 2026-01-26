# File: app/services/delivery_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.delivery import Delivery, DeliveryStatus
from app.models.driver import Driver
from app.models.customer import Customer
from app.services.ai_service import AIService
from typing import Tuple, Dict, Optional 
import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy import update
import json


class DeliveryService:
    
    @staticmethod
    def book_delivery(db: Session, customer_id: str, delivery_data: Dict) -> Tuple[Optional[Delivery], str]:
        """Book a new delivery with AI driver assignment"""
        try:
            # 1. Get customer
            customer = db.query(Customer).filter(Customer.id == customer_id).first()
            if not customer:
                return None, "Customer not found"
            
            # 2. Calculate route using AI
            ai_service = AIService()
            route_info = ai_service.calculate_route(
                (delivery_data['pickup_lat'], delivery_data['pickup_lng']),
                (delivery_data['dropoff_lat'], delivery_data['dropoff_lng'])
            )
            
            # 3. Find nearest available driver
            available_drivers = db.query(Driver).filter(
                Driver.is_available == True,
                Driver.current_location_lat.isnot(None),
                Driver.current_location_lng.isnot(None)
            ).all()
            
            drivers_list = [
                {
                    'id': driver.id,
                    'current_location_lat': driver.current_location_lat,
                    'current_location_lng': driver.current_location_lng,
                    'is_available': driver.is_available,
                    'rating': driver.overall_rating
                }
                for driver in available_drivers
            ]
            
            nearest_drivers = ai_service.find_nearest_drivers(
                (delivery_data['pickup_lat'], delivery_data['pickup_lng']),
                drivers_list
            )
            
            suggested_driver_id = nearest_drivers[0]['id'] if nearest_drivers else None
            
            # 4. Calculate estimated cost
            base_rate = 50  # ₹50 base
            distance_rate = 15  # ₹15 per km
            estimated_cost = round(base_rate + (route_info['distance_km'] * distance_rate),2)
            vin = delivery_data.get("vehicle_vin")
            if vin in ("TBD", "", None):
                vin = None
            # 5. Create delivery
            delivery = Delivery(
                id=str(uuid.uuid4()),
                customer_id=customer_id,
                suggested_driver_id=suggested_driver_id,
                pickup_address=delivery_data['pickup_address'],
                pickup_lat=delivery_data['pickup_lat'],
                pickup_lng=delivery_data['pickup_lng'],
                dropoff_address=delivery_data['dropoff_address'],
                dropoff_lat=delivery_data['dropoff_lat'],
                dropoff_lng=delivery_data['dropoff_lng'],
                vehicle_make=delivery_data['vehicle_make'],
                vehicle_model=delivery_data['vehicle_model'],
                vehicle_year=delivery_data['vehicle_year'],
                vehicle_vin=vin,
                estimated_distance=route_info['distance_km'],
                estimated_time=route_info['duration_min'],
                estimated_cost=estimated_cost,
                optimal_route=json.dumps(route_info['polyline']),
                scheduled_pickup=delivery_data.get('scheduled_pickup') or datetime.utcnow() + timedelta(minutes=30)
            )
            
            db.add(delivery)
            db.commit()
            db.refresh(delivery)
            
            return delivery, None
            
        except Exception as e:
            db.rollback()
            return None, str(e)
        
    @staticmethod
    def get_user_deliveries(db: Session, user_id: str, user_type: str):
        if user_type == "customer":
            return db.query(Delivery).filter(
                Delivery.customer_id == user_id
            ).all()

        if user_type == "driver":
            return db.query(Delivery).filter(
                Delivery.driver_id == user_id
            ).all()

        return []
    @staticmethod
    def get_delivery_by_id(db, delivery_id: str, user_id: str):
        delivery = (
        db.query(Delivery)
        .filter(Delivery.id == delivery_id)
        .first()
    )

        if not delivery:
            raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delivery not found"
        )

    # Ownership check (customer only)
        if delivery.customer_id != user_id:
            raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this delivery"
        )

        return delivery
    
    @staticmethod
    def assign_driver(db, delivery_id: str, driver_id: str):
        delivery = db.query(Delivery).filter(
            Delivery.id == delivery_id
        ).first()

        if not delivery:
            return None, "Delivery not found"

        if delivery.driver_id is not None:
            return None, "Delivery already assigned"

        delivery.driver_id = driver_id
        delivery.status = "assigned"

        db.add(delivery)
        db.commit()
        db.refresh(delivery)

        return delivery, None
    @staticmethod
    def force_assign_driver(db, delivery_id: str, driver_id: str):
        result = db.execute(
            update(Delivery)
            .where(Delivery.id == delivery_id)
            .values(
                driver_id=driver_id,
                status="assigned"
            )
        )

        if result.rowcount == 0:
            return None, "Delivery not found"

        db.commit()

        delivery = db.query(Delivery).filter(
            Delivery.id == delivery_id
        ).first()

        return delivery, None
    

    @staticmethod
    def start_trip(db, delivery_id: str, driver_id: str):
        delivery = db.query(Delivery).filter(
            Delivery.id == delivery_id,
            Delivery.driver_id == driver_id
        ).first()

        if not delivery:
            return None, "Delivery not found or not assigned to you"

        if delivery.status != DeliveryStatus.ASSIGNED.value:
            return None, "Trip cannot be started"

        # ✅ NO TIME CHECK
        delivery.status = DeliveryStatus.IN_TRANSIT.value
        delivery.actual_pickup = datetime.utcnow()

        db.commit()
        db.refresh(delivery)

        return delivery, None

    @staticmethod
    def complete_trip(db, delivery_id: str, driver_id: str):
        delivery = db.query(Delivery).filter(
            Delivery.id == delivery_id,
            Delivery.driver_id == driver_id
        ).first()

        if not delivery:
            return None, "Delivery not found or not assigned to you"
        
        db.refresh(delivery)

        if delivery.status != "in_transit":
            return None, f"Trip cannot be completed (current status: {delivery.status})"

        delivery.status = DeliveryStatus.COMPLETED.value
        delivery.actual_delivery = datetime.utcnow()

        db.commit()
        db.refresh(delivery)

        return delivery, None