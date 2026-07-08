from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.database import clients_collection
from app.models.client import ClientCreate, ClientUpdate

router = APIRouter(prefix="/api/clients", tags=["Clients"])


@router.get("/")
async def get_all_clients():
    return clients_collection.find_all()


@router.get("/{client_id}")
async def get_client(client_id: str):
    client = clients_collection.find_one(client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@router.post("/")
async def create_client(data: ClientCreate):
    client_dict = data.model_dump()
    client_dict["created_at"] = datetime.utcnow().isoformat()
    doc_id = clients_collection.insert_one(client_dict)
    return clients_collection.find_one(doc_id)


@router.put("/{client_id}")
async def update_client(client_id: str, data: ClientUpdate):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    found = clients_collection.update_one(client_id, update_data)
    if not found:
        raise HTTPException(status_code=404, detail="Client not found")
    return clients_collection.find_one(client_id)


@router.delete("/{client_id}")
async def delete_client(client_id: str):
    found = clients_collection.delete_one(client_id)
    if not found:
        raise HTTPException(status_code=404, detail="Client not found")
    return {"message": "Client deleted successfully"}
