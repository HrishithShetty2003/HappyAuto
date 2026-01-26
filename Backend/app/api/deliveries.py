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
from app.models.delivery import Delivery, DeliveryStatus
from app.models.driver import Driver 
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
 
router = APIRouter(tags=["deliveries"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

print("🔥 deliveries.py LOADED 🔥")
print("DeliveryStatus members:", list(DeliveryStatus))

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
            vehicle_number=delivery.driver.vehicle_number,
            phone=delivery.driver.user.phone
        )

    if delivery.customer:
        customer_info = {
            "name": delivery.customer.name,
            "phone": delivery.customer.phone
        }

    print(
        "DEBUG payment status:",
        delivery.id,
        delivery.new_payment_status
    )

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
        customer=customer_info,
        new_payment_status=delivery.new_payment_status,

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
        deliveries = (
            db.query(Delivery)
                .filter(
                    Delivery.customer_id == current_user.id,
                    (
                        Delivery.status.in_([
                            DeliveryStatus.PENDING.value,
                            DeliveryStatus.ASSIGNED.value,
                            DeliveryStatus.IN_TRANSIT.value,
                            # DeliveryStatus.COMPLETED.value
                        ])
                    )
                    |
                    (
                        (Delivery.status == DeliveryStatus.COMPLETED.value) &
                        (Delivery.new_payment_status != "paid")
                    )

                ).all()
        )

    elif current_user.user_type == "driver":
        deliveries = db.query(Delivery).filter(
            Delivery.driver_id == current_user.id,
             Delivery.status != DeliveryStatus.CANCELLED.value
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
            Delivery.status == DeliveryStatus.PENDING.value
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


@router.get("/completed", response_model=List[DeliveryResponse])
def get_completed_deliveries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dep)
):
    if current_user.user_type != "customer":
        raise HTTPException(status_code=403, detail="Customers only")

    deliveries = (
        db.query(Delivery)
        .filter(
            Delivery.customer_id == current_user.id,
            Delivery.status == DeliveryStatus.COMPLETED.value
        )
        .all()
    )

    return [attach_assigned_driver(d) for d in deliveries]


@router.get("/driver/completed", response_model=List[DeliveryResponse])
def get_driver_completed_deliveries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dep),
):
    if current_user.user_type != "driver":
        raise HTTPException(status_code=403, detail="Drivers only")

    deliveries = (
        db.query(Delivery)
        .filter(
            Delivery.driver_id == current_user.id,
            Delivery.status == DeliveryStatus.COMPLETED.value
        )
        .order_by(Delivery.actual_delivery.desc())
        .all()
    )

    return [attach_assigned_driver(d) for d in deliveries]

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

# @router.get("/completed-unpaid", response_model=List[DeliveryResponse])
# def completed_unpaid_deliveries(
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user_dep)
# ):
#     return (
#         db.query(Delivery)
#         .filter(
#             Delivery.customer_id == current_user.id,
#             Delivery.status == DeliveryStatus.COMPLETED.value,
#             Delivery.new_payment_status != "paid"
#         )
#         .all()
#     )


# -------------------------
# DRIVER: START TRIP
# -------------------------

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
                Delivery.status != DeliveryStatus.COMPLETED.value,
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

# @router.post("/{delivery_id}/cancel", response_model=DeliveryResponse)
# async def cancel_delivery(
#     delivery_id: str,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user_dep)
# ):
#     """
#     Driver can cancel ONLY if:
#     - Status = assigned
#     - Scheduled pickup is > 15 minutes away
#     """

#     if current_user.user_type != "driver":
#         raise HTTPException(status_code=403, detail="Drivers only")

#     delivery = db.query(Delivery).filter(Delivery.id == delivery_id).first()

#     if not delivery:
#         raise HTTPException(status_code=404, detail="Delivery not found")

#     # Only assigned deliveries can be cancelled
#     if delivery.status != "assigned":
#         raise HTTPException(
#             status_code=400,
#             detail="Only assigned deliveries can be cancelled"
#         )

#     # Time rule: must be > 15 minutes before pickup
#     if delivery.scheduled_pickup:
#         now = datetime.utcnow()
#         if delivery.scheduled_pickup - now <= timedelta(minutes=15):
#             raise HTTPException(
#                 status_code=400,
#                 detail="Cannot cancel within 15 minutes of pickup"
#             )

#     # Reset delivery
#     delivery.status = "pending"
#     delivery.driver_id = None

#     db.commit()
#     db.refresh(delivery)

#     return attach_assigned_driver(delivery)

@router.post("/{delivery_id}/driver-cancel", response_model=DeliveryResponse)
async def driver_cancel_delivery(
    delivery_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dep)
):
    if current_user.user_type != "driver":
        raise HTTPException(status_code=403, detail="Drivers only")

    delivery = db.query(Delivery).filter(Delivery.id == delivery_id).first()
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")

    if delivery.status == DeliveryStatus.COMPLETED.value:
        raise HTTPException(
            status_code=400,
            detail="Cannot cancel a completed delivery"
        )

    now = datetime.utcnow()
    fine = 0

    # 🚨 Fine conditions
    if delivery.status == DeliveryStatus.IN_TRANSIT.value:
        fine = 100

    elif delivery.scheduled_pickup:
        diff_minutes = (delivery.scheduled_pickup - now).total_seconds() / 60
        if diff_minutes <= 5:
            fine = 100

    # Apply cancellation
    delivery.status = DeliveryStatus.PENDING.value
    delivery.driver_id = None

    # Optional: store fine
    # delivery.driver_penalty = fine

    db.commit()
    db.refresh(delivery)

    return {
        **attach_assigned_driver(delivery).dict(),
        "fine": fine
    }


@router.post("/{delivery_id}/customer-cancel", response_model=DeliveryResponse)
async def customer_cancel_delivery(
    delivery_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dep)
):
    delivery = db.query(Delivery).filter(Delivery.id == delivery_id).first()

    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")

    if current_user.user_type == "customer":
        if delivery.customer_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not allowed")

    if delivery.status == DeliveryStatus.COMPLETED.value:
        raise HTTPException(status_code=400, detail="Cannot cancel completed delivery")

    delivery.status = DeliveryStatus.CANCELLED.value
    delivery.driver_id = None

    db.commit()
    db.refresh(delivery)

    return attach_assigned_driver(delivery)

@router.post("/{delivery_id}/mark-paid", response_model=DeliveryResponse)
async def mark_delivery_paid(
    delivery_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dep),
):
    delivery = db.query(Delivery).filter(Delivery.id == delivery_id).first()

    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")

    if current_user.user_type != "customer" or delivery.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    if delivery.status != DeliveryStatus.COMPLETED.value:
        raise HTTPException(status_code=400, detail="Delivery not completed")

    delivery.new_payment_status = "paid"   # ✅ THIS IS THE KEY
    db.commit()
    db.refresh(delivery)

    return attach_assigned_driver(delivery)



class ReschedulePickup(BaseModel):
    scheduled_pickup: datetime




@router.patch("/{delivery_id}", response_model=DeliveryResponse)
async def reschedule_pickup(
    delivery_id: str,
    payload: ReschedulePickup,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dep),
):
    delivery = db.query(Delivery).filter(Delivery.id == delivery_id).first()

    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")

    # Only customer can reschedule
    if current_user.user_type != "customer" or delivery.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    # Cannot reschedule completed / cancelled
    if delivery.status in (
        DeliveryStatus.COMPLETED.value,
        DeliveryStatus.CANCELLED.value,
    ):
        raise HTTPException(status_code=400, detail="Cannot reschedule this delivery")

    # ───────────────────────────────
    # 🔐 SAFE DATETIME HANDLING
    # ───────────────────────────────
    incoming = payload.scheduled_pickup

    # If frontend sent datetime-local (naive), assume UTC
    if incoming.tzinfo is None:
        incoming = incoming.replace(tzinfo=timezone.utc)

    now = datetime.now(timezone.utc)

    if incoming <= now:
        raise HTTPException(
            status_code=400,
            detail="Pickup time must be in the future"
        )

    # Store as UTC-aware
    delivery.scheduled_pickup = incoming

    db.commit()
    db.refresh(delivery)

    return attach_assigned_driver(delivery)


