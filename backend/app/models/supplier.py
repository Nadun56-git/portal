from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class SupplierBase(BaseModel):
    name: str
    type: str = ""  # type/category
    contact_person: str
    phone: str
    email: str
    address: str = ""
    product_service: str = ""  # what they supply
    payment_terms: str = "Net 30"
    monthly_avg: float = 0.0


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    product_service: Optional[str] = None
    payment_terms: Optional[str] = None
    monthly_avg: Optional[float] = None


class SupplierResponse(SupplierBase):
    id: str = Field(alias="_id")
    created_at: datetime

    class Config:
        populate_by_name = True
        extra = "allow"
