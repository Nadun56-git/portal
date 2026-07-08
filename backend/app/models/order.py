from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    unit_price: float
    total: float


class OrderBase(BaseModel):
    client_id: str
    items: List[OrderItem]
    date: str
    total_amount: float
    status: str = "pending"  # pending / completed / overdue


class OrderCreate(OrderBase):
    pass


class OrderUpdate(BaseModel):
    client_id: Optional[str] = None
    items: Optional[List[OrderItem]] = None
    total_amount: Optional[float] = None
    status: Optional[str] = None


class OrderResponse(OrderBase):
    id: str = Field(alias="_id")
    created_at: datetime

    class Config:
        populate_by_name = True
