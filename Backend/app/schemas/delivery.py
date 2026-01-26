# File: app/schemas/delivery.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

# class DeliveryStatus(str):
#     PENDING = "pending"
#     ASSIGNED = "assigned"
#     PICKED_UP = "picked_up"
#     IN_TRANSIT = "in_transit"
#     DELIVERED = "delivered"
#     CANCELLED = "cancelled"

class DeliveryCreate(BaseModel):
    pickup_address: str
    pickup_lat: float = Field(..., ge=-90, le=90)
    pickup_lng: float = Field(..., ge=-180, le=180)
    dropoff_address: str
    dropoff_lat: float = Field(..., ge=-90, le=90)
    dropoff_lng: float = Field(..., ge=-180, le=180)
    vehicle_make: str
    vehicle_model: str
    vehicle_year: int
    vehicle_vin: str
    scheduled_pickup: Optional[datetime] = None

class AssignedDriver(BaseModel):
    name: str
    vehicle_number: Optional[str] = None
    phone: str | None = None

class DeliveryResponse(BaseModel):
    id: str
    customer_id: str
    driver_id: Optional[str]
    pickup_address: str
    pickup_lat: float
    pickup_lng: float
    dropoff_address: str
    dropoff_lat: float
    dropoff_lng: float
    status: str
    estimated_distance: Optional[float]
    scheduled_pickup: Optional[datetime] 
    estimated_time: Optional[float]
    estimated_cost: Optional[float]
    created_at: datetime
    assigned_driver: AssignedDriver | None = None
    customer: CustomerInfo | None
    new_payment_status: Optional[str] = "pending"

    
class Config:
    from_attributes = True

class CustomerInfo(BaseModel):
    name: str
    phone: str | None = None
