from fastapi import FastAPI, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

import app.models  # Import models registry for SQLAlchemy mappers
from app.core.exceptions import AppException
from app.core.middleware import (
    app_exception_handler,
    validation_exception_handler,
    global_exception_handler,
    logging_middleware,
)
from app.core.database import get_db
from app.modules.auth.auth_router import router as auth_router
from app.modules.categories.categories_router import router as categories_router
from app.modules.warehouses.warehouses_router import router as warehouses_router
from app.modules.products.products_router import router as products_router
from app.modules.receipts.receipts_router import router as receipts_router
from app.modules.deliveries.deliveries_router import router as deliveries_router
from app.modules.transfers.transfers_router import router as transfers_router
from app.modules.adjustments.adjustments_router import router as adjustments_router
from app.modules.ledger.ledger_router import router as ledger_router
from app.modules.dashboard.dashboard_router import router as dashboard_router

app = FastAPI(
    title="StockSense API",
    description="Backend Engineering Service for StockSense Inventory Management System",
    version="1.0.0",
)

# Exception Handlers
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)

# Middleware
app.middleware("http")(logging_middleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router)
app.include_router(categories_router)
app.include_router(warehouses_router)
app.include_router(products_router)
app.include_router(receipts_router)
app.include_router(deliveries_router)
app.include_router(transfers_router)
app.include_router(adjustments_router)
app.include_router(ledger_router)
app.include_router(dashboard_router)

@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check(db: AsyncSession = Depends(get_db)):
    await db.execute(select(1))
    return {"status": "ok", "database": "connected"}

# Mount Static Frontend Bundle
import os
from fastapi.staticfiles import StaticFiles

frontend_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static_frontend")

