from sqlalchemy.orm import Session
from datetime import timedelta
from app.models.user import User
from app.models.driver import Driver
from app.models.customer import Customer
from app.utils.security import (
    verify_password, 
    get_password_hash, 
    create_access_token,
    decode_token
)
from app.core.config import settings

class AuthService:
    
    @staticmethod
    def register_user(db: Session, user_data: dict):
        """Register a new user with proper validation"""
        # Check if user exists
        existing_user = db.query(User).filter(
            (User.email == user_data["email"]) | (User.phone == user_data["phone"])
        ).first()
        
        if existing_user:
            return None, "Email or phone already registered"
        
        # Create user
        user = User(
            name=user_data["name"],
            email=user_data["email"],
            phone=user_data["phone"],
            password_hash=get_password_hash(user_data["password"]),
            user_type=user_data["user_type"]
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Create profile based on user type
        if user_data["user_type"] == "driver":
            driver = Driver(id=user.id)
            db.add(driver)
        elif user_data["user_type"] == "customer":
            customer = Customer(id=user.id)
            db.add(customer)
        
        db.commit()
        
        # Create token
        token_data = {"sub": user.email, "user_id": user.id, "user_type": user.user_type}
        access_token = create_access_token(token_data)
        
        return {
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "phone": user.phone,
                "user_type": user.user_type,
                "is_active": user.is_active
            },
            "access_token": access_token,
            "token_type": "bearer"
        }, None
    
    @staticmethod
    def login_user(db: Session, email: str, password: str):
        """Authenticate user"""
        user = db.query(User).filter(User.email == email).first()
        
        if not user or not verify_password(password, user.password_hash):
            return None, "Invalid credentials"
        
        if not user.is_active:
            return None, "Account is disabled"
        
        # Create token
        token_data = {"sub": user.email, "user_id": user.id, "user_type": user.user_type}
        access_token = create_access_token(token_data)
        
        return {
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "phone": user.phone,
                "user_type": user.user_type,
                "is_active": user.is_active
            },
            "access_token": access_token,
            "token_type": "bearer"
        }, None
    
    @staticmethod
    def get_current_user(db: Session, token: str):
        """Get user from token"""
        payload = decode_token(token)
        if not payload:
            return None, "Invalid token"
        
        user_id = payload.get("user_id")
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            return None, "User not found"
        
        return user, None
    def update_user(db: Session, user: User, data: dict):
        for field, value in data.items():
            if hasattr(user, field) and value is not None:
                setattr(user, field, value)

        db.commit()
        db.refresh(user)
        return user
