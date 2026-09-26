"""initial schema

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-01-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # 1. users
    op.create_table(
        "users",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("role", sa.Enum("manager", "staff", name="userrole"), nullable=False, server_default="staff"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"])

    # 2. otp_codes
    op.create_table(
        "otp_codes",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("user_id", sa.BigInteger(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("code_hash", sa.String(255), nullable=False),
        sa.Column("purpose", sa.Enum("password_reset", name="otppurpose"), nullable=False),
        sa.Column("expires_at", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("consumed_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # 3. categories
    op.create_table(
        "categories",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("name", sa.String(120), unique=True, nullable=False),
    )

    # 4. products
    op.create_table(
        "products",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("sku", sa.String(64), unique=True, nullable=False),
        sa.Column("category_id", sa.BigInteger(), sa.ForeignKey("categories.id", ondelete="RESTRICT"), nullable=True),
        sa.Column("unit_of_measure", sa.String(20), nullable=False),
        sa.Column("reorder_point", sa.Numeric(14, 3), nullable=False, server_default="0"),
        sa.Column("reorder_qty", sa.Numeric(14, 3), nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_products_sku", "products", ["sku"])
    op.create_index("ix_products_category_id", "products", ["category_id"])

    # 5. warehouses
    op.create_table(
        "warehouses",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("name", sa.String(120), unique=True, nullable=False),
        sa.Column("address", sa.String(255), nullable=True),
    )

    # 6. locations
    op.create_table(
        "locations",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("warehouse_id", sa.BigInteger(), sa.ForeignKey("warehouses.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("name", sa.String(120), nullable=False),
        sa.UniqueConstraint("warehouse_id", "name", name="uq_warehouse_location_name"),
    )

    # 7. stock_levels
    op.create_table(
        "stock_levels",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("product_id", sa.BigInteger(), sa.ForeignKey("products.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("location_id", sa.BigInteger(), sa.ForeignKey("locations.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("quantity", sa.Numeric(14, 3), nullable=False, server_default="0"),
        sa.UniqueConstraint("product_id", "location_id", name="uq_product_location"),
        sa.CheckConstraint("quantity >= 0", name="ck_quantity_non_negative"),
    )
    op.create_index("ix_stock_levels_product_id", "stock_levels", ["product_id"])
    op.create_index("ix_stock_levels_location_id", "stock_levels", ["location_id"])

    # 8. receipts & receipt_items
    op.create_table(
        "receipts",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("supplier_name", sa.String(200), nullable=False),
        sa.Column("status", sa.Enum("draft", "waiting", "ready", "done", "canceled", name="documentstatus"), nullable=False, server_default="draft"),
        sa.Column("created_by", sa.BigInteger(), sa.ForeignKey("users.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("validated_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_table(
        "receipt_items",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("receipt_id", sa.BigInteger(), sa.ForeignKey("receipts.id", ondelete="CASCADE"), nullable=False),
        sa.Column("product_id", sa.BigInteger(), sa.ForeignKey("products.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("location_id", sa.BigInteger(), sa.ForeignKey("locations.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("quantity", sa.Numeric(14, 3), nullable=False),
        sa.CheckConstraint("quantity > 0", name="ck_receipt_item_qty_positive"),
    )

    # 9. delivery_orders & delivery_items
    op.create_table(
        "delivery_orders",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("customer_name", sa.String(200), nullable=False),
        sa.Column("status", sa.Enum("draft", "waiting", "ready", "done", "canceled", name="documentstatus"), nullable=False, server_default="draft"),
        sa.Column("created_by", sa.BigInteger(), sa.ForeignKey("users.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("validated_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_table(
        "delivery_items",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("delivery_order_id", sa.BigInteger(), sa.ForeignKey("delivery_orders.id", ondelete="CASCADE"), nullable=False),
        sa.Column("product_id", sa.BigInteger(), sa.ForeignKey("products.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("location_id", sa.BigInteger(), sa.ForeignKey("locations.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("quantity", sa.Numeric(14, 3), nullable=False),
        sa.CheckConstraint("quantity > 0", name="ck_delivery_item_qty_positive"),
    )

    # 10. internal_transfers
    op.create_table(
        "internal_transfers",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("product_id", sa.BigInteger(), sa.ForeignKey("products.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("from_location_id", sa.BigInteger(), sa.ForeignKey("locations.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("to_location_id", sa.BigInteger(), sa.ForeignKey("locations.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("quantity", sa.Numeric(14, 3), nullable=False),
        sa.Column("status", sa.Enum("draft", "waiting", "ready", "done", "canceled", name="documentstatus"), nullable=False, server_default="draft"),
        sa.Column("created_by", sa.BigInteger(), sa.ForeignKey("users.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("validated_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("from_location_id != to_location_id", name="ck_transfer_different_locations"),
        sa.CheckConstraint("quantity > 0", name="ck_transfer_qty_positive"),
    )

    # 11. stock_adjustments
    op.create_table(
        "stock_adjustments",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("product_id", sa.BigInteger(), sa.ForeignKey("products.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("location_id", sa.BigInteger(), sa.ForeignKey("locations.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("system_qty", sa.Numeric(14, 3), nullable=False),
        sa.Column("counted_qty", sa.Numeric(14, 3), nullable=False),
        sa.Column("difference", sa.Numeric(14, 3), nullable=False),
        sa.Column("reason", sa.String(255), nullable=True),
        sa.Column("created_by", sa.BigInteger(), sa.ForeignKey("users.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # 12. stock_ledger
    op.create_table(
        "stock_ledger",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("product_id", sa.BigInteger(), sa.ForeignKey("products.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("location_id", sa.BigInteger(), sa.ForeignKey("locations.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("change_qty", sa.Numeric(14, 3), nullable=False),
        sa.Column("balance_after", sa.Numeric(14, 3), nullable=False),
        sa.Column("movement_type", sa.Enum("receipt", "delivery", "transfer_out", "transfer_in", "adjustment", name="movementtype"), nullable=False),
        sa.Column("reference_table", sa.String(50), nullable=False),
        sa.Column("reference_id", sa.BigInteger(), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_stock_ledger_prod_loc_created", "stock_ledger", ["product_id", "location_id", "created_at"])
    op.create_index("ix_stock_ledger_ref", "stock_ledger", ["reference_table", "reference_id"])

def downgrade():
    op.drop_table("stock_ledger")
    op.drop_table("stock_adjustments")
    op.drop_table("internal_transfers")
    op.drop_table("delivery_items")
    op.drop_table("delivery_orders")
    op.drop_table("receipt_items")
    op.drop_table("receipt_receipts")
    op.drop_table("stock_levels")
    op.drop_table("locations")
    op.drop_table("warehouses")
    op.drop_table("products")
    op.drop_table("categories")
    op.drop_table("otp_codes")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS movementtype")
    op.execute("DROP TYPE IF EXISTS documentstatus")
    op.execute("DROP TYPE IF EXISTS otppurpose")
    op.execute("DROP TYPE IF EXISTS userrole")
