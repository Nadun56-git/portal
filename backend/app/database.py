import os
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ReturnDocument
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/potrall")
DB_NAME = os.getenv("DB_NAME", "potrall")

client = AsyncIOMotorClient(MONGODB_URL)
db = client[DB_NAME]
_counters = db["_counters"]


def _clean(doc: dict) -> dict:
    """Ensure _id is always a plain string in responses."""
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


class Collection:
    def __init__(self, name: str):
        self.name = name
        self.col = db[name]

    async def _next_id(self) -> str:
        result = await _counters.find_one_and_update(
            {"_id": self.name},
            {"$inc": {"seq": 1}},
            upsert=True,
            return_document=ReturnDocument.AFTER,
        )
        return str(result["seq"]).zfill(6)

    async def find_all(self) -> list:
        docs = await self.col.find().sort("created_at", -1).to_list(None)
        return [_clean(d) for d in docs]

    async def find_one(self, doc_id: str) -> dict | None:
        doc = await self.col.find_one({"_id": doc_id})
        return _clean(doc) if doc else None

    async def insert_one(self, data: dict) -> str:
        doc_id = await self._next_id()
        data["_id"] = doc_id
        if "created_at" not in data:
            data["created_at"] = datetime.utcnow().isoformat()
        await self.col.insert_one(data)
        return doc_id

    async def update_one(self, doc_id: str, update: dict) -> bool:
        result = await self.col.update_one({"_id": doc_id}, {"$set": update})
        return result.matched_count > 0

    async def delete_one(self, doc_id: str) -> bool:
        result = await self.col.delete_one({"_id": doc_id})
        return result.deleted_count > 0

    async def count(self, filter: dict = None) -> int:
        return await self.col.count_documents(filter or {})

    async def find_with_filter(self, filter: dict) -> list:
        docs = await self.col.find(filter).to_list(None)
        return [_clean(d) for d in docs]


# ── Collection instances ──────────────────────────────────
clients_collection          = Collection("clients")
suppliers_collection        = Collection("suppliers")
products_collection         = Collection("products")
orders_collection           = Collection("orders")
purchase_orders_collection  = Collection("purchase_orders")
