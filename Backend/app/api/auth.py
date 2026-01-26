from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import Dict, Optional
from app.schemas.user import UserUpdate
from app.models.user import User
from app.services.auth_service import AuthService
from app.core.database import get_db
from app.models.driver import Driver
from pydantic import BaseModel, EmailStr, field_validator # Updated for Pydantic v2

router = APIRouter(tags=["authentication"])
# PASTE THIS AT THE TOP OF THE FILE, UNDER THE ROUTER DEFINITION
@router.get("/test")
async def test_route():
    return {"message": "Router is working!"}
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user_dep(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    print("🔥 TOKEN RECEIVED:", token)
    user, error = AuthService.get_current_user(db, token)
    user, error = AuthService.get_current_user(db, token)
    if error or not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    return user

# -----------------------------
# Pydantic Models
# -----------------------------

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    user_type: str
    driver_license_number: Optional[str] = None
    vehicle_plate_number: Optional[str] = None

    @field_validator("driver_license_number")
    @classmethod
    def validate_driver_license(cls, v, info: ValidationInfo):
        user_type = info.data.get("user_type")

        if user_type == "driver" and not v:
            raise ValueError("Driver license number is required for drivers")
        return v

    @field_validator("vehicle_plate_number")
    @classmethod
    def validate_vehicle_plate(cls, v, info: ValidationInfo):
        user_type = info.data.get("user_type")

        if user_type == "driver" and not v:
            raise ValueError("Vehicle number plate is required for drivers")
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str


# -----------------------------
# Routes
# -----------------------------

@router.post("/register", response_model=Dict)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    try:
        # 1️⃣ Create user (DO NOT COMMIT YET)
        result, error = AuthService.register_user(db, user_data.dict())

        if error:
            raise HTTPException(status_code=400, detail=error)

        
        user_dict = result["user"]
        user_id = user_dict["id"]

        # 2️⃣ If driver → create driver profile
        if user_data.user_type == "driver":
            existing_driver = db.query(Driver).filter(
                Driver.id == user_id
            ).first()

            if not existing_driver:
                driver = Driver(
                    id=user_id,
                    license_number=user_data.driver_license_number,
                    vehicle_number=user_data.vehicle_plate_number,
                    is_available=False,
                    current_status="offline"
                )
                db.add(driver)

        # 3️⃣ COMMIT ONCE (ATOMIC)
        db.commit()

        return {
            "success": True,
            "message": "User registered successfully",
            "user": user_dict,
            "access_token": result["access_token"] # Ensure token is returned
        }

    except Exception as e:
        db.rollback()   # 🔴 THIS FIXES YOUR BUG
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

@router.post("/login", response_model=Dict)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user"""

    result, error = AuthService.login_user(
        db,
        credentials.email,
        credentials.password
    )

    if error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error
        )

    return {
        "success": True,
        "message": "Login successful",
        **result
    }


@router.get("/me", response_model=Dict)
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """Get current user - SAFE MODE"""
    
    try:
        user, error = AuthService.get_current_user(db, token)
        
        if error:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=error
            )

        response = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "user_type": user.user_type,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        }

        # Safe access to driver profile
        try:
            if user.user_type == "driver" and user.driver_profile:
                response["driver"] = {
                    "license_number": user.driver_profile.license_number,
                    "vehicle_number": user.driver_profile.vehicle_number,
                    "current_status": user.driver_profile.current_status,
                }
        except Exception:
            pass # Ignore profile error, just return basic info

        return response

    except HTTPException:
        raise
    except Exception as e:
        # Catch all errors to prevent server crash
        print(f"❌ ERROR in /auth/me: {e}")
        import traceback
        traceback.print_exc()
        
        # Return error response instead of crashing
        return {
            "id": "error",
            "name": "Error",
            "email": "error",
            "user_type": "error",
            "error_detail": str(e)
        }
        
@router.put("/me", response_model=dict)
def update_profile(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dep),
):
    for field, value in data.dict(exclude_unset=True).items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)

    return {"success": True}

