from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.driver import Driver
from app.models.customer import Customer

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])

# 🚨 DEMO ADMIN AUTH (frontend controls access)
def admin_guard():
    # frontend-only admin, so backend keeps this simple
    return True


@router.get("/customers")
def get_all_customers(
    db: Session = Depends(get_db),
    _: bool = Depends(admin_guard)
):
    customers = (
        db.query(User)
        .join(Customer, Customer.id == User.id)
        .all()
    )

    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "phone": u.phone,
            "created_at": u.created_at
        }
        for u in customers
    ]


@router.get("/drivers")
def get_all_drivers(
    db: Session = Depends(get_db),
    _: bool = Depends(admin_guard)
):
    drivers = (
        db.query(User, Driver)
        .join(Driver, Driver.id == User.id)
        .all()
    )

    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "vehicle_number": driver.vehicle_number,
            "rating": driver.overall_rating,
            "total_deliveries": driver.total_deliveries,
            "created_at": user.created_at
        }
        for user, driver in drivers
    ]
