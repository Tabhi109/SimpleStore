"""Order REST API Router."""

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import User
from app.core.dependencies import get_current_user, get_db
from app.orders.schemas import (
    InvoiceResponse,
    OrderCreateRequest,
    OrderResponse,
    OrderStatusUpdateRequest,
)
from app.orders.service import order_service

router = APIRouter(tags=["Orders"])


@router.post(
    "/stores/{store_id}/orders",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Place customer order (Transaction-safe)",
)
async def create_order(
    store_id: uuid.UUID,
    request: OrderCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Place customer order with server-side inventory deduction and price recalculation."""
    return await order_service.create_order(db, store_id, request)


@router.get(
    "/stores/{store_id}/orders",
    response_model=list[OrderResponse],
    summary="List store orders for merchant",
)
async def get_store_orders(
    store_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List orders for a merchant store."""
    return await order_service.get_store_orders(db, store_id, current_user.id)


@router.get(
    "/orders/{order_id}",
    response_model=OrderResponse,
    summary="Get single order details (receipt)",
)
async def get_order(
    order_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Fetch order details for confirmation receipt."""
    return await order_service.get_order_by_id(db, order_id)


@router.get(
    "/orders/{order_id}/invoice",
    response_model=InvoiceResponse,
    summary="Generate invoice for order",
)
async def get_order_invoice(
    order_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Fetch structured invoice data for an order."""
    return await order_service.generate_invoice(db, order_id, current_user.id)


@router.patch(
    "/orders/{order_id}/status",
    response_model=OrderResponse,
    summary="Update order fulfillment status",
)
async def update_order_status(
    order_id: uuid.UUID,
    request: OrderStatusUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update order status (e.g. pending -> processing -> completed)."""
    return await order_service.update_order_status(db, order_id, current_user.id, request)
