from pydantic import BaseModel
from typing import Optional

class UserUpdate(BaseModel):
    name: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    city: Optional[str]
    state: Optional[str]
    zip_code: Optional[str]
