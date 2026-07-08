from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class PurchaseOrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    unit_cost: float
    total: float


class PurchaseOrderBase(BaseModel):
    supplier_id: str
    items: List[PurchaseOrderItem]
    date: str
    expected_delivery: str
    total_cost: float
    status: str = "pending"  # pending / received / cancelled


class PurchaseOrderCreate(PurchaseOrderBase):
    pass


class PurchaseOrderUpdate(BaseModel):
    supplier_id: Optional[str] = None
    items: Optional[List[PurchaseOrderItem]] = None
    expected_delivery: Optional[str] = None
    total_cost: Optional[float] = None
    status: Optional[str] = None


class PurchaseOrderResponse(PurchaseOrderBase):
    id: str = Field(alias="_id")
    created_at: datetime

    class Config:
        populate_by_name = True
