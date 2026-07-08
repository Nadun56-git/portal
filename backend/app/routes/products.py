from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.database import products_collection
from app.models.product import ProductCreate, ProductUpdate

router = APIRouter(prefix="/api/products", tags=["Products"])


@router.get("/")
async def get_all_products():
    return products_collection.find_all()


@router.get("/{product_id}")
async def get_product(product_id: str):
    product = products_collection.find_one(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/")
async def create_product(data: ProductCreate):
    product_dict = data.model_dump()
    product_dict["created_at"] = datetime.utcnow().isoformat()
    doc_id = products_collection.insert_one(product_dict)
    return products_collection.find_one(doc_id)


@router.put("/{product_id}")
async def update_product(product_id: str, data: ProductUpdate):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    found = products_collection.update_one(product_id, update_data)
    if not found:
        raise HTTPException(status_code=404, detail="Product not found")
    return products_collection.find_one(product_id)


@router.delete("/{product_id}")
async def delete_product(product_id: str):
    found = products_collection.delete_one(product_id)
    if not found:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}
