from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ProductBase(BaseModel):
    name: str
    sku: str
    supplier_id: str
    cost_price: float
    selling_price: float
    stock_qty: int = 0


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    supplier_id: Optional[str] = None
    cost_price: Optional[float] = None
    selling_price: Optional[float] = None
    stock_qty: Optional[int] = None


class ProductResponse(ProductBase):
    id: str = Field(alias="_id")
    created_at: datetime

    class Config:
        populate_by_name = True
