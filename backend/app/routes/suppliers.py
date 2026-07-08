from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.database import suppliers_collection, purchase_orders_collection
from app.models.supplier import SupplierCreate, SupplierUpdate

router = APIRouter(prefix="/api/suppliers", tags=["Suppliers"])


async def enrich_supplier(supplier: dict) -> dict:
    """Only calculate monthly_avg from purchase orders if not manually set."""
    # If user manually set a monthly_avg, keep it
    if supplier.get("monthly_avg", 0) > 0:
        return supplier
    # Otherwise, calculate from purchase orders
    supplier_id = supplier.get("_id")
    all_pos = purchase_orders_collection.find_with_filter({"supplier_id": supplier_id})
    if all_pos:
        total_spend = sum(po.get("total_cost", 0) for po in all_pos)
        dates = [po.get("date", "") for po in all_pos if po.get("date")]
        if dates:
            first_date = min(dates)
            try:
                first = datetime.fromisoformat(first_date) if "T" in first_date else datetime.strptime(first_date, "%Y-%m-%d")
                months = max(1, (datetime.utcnow() - first).days // 30)
            except:
                months = 1
            supplier["monthly_avg"] = round(total_spend / months, 2)
        else:
            supplier["monthly_avg"] = 0.0
    else:
        supplier["monthly_avg"] = 0.0
    return supplier


@router.get("/")
async def get_all_suppliers():
    suppliers = suppliers_collection.find_all()
    return [await enrich_supplier(s) for s in suppliers]


@router.get("/{supplier_id}")
async def get_supplier(supplier_id: str):
    supplier = suppliers_collection.find_one(supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier


@router.post("/")
async def create_supplier(data: SupplierCreate):
    supplier_dict = data.model_dump()
    supplier_dict["created_at"] = datetime.utcnow().isoformat()
    doc_id = suppliers_collection.insert_one(supplier_dict)
    return suppliers_collection.find_one(doc_id)


@router.put("/{supplier_id}")
async def update_supplier(supplier_id: str, data: SupplierUpdate):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    found = suppliers_collection.update_one(supplier_id, update_data)
    if not found:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return suppliers_collection.find_one(supplier_id)


@router.delete("/{supplier_id}")
async def delete_supplier(supplier_id: str):
    found = suppliers_collection.delete_one(supplier_id)
    if not found:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return {"message": "Supplier deleted successfully"}
