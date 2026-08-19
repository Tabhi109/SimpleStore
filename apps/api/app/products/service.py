"""Product domain service managing inventory, product CRUD, and store scoping."""

import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.products.models import Product
from app.products.schemas import ProductCreateRequest, ProductUpdateRequest
from app.stores.service import slugify, store_service


class ProductService:
    """Service for product inventory and catalog management."""

    async def create_product(
        self,
        db: AsyncSession,
        store_id: uuid.UUID,
        owner_id: uuid.UUID,
        request: ProductCreateRequest,
    ) -> Product:
        """Create a new product inside a store."""
        # Verify store ownership
        store = await store_service.get_store_by_id(db, store_id, owner_id=owner_id)

        clean_slug = slugify(request.slug or request.name)
        # Check slug unique within store
        result = await db.execute(
            select(Product).where(Product.store_id == store_id, Product.slug == clean_slug)
        )
        if result.scalar_one_or_none():
            clean_slug = f"{clean_slug}-{uuid.uuid4().hex[:4]}"

        new_product = Product(
            store_id=store_id,
            name=request.name,
            slug=clean_slug,
            description=request.description,
            price=request.price,
            currency=store.currency,  # inherit store currency
            inventory=request.inventory,
            image_url=request.image_url,
            is_ai_generated=request.is_ai_generated,
            published=request.published,
        )
        db.add(new_product)
        await db.commit()
        await db.refresh(new_product)
        return new_product

    async def get_store_products(
        self,
        db: AsyncSession,
        store_id: uuid.UUID,
        owner_id: uuid.UUID,
    ) -> list[Product]:
        """List all products for merchant dashboard."""
        await store_service.get_store_by_id(db, store_id, owner_id=owner_id)
        result = await db.execute(
            select(Product).where(Product.store_id == store_id).order_by(Product.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_product_by_id(
        self,
        db: AsyncSession,
        product_id: uuid.UUID,
    ) -> Product:
        """Fetch single product."""
        result = await db.execute(select(Product).where(Product.id == product_id))
        product = result.scalar_one_or_none()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found.",
            )
        return product

    async def update_product(
        self,
        db: AsyncSession,
        product_id: uuid.UUID,
        owner_id: uuid.UUID,
        request: ProductUpdateRequest,
    ) -> Product:
        """Update product details, price, or inventory."""
        product = await self.get_product_by_id(db, product_id)
        # Verify ownership of parent store
        await store_service.get_store_by_id(db, product.store_id, owner_id=owner_id)

        update_data = request.model_dump(exclude_unset=True)
        if "slug" in update_data and update_data["slug"]:
            clean_slug = slugify(update_data["slug"])
            # Check unique within store
            res = await db.execute(
                select(Product).where(
                    Product.store_id == product.store_id,
                    Product.slug == clean_slug,
                    Product.id != product_id,
                )
            )
            if res.scalar_one_or_none():
                clean_slug = f"{clean_slug}-{uuid.uuid4().hex[:4]}"
            update_data["slug"] = clean_slug

        for key, value in update_data.items():
            if value is not None:
                setattr(product, key, value)

        await db.commit()
        await db.refresh(product)
        return product

    async def delete_product(
        self,
        db: AsyncSession,
        product_id: uuid.UUID,
        owner_id: uuid.UUID,
    ) -> bool:
        """Delete a product."""
        product = await self.get_product_by_id(db, product_id)
        await store_service.get_store_by_id(db, product.store_id, owner_id=owner_id)

        await db.delete(product)
        await db.commit()
        return True


product_service = ProductService()
