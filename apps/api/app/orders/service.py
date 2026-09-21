"""Order domain service with ACID transaction guarantees and server-side pricing recalculation."""

import uuid
from datetime import UTC, datetime
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.coupons.models import Coupon
from app.coupons.service import coupon_service
from app.orders.models import Order, OrderItem
from app.orders.schemas import (
    InvoiceResponse,
    InvoiceStoreDetails,
    OrderCreateRequest,
    OrderResponse,
    OrderStatusUpdateRequest,
)
from app.products.models import Product
from app.stores.service import store_service


class OrderService:
    """Service handling transaction-safe order execution and fulfillment."""

    async def create_order(
        self,
        db: AsyncSession,
        store_id: uuid.UUID,
        request: OrderCreateRequest,
    ) -> Order:
        """Transaction-safe order placement with row locking and server price recalculation."""
        # 1. Fetch store
        store = await store_service.get_store_by_id(db, store_id)
        if not store.published or not store.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This store is not currently accepting orders.",
            )

        if not request.items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Order must contain at least one item.",
            )

        # Collect product IDs and quantities
        product_qty_map: dict[uuid.UUID, int] = {}
        for item in request.items:
            if item.quantity <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Item quantity must be greater than zero.",
                )
            product_qty_map[item.product_id] = (
                product_qty_map.get(item.product_id, 0) + item.quantity
            )

        # 2. Lock product rows with SELECT ... FOR UPDATE
        product_ids = list(product_qty_map.keys())
        stmt = (
            select(Product)
            .where(Product.id.in_(product_ids), Product.store_id == store_id)
            .with_for_update()
        )
        result = await db.execute(stmt)
        products = {p.id: p for p in result.scalars().all()}

        if len(products) != len(product_ids):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="One or more products are invalid or do not belong to this store.",
            )

        # 3. Verify stock, limits, and calculate subtotal using server-side prices
        subtotal_amount = Decimal("0.00")
        order_items_to_create: list[OrderItem] = []

        for p_id, requested_qty in product_qty_map.items():
            product = products[p_id]
            if not product.is_active or not product.published:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Product '{product.name}' is not available for purchase.",
                )

            if product.order_limit and requested_qty > product.order_limit:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Order limit of {product.order_limit} exceeded for '{product.name}'.",
                )

            if product.inventory < requested_qty:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient inventory for '{product.name}'. Available: {product.inventory}, Requested: {requested_qty}",
                )

            item_subtotal = product.price * Decimal(str(requested_qty))
            subtotal_amount += item_subtotal

            # Decrement inventory atomically
            product.inventory -= requested_qty

            order_items_to_create.append(
                OrderItem(
                    product_id=product.id,
                    product_code=product.product_code,
                    product_name=product.name,
                    quantity=requested_qty,
                    unit_price=product.price,
                    subtotal=item_subtotal,
                    image_url=product.image_url,
                )
            )

        # 4. Process Coupon Discount if provided
        discount_amount = Decimal("0.00")
        applied_coupon_code = None

        if request.coupon_code:
            is_valid, disc, _, message = await coupon_service.validate_coupon(
                db, store_id, request.coupon_code, subtotal_amount, lock=True
            )
            if not is_valid:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=message or "Invalid coupon code.",
                )
            discount_amount = disc
            applied_coupon_code = request.coupon_code.upper().strip()
            coup_res = await db.execute(
                select(Coupon)
                .where(Coupon.store_id == store_id, Coupon.code == applied_coupon_code)
                .with_for_update()
            )
            coup = coup_res.scalar_one_or_none()
            if coup:
                coup.usage_count += 1

        total_amount = max(Decimal("0.00"), subtotal_amount - discount_amount)

        # 5. Generate Order Number
        count_res = await db.execute(select(func.count(Order.id)).where(Order.store_id == store_id))
        total_store_orders = count_res.scalar_one() or 0
        order_number = f"ORD-{(total_store_orders + 1001):04d}"

        # 6. Create Order
        new_order = Order(
            order_number=order_number,
            store_id=store_id,
            customer_name=request.customer_name,
            customer_email=request.customer_email.lower(),
            customer_phone=request.customer_phone,
            shipping_address=request.shipping_address,
            subtotal_amount=subtotal_amount,
            discount_amount=discount_amount,
            total_amount=total_amount,
            coupon_code=applied_coupon_code,
            currency=store.currency,
            payment_method=request.payment_method or "COD",
            status="pending",
            payment_status="pending",
        )
        db.add(new_order)
        await db.flush()

        # Attach order items
        for item in order_items_to_create:
            item.order_id = new_order.id
            db.add(item)

        # 7. Commit Transaction
        await db.commit()
        await db.refresh(new_order)

        # Load relationships for response
        res = await db.execute(
            select(Order).where(Order.id == new_order.id).options(selectinload(Order.items))
        )
        return res.scalar_one()

    async def get_store_orders(
        self,
        db: AsyncSession,
        store_id: uuid.UUID,
        owner_id: uuid.UUID,
    ) -> list[Order]:
        """Fetch all orders for a store owned by merchant."""
        await store_service.get_store_by_id(db, store_id, owner_id=owner_id)
        result = await db.execute(
            select(Order)
            .where(Order.store_id == store_id)
            .options(selectinload(Order.items))
            .order_by(Order.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_order_by_id(
        self,
        db: AsyncSession,
        order_id: uuid.UUID,
        owner_id: uuid.UUID | None = None,
    ) -> Order:
        """Fetch single order."""
        result = await db.execute(
            select(Order).where(Order.id == order_id).options(selectinload(Order.items))
        )
        order = result.scalar_one_or_none()
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found.",
            )
        if owner_id:
            await store_service.get_store_by_id(db, order.store_id, owner_id=owner_id)
        return order

    async def update_order_status(
        self,
        db: AsyncSession,
        order_id: uuid.UUID,
        owner_id: uuid.UUID,
        request: OrderStatusUpdateRequest,
    ) -> Order:
        """Update order fulfillment status."""
        order = await self.get_order_by_id(db, order_id, owner_id=owner_id)
        previous_status = order.status
        order.status = request.status
        if request.status == "completed":
            order.payment_status = "paid"
        if request.status == "cancelled" and previous_status != "cancelled":
            await db.refresh(order, attribute_names=["items"])
            for item in order.items:
                if not item.product_id:
                    continue
                prod_res = await db.execute(
                    select(Product).where(Product.id == item.product_id).with_for_update()
                )
                product = prod_res.scalar_one_or_none()
                if product:
                    product.inventory += item.quantity
        await db.commit()
        await db.refresh(order)
        return order

    async def generate_invoice(
        self,
        db: AsyncSession,
        order_id: uuid.UUID,
        owner_id: uuid.UUID,
    ) -> InvoiceResponse:
        """Generate structured invoice data for an order."""
        order = await self.get_order_by_id(db, order_id, owner_id=owner_id)
        store = await store_service.get_store_by_id(db, order.store_id, owner_id=owner_id)

        return InvoiceResponse(
            invoice_number=f"INV-{order.order_number}",
            order=OrderResponse.model_validate(order),
            store=InvoiceStoreDetails(
                name=store.name,
                slug=store.slug,
                category=store.category,
                tagline=store.tagline,
                currency=store.currency,
            ),
            issued_at=datetime.now(UTC),
        )


order_service = OrderService()
