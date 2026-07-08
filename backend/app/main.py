from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import clients, suppliers, products, orders, purchase_orders, dashboard

app = FastAPI(title="Potrall ERP/CRM", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(dashboard.router)
app.include_router(clients.router)
app.include_router(suppliers.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(purchase_orders.router)


@app.get("/")
async def root():
    return {"message": "Potrall ERP/CRM API is running"}
