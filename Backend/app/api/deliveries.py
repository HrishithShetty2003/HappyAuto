from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List

from app.schemas.delivery import (
    DeliveryCreate,
    DeliveryResponse,
    AssignedDriver
)
from app.services.delivery_service import DeliveryService
from app.core.database import get_db
from app.services.auth_service import AuthService
from app.models.user import User
from app.models.delivery import Delivery
from app.models.driver import Driver 
from pydantic import BaseModel

router = APIRouter(tags=["deliveries"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# -------------------------
# AUTH DEPENDENCY
# -------------------------
def get_current_user_dep(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    user, error = AuthService.get_current_user(db, token)

    if error or not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    return user


# -------------------------
# HELPER: ATTACH ASSIGNED DRIVER
# -------------------------
def attach_assigned_driver(delivery: Delivery) -> DeliveryResponse:
    """
    Attach assigned driver details (name + vehicle number)
    to DeliveryResponse for customer visibility.
    """
    assigned_driver = None
    customer_info = None

    if delivery.driver:
        assigned_driver = AssignedDriver(
            name=delivery.driver.user.name,
            vehicle_number=delivery.driver.vehicle_number
        )

    if delivery.customer:
        customer_info = {
            "name": delivery.customer.name,
            "phone": delivery.customer.phone
        }

    return DeliveryResponse(
        id=delivery.id,
        customer_id=delivery.customer_id,
        driver_id=delivery.driver_id,

        pickup_address=delivery.pickup_address,
        pickup_lat=delivery.pickup_lat,
        pickup_lng=delivery.pickup_lng,
        dropoff_address=delivery.dropoff_address,
        dropoff_lat=delivery.dropoff_lat,
        dropoff_lng=delivery.dropoff_lng,
        status=delivery.status,

        estimated_distance=delivery.estimated_distance,
        estimated_time=delivery.estimated_time,
        estimated_cost=delivery.estimated_cost,

        scheduled_pickup=delivery.scheduled_pickup,
        created_at=delivery.created_at,

        assigned_driver=assigned_driver,
        customer=customer_info
    )


# -------------------------
# CUSTOMER: BOOK DELIVERY
# -------------------------
@router.post("/book", response_model=DeliveryResponse)
async def book_delivery(
    delivery_data: DeliveryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dep)
):
    if current_user.user_type != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers can book deliveries"
        )

    delivery, error = DeliveryService.book_delivery(
        db,
        current_user.id,
        delivery_data.dict()
    )

    if error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error
        )

    return attach_assigned_driver(delivery)


# -------------------------
# CUSTOMER / DRIVER: MY DELIVERIES
# -------------------------
@router.get("/my-deliveries", response_model=List[DeliveryResponse])
def get_my_deliveries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dep),
):
    if current_user.user_type == "customer":
        deliveries = db.query(Delivery).filter(
            Delivery.customer_id == current_user.id
        ).all()

    elif current_user.user_type == "driver":
        deliveries = db.query(Delivery).filter(
            Delivery.driver_id == current_user.id
        ).all()

    else:
        deliveries = []

    return [attach_assigned_driver(d) for d in deliveries]


# -------------------------
# DRIVER: VIEW UNASSIGNED DELIVERIES
# -------------------------
@router.get("/unassigned", response_model=List[DeliveryResponse])
async def get_unassigned_deliveries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dep)
):
    if current_user.user_type != "driver":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Drivers only"
        )

    deliveries = (
        db.query(Delivery)
        .filter(
            Delivery.driver_id.is_(None),
            Delivery.status == "pending"
        )
        .all()
    )

    return [attach_assigned_driver(d) for d in deliveries]


# -------------------------
# DRIVER: ACCEPT DELIVERY
# -------------------------
@router.post("/{delivery_id}/accept", response_model=DeliveryResponse)
async def accept_delivery(
    delivery_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dep)
):
    if current_user.user_type != "driver":
        raise HTTPException(status_code=403, detail="Drivers only")

    delivery, error = DeliveryService.force_assign_driver(
        db=db,
        delivery_id=delivery_id,
        driver_id=current_user.id
    )

    if error:
        raise HTTPException(status_code=400, detail=error)

    return attach_assigned_driver(delivery)


# -------------------------
# CUSTOMER / DRIVER: GET DELIVERY BY ID
# -------------------------
@router.get("/{delivery_id}", response_model=DeliveryResponse)
async def get_delivery(
    delivery_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dep)
):
    delivery = DeliveryService.get_delivery_by_id(
        db,
        delivery_id,
        current_user.id
    )

    if not delivery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delivery not found"
        )

    return attach_assigned_driver(delivery)


# -------------------------
# DRIVER: START TRIP
# -------------------------
@router.post("/{delivery_id}/start", response_model=DeliveryResponse)
async def start_trip(
    delivery_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dep)
):
    if current_user.user_type != "driver":
        raise HTTPException(status_code=403, detail="Drivers only")

    delivery, error = DeliveryService.start_trip(
        db=db,
        delivery_id=delivery_id,
        driver_id=current_user.id
    )

    if error:
        raise HTTPException(status_code=400, detail=error)

    return attach_assigned_driver(delivery)


# -------------------------
# DRIVER: COMPLETE TRIP
# -------------------------
@router.post("/{delivery_id}/complete", response_model=DeliveryResponse)
async def complete_trip(
    delivery_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dep)
):
    if current_user.user_type != "driver":
        raise HTTPException(status_code=403, detail="Drivers only")

    delivery, error = DeliveryService.complete_trip(
        db=db,
        delivery_id=delivery_id,
        driver_id=current_user.id
    )

    if error:
        raise HTTPException(status_code=400, detail=error)

    return attach_assigned_driver(delivery)

# --- Pydantic Schemas  ---
class DriverStatusUpdate(BaseModel):
    is_available: bool
    current_status: str  # "online", "offline", "busy"

class DriverLocationUpdate(BaseModel):
    lat: float
    lng: float

# --- Add these Routes to the router ---
@router.put("/driver/status", response_model=dict)
async def update_driver_status(
    status_data: DriverStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dep)
):
    """Allows drivers to toggle availability (On Wait / Offline)"""
    if current_user.user_type != "driver":
        raise HTTPException(status_code=403, detail="Drivers only")

    # Assuming driver profile exists
    driver = db.query(Driver).filter(Driver.id == current_user.id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver profile not found")

    driver.is_available = status_data.is_available
    driver.current_status = status_data.current_status
    
    db.commit()
    return {"success": True, "status": driver.current_status}

@router.put("/driver/location", response_model=dict)
async def update_driver_location(
    location_data: DriverLocationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dep)
):
    """Allows drivers to send GPS updates"""
    if current_user.user_type != "driver":
        raise HTTPException(status_code=403, detail="Drivers only")

    driver = db.query(Driver).filter(Driver.id == current_user.id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver profile not found")

    driver.current_location_lat = location_data.lat
    driver.current_location_lng = location_data.lng
    
    db.commit()
    return {"success": True, "location": {"lat": location_data.lat, "lng": location_data.lng}}

@router.get("/driver/location", response_model=dict)
async def get_driver_location(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dep)
):
    """
    Returns the driver's current GPS so the customer can see
    live movement on the map.
    """

    # If customer → get assigned driver
    if current_user.user_type == "customer":
        delivery = (
            db.query(Delivery)
            .filter(
                Delivery.customer_id == current_user.id,
                Delivery.status != "completed",
                Delivery.driver_id.isnot(None)
            )
            .first()
        )

        if not delivery:
            return {"lat": None, "lng": None}

        driver = (
            db.query(Driver)
            .filter(Driver.id == delivery.driver_id)
            .first()
        )

    # If driver → return YOUR location
    elif current_user.user_type == "driver":
        driver = (
            db.query(Driver)
            .filter(Driver.id == current_user.id)
            .first()
        )

    else:
        raise HTTPException(status_code=403, detail="Not allowed")

    if not driver:
        return {"lat": None, "lng": None}

    return {
        "lat": driver.current_location_lat,
        "lng": driver.current_location_lng
    }
