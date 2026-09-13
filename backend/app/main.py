import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import clients, suppliers, products, orders, purchase_orders, dashboard
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Potrall ERP/CRM", version="1.0.0")

# ── CORS ─────────────────────────────────────────────────
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Keep * for flexibility; lock down in production via env
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────
app.include_router(dashboard.router)
app.include_router(clients.router)
app.include_router(suppliers.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(purchase_orders.router)


@app.get("/")
async def root():
    return {"message": "Potrall ERP/CRM API is running"}
