# StockSense 📦

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8+-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-D71F00?style=flat-square&logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

**StockSense** is a modern, modular, production-ready **Inventory Management System (IMS)** designed to centralize and automate end-to-end warehouse and stock operations. It delivers real-time stock visibility, an immutable audit trail, and seamless multi-warehouse logistics.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [System Architecture & Lifecycle](#-system-architecture--lifecycle)
- [Tech Stack](#-tech-stack)
- [Repository Structure](#-repository-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Option 1: Quickstart with Docker Compose (Recommended)](#option-1-quickstart-with-docker-compose-recommended)
  - [Option 2: Manual Local Setup](#option-2-manual-local-setup)
- [Environment Configuration](#-environment-configuration)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [License](#-license)

---

## 🚀 Key Features

- **🔐 Authentication & Security**: JWT-based token authentication, password hashing with bcrypt, OTP verification workflows, and rate limiting with SlowAPI.
- **🏷️ Product Catalog**: Complete SKU tracking, barcode support, descriptions, pricing, units of measure, and minimum stock threshold alerts.
- **📁 Product Categories**: Hierarchical categorization for structured catalog organization.
- **🏢 Multi-Warehouse Management**: Track and manage multiple storage locations, capacities, and stock allocations per warehouse.
- **📥 Incoming Stock (Receipts)**: Process incoming supplier shipments, purchase orders, quality checks, and automated stock increments.
- **📤 Outgoing Stock (Deliveries)**: Manage customer order fulfillment, picking, packing, validation, and automated stock deductions.
- **🔄 Internal Transfers**: Seamless inter-warehouse stock rebalancing with validation and transit tracking.
- **⚖️ Inventory Adjustments**: Reconcile physical inventory discrepancies, damages, expiration, or write-offs with audit justifications.
- **📜 Immutable Stock Ledger**: Double-entry ledger recording every single stock movement with precise timestamps, user references, and before/after balances.
- **📊 Real-time Dashboard & Analytics**: High-level KPIs, inventory valuation, stock level warnings, and movement trends.

---

## 🔄 System Architecture & Lifecycle

```mermaid
flowchart TD
    subgraph Inbound ["📥 Inbound Operations"]
        PO[Supplier Shipment / PO] --> RC[Receipt Created]
        RC --> RV[Receipt Validated & Received]
    end

    subgraph Core ["🏢 Warehouse Storage & Control"]
        RV --> ST[Warehouse Stock Updated]
        ST --> TR[Internal Stock Transfer]
        TR --> ST
        ST --> ADJ[Stock Adjustment / Audit]
        ADJ --> ST
    end

    subgraph Outbound ["📤 Outbound Operations"]
        ST --> DO[Delivery Order Created]
        DO --> DD[Delivery Dispatched & Done]
    end

    subgraph Audit ["📜 Audit & Intelligence"]
        RV -.-> LG[(Immutable Stock Ledger)]
        TR -.-> LG
        ADJ -.-> LG
        DD -.-> LG
        LG --> DB[Analytics Dashboard & KPIs]
    end

    classDef primary fill:#2563eb,stroke:#1d4ed8,color:#fff
    classDef success fill:#16a34a,stroke:#15803d,color:#fff
    classDef warning fill:#d97706,stroke:#b45309,color:#fff
    classDef purple fill:#7c3aed,stroke:#6d28d9,color:#fff

    class Inbound,Outbound primary
    class Core success
    class Audit purple
```

---

## 🛠️ Tech Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Async Python REST API)
- **ASGI Server**: [Uvicorn](https://www.uvicorn.org/)
- **Database & ORM**: [PostgreSQL 15](https://www.postgresql.org/) + [SQLAlchemy 2.0](https://www.sqlalchemy.org/) (Async via `asyncpg`)
- **Database Migrations**: [Alembic](https://alembic.sqlalchemy.org/)
- **Data Validation & Settings**: [Pydantic v2](https://docs.pydantic.dev/) & `pydantic-settings`
- **Security & Auth**: `python-jose` (JWT), `passlib` & `bcrypt`, `fastapi-mail` (OTP)
- **Background Tasks & Limiting**: [APScheduler](https://apscheduler.readthedocs.io/), [SlowAPI](https://slowapi.readthedocs.io/)

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Linter**: [Oxlint](https://oxc.rs/)

### DevOps & QA
- **Containers**: Docker & Docker Compose
- **Testing**: Pytest, Pytest-Asyncio, Pytest-Cov, HTTPX

---

## 📂 Repository Structure

```text
StockSense/
├── app/                        # FastAPI Application Package
│   ├── core/                   # Core configurations, database engine, middlewares, exceptions
│   ├── models/                 # SQLAlchemy ORM models registry
│   └── modules/                # Feature-driven domain modules
│       ├── adjustments/        # Stock adjustments & reconciliations
│       ├── auth/               # User authentication, tokens, OTP
│       ├── categories/         # Product classification
│       ├── dashboard/          # Analytics & metrics aggregation
│       ├── deliveries/         # Customer delivery orders
│       ├── ledger/             # Stock ledger & movement audit trail
│       ├── products/           # Product management
│       ├── receipts/           # Inbound supplier receipts
│       ├── transfers/          # Inter-warehouse stock transfers
│       └── warehouses/         # Warehouse locations & zones
├── alembic/                    # Database migration scripts & versions
├── frontend/                   # React + Vite frontend application
│   ├── src/                    # UI components, pages, state
│   ├── package.json            # Node.js dependencies
│   └── vite.config.js          # Vite build configuration
├── tests/                      # Comprehensive test suites
│   ├── phase1_auth/            # Authentication & authorization tests
│   ├── phase2_products/        # Product CRUD & validation tests
│   ├── phase3_receipts/        # Receipt flow tests
│   ├── phase4_deliveries/      # Delivery processing tests
│   ├── phase5_transfers/       # Warehouse transfer tests
│   ├── phase6_adjustments/     # Discrepancy & adjustment tests
│   ├── phase7_ledger/          # Audit ledger validation tests
│   ├── phase8_dashboard/       # Analytics calculations tests
│   ├── phase9_warehouses/      # Warehouse management tests
│   ├── phase10_categories/     # Category hierarchy tests
│   ├── phase11_system/         # System & rate-limiting tests
│   ├── conftest.py             # Pytest fixtures & async DB test setup
│   └── test_end_to_end_flow.py # End-to-end integration lifecycle test
├── docker-compose.yml          # Multi-container orchestration
├── Dockerfile                  # API service container definition
├── requirements.txt            # Python dependencies
└── .env.example                # Template environment variables
```

---

## 🏁 Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/) (for containerized deployment)
- **OR** for native development:
  - [Python 3.11+](https://www.python.org/)
  - [PostgreSQL 15+](https://www.postgresql.org/)
  - [Node.js 18+](https://nodejs.org/) & `npm`

---

### Option 1: Quickstart with Docker Compose (Recommended)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mohitchauhan21/StockSense.git
   cd StockSense
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```

3. **Build and start services**:
   ```bash
   docker compose up --build
   ```

4. **Access the application**:
   - **Backend API & Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
   - **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

### Option 2: Manual Local Setup

#### 1. Backend Setup

```bash
# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Unix/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy and update environment variables
cp .env.example .env

# Run database migrations
alembic upgrade head

# Start FastAPI development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

---

## ⚙️ Environment Configuration

Configuration is managed via `.env`. A starting template is provided in `.env.example`:

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | Async PostgreSQL connection string | `postgresql+asyncpg://stocksense:password@localhost:5432/stocksense` |
| `TEST_DATABASE_URL`| PostgreSQL connection string for testing | `postgresql+asyncpg://stocksense:password@localhost:5432/stocksense_test` |
| `JWT_SECRET_KEY` | Secret key for signing JWT tokens | `change_this_to_a_random_32_plus_character_string` |
| `JWT_ALGORITHM` | JWT signing algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token lifespan | `30` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token lifespan | `7` |
| `OTP_EXPIRE_MINUTES` | Expiration time for email OTPs | `10` |
| `SMTP_HOST` | Outgoing SMTP mail server | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | SMTP username / sender address | `sender@example.com` |
| `SMTP_PASSWORD` | SMTP password / app password | `app_password` |
| `ENVIRONMENT` | Runtime mode (`development`/`production`) | `development` |

---

## 📖 API Documentation

Once the backend is running, explore the interactive documentation:

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc UI**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Primary API Routes

| Endpoint Prefix | Description |
| :--- | :--- |
| `/auth` | User registration, login, token refresh, OTP verification |
| `/categories` | Product category creation, hierarchy, retrieval |
| `/products` | Catalog items, SKUs, pricing, inventory thresholds |
| `/warehouses` | Warehouse facilities, locations, capacity |
| `/receipts` | Inbound goods intake, PO tracking, stock receipt confirmation |
| `/deliveries` | Outbound shipping orders, dispatch validation |
| `/transfers` | Inter-facility transfer orders & execution |
| `/adjustments`| Physical inventory counts, scrap, damage reconciliation |
| `/ledger` | Immutable audit log of all stock movements |
| `/dashboard` | Aggregated analytics, stock value, reorder alerts |
| `/health` | System and database health check |

---

## 🧪 Testing

The test suite covers unit logic, module integration, and full lifecycle end-to-end flows.

```bash
# Run all tests
pytest

# Run tests with coverage report
pytest --cov=app --cov-report=term-missing

# Run a specific test phase
pytest tests/phase1_auth/
pytest tests/test_end_to_end_flow.py
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).