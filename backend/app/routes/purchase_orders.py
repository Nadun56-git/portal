from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.database import purchase_orders_collection
from app.models.purchase_order import PurchaseOrderCreate, PurchaseOrderUpdate

router = APIRouter(prefix="/api/purchase-orders", tags=["Purchase Orders"])


@router.get("/")
async def get_all_purchase_orders():
    return await purchase_orders_collection.find_all()


@router.get("/{po_id}")
async def get_purchase_order(po_id: str):
    po = await purchase_orders_collection.find_one(po_id)
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    return po


@router.post("/")
async def create_purchase_order(data: PurchaseOrderCreate):
    po_dict = data.model_dump()
    po_dict["created_at"] = datetime.utcnow().isoformat()
    doc_id = await purchase_orders_collection.insert_one(po_dict)
    return await purchase_orders_collection.find_one(doc_id)


@router.put("/{po_id}")
async def update_purchase_order(po_id: str, data: PurchaseOrderUpdate):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    found = await purchase_orders_collection.update_one(po_id, update_data)
    if not found:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    return await purchase_orders_collection.find_one(po_id)


@router.delete("/{po_id}")
async def delete_purchase_order(po_id: str):
    found = await purchase_orders_collection.delete_one(po_id)
    if not found:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    return {"message": "Purchase order deleted successfully"}
