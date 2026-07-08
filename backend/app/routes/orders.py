from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.database import orders_collection
from app.models.order import OrderCreate, OrderUpdate

router = APIRouter(prefix="/api/orders", tags=["Orders"])


@router.get("/")
async def get_all_orders():
    return orders_collection.find_all()


@router.get("/{order_id}")
async def get_order(order_id: str):
    order = orders_collection.find_one(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("/")
async def create_order(data: OrderCreate):
    order_dict = data.model_dump()
    order_dict["created_at"] = datetime.utcnow().isoformat()
    doc_id = orders_collection.insert_one(order_dict)
    return orders_collection.find_one(doc_id)


@router.put("/{order_id}")
async def update_order(order_id: str, data: OrderUpdate):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    found = orders_collection.update_one(order_id, update_data)
    if not found:
        raise HTTPException(status_code=404, detail="Order not found")
    return orders_collection.find_one(order_id)


@router.delete("/{order_id}")
async def delete_order(order_id: str):
    found = orders_collection.delete_one(order_id)
    if not found:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order deleted successfully"}
