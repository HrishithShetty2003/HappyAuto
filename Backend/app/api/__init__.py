from fastapi import APIRouter
from app.api import auth, deliveries

api_router = APIRouter()

# Include all routers
api_router.include_router(auth.router, prefix="/api/v1/auth")
api_router.include_router(deliveries.router, prefix="/api/v1/deliveries") 

# This creates the following routes:
# - /api/v1/auth/register
# - /api/v1/auth/login  
# - /api/v1/auth/me
# - /api/v1/deliveries/book      (new)
# - /api/v1/deliveries/my-deliveries  (new)
# - /api/v1/deliveries/{delivery_id}  (new)