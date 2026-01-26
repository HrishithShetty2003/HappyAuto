from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey
from datetime import datetime, timezone
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid
import enum

class DeliveryStatus(str, enum.Enum):
    PENDING = "pending"
    ASSIGNED = "assigned"
    # PICKED_UP = "picked_up"
    IN_TRANSIT = "in_transit"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    customer_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    driver_id = Column(String(36), ForeignKey("drivers.id"), nullable=True)

    pickup_address = Column(String(500), nullable=False)
    pickup_lat = Column(Float, nullable=False)
    pickup_lng = Column(Float, nullable=False)

    dropoff_address = Column(String(500), nullable=False)
    dropoff_lat = Column(Float, nullable=False)
    dropoff_lng = Column(Float, nullable=False)

    vehicle_make = Column(String(100))
    vehicle_model = Column(String(100))
    vehicle_year = Column(Integer)

    vehicle_vin = Column(String, unique=True, nullable=True)

    status = Column(String(20), default=DeliveryStatus.PENDING.value)

    estimated_distance = Column(Float)
    estimated_time = Column(Float)
    estimated_cost = Column(Float)

    actual_distance = Column(Float)
    actual_time = Column(Float)
    actual_cost = Column(Float)

    suggested_driver_id = Column(String(36), ForeignKey("drivers.id"), nullable=True)

    optimal_route = Column(String)
    predicted_traffic = Column(String(50))

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    scheduled_pickup = Column(DateTime(timezone=True))
    actual_pickup = Column(DateTime(timezone=True))
    actual_delivery = Column(DateTime(timezone=True))

    customer = relationship("User", back_populates="deliveries")

    driver = relationship(
        "Driver",
        foreign_keys=[driver_id],
        back_populates="deliveries"
    )

    suggested_driver = relationship(
        "Driver",
        foreign_keys=[suggested_driver_id],
        back_populates="suggested_deliveries"
    )
    new_payment_status = Column(String(20), default="pending")

