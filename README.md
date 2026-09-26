# StockSense

StockSense is a modular Inventory Management System designed to
centralize and simplify inventory operations.

## Project Overview

StockSense helps businesses manage inventory by providing a
centralized system for tracking products, stock movements, receipts,
deliveries, transfers, adjustments, and inventory history.

## Features

- Authentication
- Product Management
- Product Categories
- Warehouse Management
- Incoming Stock / Receipts
- Outgoing Stock / Deliveries
- Internal Stock Transfers
- Inventory Adjustments
- Stock Ledger / Move History
- Inventory Dashboard

## Project Structure

```text
app/
├── models/
└── modules/
    ├── auth/
    ├── products/
    ├── categories/
    ├── warehouses/
    ├── receipts/
    ├── deliveries/
    ├── transfers/
    ├── adjustments/
    ├── ledger/
    └── dashboard/

tests/
├── phase1_auth/
├── phase2_products/
├── phase3_receipts/
├── phase4_deliveries/
├── phase5_transfers/
├── phase6_adjustments/
├── phase7_ledger/
└── phase8_dashboard/




Product
   ↓
Receipt
   ↓
Stock Updated
   ↓
Internal Transfer
   ↓
Delivery
   ↓
Stock Adjustment
   ↓
Stock Ledger