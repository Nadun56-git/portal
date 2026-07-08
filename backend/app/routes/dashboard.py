from fastapi import APIRouter
from datetime import datetime
from app.database import (
    clients_collection,
    suppliers_collection,
    products_collection,
    orders_collection,
    purchase_orders_collection,
)

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


def filter_by_month(items, date_field, year, month):
    """Filter items by year and month."""
    result = []
    for item in items:
        date_str = item.get(date_field, "")
        if date_str:
            try:
                if "T" in date_str:
                    dt = datetime.fromisoformat(date_str)
                else:
                    dt = datetime.strptime(date_str[:10], "%Y-%m-%d")
                if dt.year == year and dt.month == month:
                    result.append(item)
            except:
                pass
    return result


def filter_by_year(items, date_field, year):
    """Filter items by year."""
    result = []
    for item in items:
        date_str = item.get(date_field, "")
        if date_str:
            try:
                if "T" in date_str:
                    dt = datetime.fromisoformat(date_str)
                else:
                    dt = datetime.strptime(date_str[:10], "%Y-%m-%d")
                if dt.year == year:
                    result.append(item)
            except:
                pass
    return result


@router.get("/")
async def get_dashboard_summary():
    total_clients = clients_collection.count()
    total_suppliers = suppliers_collection.count()
    total_products = products_collection.count()
    total_orders = orders_collection.count()
    pending_orders = orders_collection.count({"status": "pending"})
    total_purchase_orders = purchase_orders_collection.count()
    pending_pos = purchase_orders_collection.count({"status": "pending"})

    # Calculate total revenue from completed orders
    completed_orders = orders_collection.find_with_filter({"status": "completed"})
    revenue = sum(o.get("total_amount", 0) for o in completed_orders)

    # Calculate total spend from received purchase orders
    received_pos = purchase_orders_collection.find_with_filter({"status": "received"})
    spend = sum(po.get("total_cost", 0) for po in received_pos)

    return {
        "total_clients": total_clients,
        "total_suppliers": total_suppliers,
        "total_products": total_products,
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "total_purchase_orders": total_purchase_orders,
        "pending_purchase_orders": pending_pos,
        "revenue": round(revenue, 2),
        "spend": round(spend, 2),
    }


@router.get("/monthly")
async def get_monthly_report(year: int = None, month: int = None):
    """Get monthly report data."""
    now = datetime.utcnow()
    if not year:
        year = now.year
    if not month:
        month = now.month

    all_orders = orders_collection.find_all()
    all_pos = purchase_orders_collection.find_all()
    all_clients = clients_collection.find_all()
    all_suppliers = suppliers_collection.find_all()

    monthly_orders = filter_by_month(all_orders, "date", year, month)
    monthly_pos = filter_by_month(all_pos, "date", year, month)

    completed_monthly = [o for o in monthly_orders if o.get("status") == "completed"]
    received_monthly = [po for po in monthly_pos if po.get("status") == "received"]

    revenue = sum(o.get("total_amount", 0) for o in completed_monthly)
    spend = sum(po.get("total_cost", 0) for po in received_monthly)

    return {
        "year": year,
        "month": month,
        "month_name": datetime(year, month, 1).strftime("%B"),
        "total_orders": len(monthly_orders),
        "completed_orders": len(completed_monthly),
        "pending_orders": len([o for o in monthly_orders if o.get("status") == "pending"]),
        "total_purchase_orders": len(monthly_pos),
        "received_pos": len(received_monthly),
        "pending_pos": len([po for po in monthly_pos if po.get("status") == "pending"]),
        "revenue": round(revenue, 2),
        "spend": round(spend, 2),
        "total_clients": len(all_clients),
        "total_suppliers": len(all_suppliers),
    }


@router.get("/yearly")
async def get_yearly_report(year: int = None):
    """Get yearly report data."""
    now = datetime.utcnow()
    if not year:
        year = now.year

    all_orders = orders_collection.find_all()
    all_pos = purchase_orders_collection.find_all()
    all_clients = clients_collection.find_all()
    all_suppliers = suppliers_collection.find_all()
    all_products = products_collection.find_all()

    yearly_orders = filter_by_year(all_orders, "date", year)
    yearly_pos = filter_by_year(all_pos, "date", year)

    completed_yearly = [o for o in yearly_orders if o.get("status") == "completed"]
    received_yearly = [po for po in yearly_pos if po.get("status") == "received"]

    revenue = sum(o.get("total_amount", 0) for o in completed_yearly)
    spend = sum(po.get("total_cost", 0) for po in received_yearly)

    # Monthly breakdown
    monthly_breakdown = []
    for m in range(1, 13):
        month_orders = filter_by_month(yearly_orders, "date", year, m)
        month_pos = filter_by_month(yearly_pos, "date", year, m)
        m_completed = [o for o in month_orders if o.get("status") == "completed"]
        m_received = [po for po in month_pos if po.get("status") == "received"]
        monthly_breakdown.append({
            "month": datetime(year, m, 1).strftime("%b"),
            "orders": len(month_orders),
            "revenue": round(sum(o.get("total_amount", 0) for o in m_completed), 2),
            "purchase_orders": len(month_pos),
            "spend": round(sum(po.get("total_cost", 0) for po in m_received), 2),
        })

    return {
        "year": year,
        "total_orders": len(yearly_orders),
        "completed_orders": len(completed_yearly),
        "pending_orders": len([o for o in yearly_orders if o.get("status") == "pending"]),
        "total_purchase_orders": len(yearly_pos),
        "received_pos": len(received_yearly),
        "pending_pos": len([po for po in yearly_pos if po.get("status") == "pending"]),
        "revenue": round(revenue, 2),
        "spend": round(spend, 2),
        "total_clients": len(all_clients),
        "total_suppliers": len(all_suppliers),
        "total_products": len(all_products),
        "monthly_breakdown": monthly_breakdown,
    }
