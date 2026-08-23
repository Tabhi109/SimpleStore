"""Product REST API Router."""

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import User
from app.core.dependencies import get_current_user, get_db
from app.products.schemas import (
    BatchInventoryUpdateRequest,
    ProductCreateRequest,
    ProductResponse,
    ProductUpdateRequest,
)
from app.products.service import product_service

router = APIRouter(tags=["Products"])


@router.post(
    "/stores/{store_id}/products",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add product to store",
)
async def create_product(
    store_id: uuid.UUID,
    request: ProductCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create product in store."""
    return await product_service.create_product(db, store_id, current_user.id, request)


@router.get(
    "/stores/{store_id}/products",
    response_model=list[ProductResponse],
    summary="List store products for merchant",
)
async def get_store_products(
    store_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List products in a merchant store."""
    return await product_service.get_store_products(db, store_id, current_user.id)


@router.patch(
    "/stores/{store_id}/inventory/batch",
    response_model=list[ProductResponse],
    summary="Batch update inventory quantities & limits",
)
async def batch_update_inventory(
    store_id: uuid.UUID,
    request: BatchInventoryUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Batch update inventory numbers for inline table editing."""
    return await product_service.update_inventory_batch(db, store_id, current_user.id, request)


@router.get(
    "/products/{product_id}",
    response_model=ProductResponse,
    summary="Get single product details",
)
async def get_product(
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Fetch single product."""
    return await product_service.get_product_by_id(db, product_id)


@router.patch(
    "/products/{product_id}",
    response_model=ProductResponse,
    summary="Update product details or inventory",
)
async def update_product(
    product_id: uuid.UUID,
    request: ProductUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update product fields."""
    return await product_service.update_product(db, product_id, current_user.id, request)


@router.delete(
    "/products/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a product",
)
async def delete_product(
    product_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a product."""
    await product_service.delete_product(db, product_id, current_user.id)
    return None
