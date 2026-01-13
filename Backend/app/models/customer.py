from sqlalchemy import Column, String, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(String(36), ForeignKey('users.id'), primary_key=True)
    
    # Statistics
    total_bookings = Column(Integer, default=0)
    total_spent = Column(Float, default=0.0)
    member_since = Column(String(20))  # e.g., "2024-01-15"
    
    # Preferences
    preferred_payment = Column(String(50), default="cash")
    notification_preferences = Column(String, default='{"email": true, "sms": true, "push": true}')
    
    # Relationship
    user = relationship("User", backref="customer_profile", uselist=False, single_parent=True, cascade="all, delete-orphan")    
    def __repr__(self):
        return f"<Customer {self.id}>"