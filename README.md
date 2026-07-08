# Potrall — ERP / CRM System

A lightweight, full-stack ERP/CRM web application for managing clients, suppliers, products, sales orders, and purchase orders — with a rich analytics dashboard.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Charts | Recharts |
| Backend | Python FastAPI + Uvicorn |
| Validation | Pydantic v2 |
| Storage | JSON flat-file engine (no external DB required) |

## 📦 Features

- **Dashboard** — KPI cards, revenue vs spend charts, monthly & yearly reports
- **Clients** — Add, edit, delete, and track client status
- **Suppliers** — Manage supplier contacts and payment terms
- **Products** — Product catalog management
- **Orders** — Sales order tracking (pending / completed / overdue)
- **Purchase Orders** — Procurement tracking (pending / received / cancelled)

## 🗂️ Project Structure

```
Potrall/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app entry point
│   │   ├── database.py      # JSON file-based data layer
│   │   ├── models/          # Pydantic schemas
│   │   └── routes/          # API route handlers
│   ├── data/                # Persistent JSON data files
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   └── components/      # Page components
    ├── package.json
    └── vite.config.js
```

## ⚙️ Getting Started

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
# API runs at http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/api/dashboard/` | Overall KPI summary |
| GET | `/api/dashboard/monthly` | Monthly report |
| GET | `/api/dashboard/yearly` | Yearly report with chart data |
| CRUD | `/api/clients` | Client management |
| CRUD | `/api/suppliers` | Supplier management |
| CRUD | `/api/products` | Product management |
| CRUD | `/api/orders` | Sales order management |
| CRUD | `/api/purchase-orders` | Purchase order management |

## 📝 License

MIT
