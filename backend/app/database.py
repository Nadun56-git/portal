import json
import os
from datetime import datetime

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
os.makedirs(DATA_DIR, exist_ok=True)

COLLECTIONS = ["clients", "suppliers", "products", "orders", "purchase_orders"]


def _load(collection_name: str) -> list:
    path = os.path.join(DATA_DIR, f"{collection_name}.json")
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    return []


def _save(collection_name: str, data: list):
    path = os.path.join(DATA_DIR, f"{collection_name}.json")
    with open(path, "w") as f:
        json.dump(data, f, default=str, indent=2)


class Collection:
    def __init__(self, name: str):
        self.name = name
        self._counter = len(_load(name))

    def _next_id(self) -> str:
        self._counter += 1
        return str(self._counter).zfill(6)

    def find_all(self) -> list:
        return sorted(_load(self.name), key=lambda x: x.get("created_at", ""), reverse=True)

    def find_one(self, doc_id: str) -> dict | None:
        for doc in _load(self.name):
            if doc["_id"] == doc_id:
                return doc
        return None

    def insert_one(self, data: dict) -> str:
        docs = _load(self.name)
        doc_id = self._next_id()
        data["_id"] = doc_id
        if "created_at" not in data:
            data["created_at"] = datetime.utcnow().isoformat()
        docs.append(data)
        _save(self.name, docs)
        return doc_id

    def update_one(self, doc_id: str, update: dict) -> bool:
        docs = _load(self.name)
        for i, doc in enumerate(docs):
            if doc["_id"] == doc_id:
                docs[i].update(update)
                _save(self.name, docs)
                return True
        return False

    def delete_one(self, doc_id: str) -> bool:
        docs = _load(self.name)
        new_docs = [d for d in docs if d["_id"] != doc_id]
        if len(new_docs) < len(docs):
            _save(self.name, new_docs)
            return True
        return False

    def count(self, filter: dict = None) -> int:
        docs = _load(self.name)
        if filter:
            return sum(1 for d in docs if all(d.get(k) == v for k, v in filter.items()))
        return len(docs)

    def find_with_filter(self, filter: dict) -> list:
        docs = _load(self.name)
        return [d for d in docs if all(d.get(k) == v for k, v in filter.items())]


# Collection instances
clients_collection = Collection("clients")
suppliers_collection = Collection("suppliers")
products_collection = Collection("products")
orders_collection = Collection("orders")
purchase_orders_collection = Collection("purchase_orders")
