from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ClientBase(BaseModel):
    name: str
    company: str
    email: str
    phone: str
    address: str
    status: str = "active"  # active / inactive


class ClientCreate(ClientBase):
    pass


class ClientUpdate(BaseModel):
    name: Optional[str] = None
    company: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    status: Optional[str] = None


class ClientResponse(ClientBase):
    id: str = Field(alias="_id")
    created_at: datetime

    class Config:
        populate_by_name = True
