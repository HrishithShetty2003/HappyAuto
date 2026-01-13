from sqlalchemy import Column, String, Float, Integer, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Driver(Base):
    __tablename__ = "drivers"
    
    id = Column(String(36), ForeignKey('users.id'), primary_key=True)
    license_number = Column(String(50), unique=True, nullable=True)
    vehicle_number = Column(String(20), unique=True, nullable=True)
    vehicle_type = Column(String(50))
    vehicle_model = Column(String(100))
    vehicle_color = Column(String(50))
    license_image = Column(Text)  # URL to stored image
    rc_image = Column(Text)  # URL to RC image
    insurance_image = Column(Text)  # URL to insurance image
    
    # Bank details
    bank_account_number = Column(String(50))
    bank_ifsc_code = Column(String(20))
    bank_account_holder = Column(String(100))
    
    # Statistics
    overall_rating = Column(Float, default=0.0)
    total_ratings = Column(Integer, default=0)
    total_deliveries = Column(Integer, default=0)
    total_earnings = Column(Float, default=0.0)
    acceptance_rate = Column(Float, default=0.0)
    
    # Status
    is_available = Column(Boolean, default=False)
    current_location_lat = Column(Float)
    current_location_lng = Column(Float)
    current_status = Column(String(20), default="offline")  # offline, online, busy
    
    # Relationship
    user = relationship("User", backref="driver_profile", uselist=False, single_parent=True, cascade="all, delete-orphan")
    deliveries = relationship(
        "Delivery",
        foreign_keys="Delivery.driver_id",
        back_populates="driver"
    )

    suggested_deliveries = relationship(
        "Delivery",
        foreign_keys="Delivery.suggested_driver_id",
        back_populates="suggested_driver"
    )


    def __repr__(self):
        return f"<Driver {self.vehicle_number}>"