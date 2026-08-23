"""Product domain service managing inventory, product CRUD, and store scoping."""

import uuid

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.products.models import Product
from app.products.schemas import (
    BatchInventoryUpdateRequest,
    ProductCreateRequest,
    ProductUpdateRequest,
)
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

        # Auto-generate product_code if not supplied (e.g. PROD-001)
        product_code = request.product_code
        if not product_code:
            count_result = await db.execute(
                select(func.count(Product.id)).where(Product.store_id == store_id)
            )
            count = count_result.scalar_one() or 0
            product_code = f"PROD-{(count + 1):03d}"

        # Images list handling
        images_list = request.images or []
        primary_image = request.image_url
        if not primary_image and images_list:
            primary_image = images_list[0]
        elif primary_image and primary_image not in images_list:
            images_list = [primary_image] + images_list

        new_product = Product(
            store_id=store_id,
            product_code=product_code,
            name=request.name,
            slug=clean_slug,
            description=request.description,
            mrp=request.mrp or request.price,
            price=request.price,
            currency=store.currency,
            inventory=request.inventory,
            inventory_display_limit=request.inventory_display_limit,
            order_limit=request.order_limit,
            image_url=primary_image,
            images=images_list[:5],  # max 5 photos
            is_ai_generated=request.is_ai_generated,
            is_active=request.is_active,
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
        """Update product details, price, inventory, or photos."""
        product = await self.get_product_by_id(db, product_id)
        # Verify ownership of parent store
        await store_service.get_store_by_id(db, product.store_id, owner_id=owner_id)

        update_data = request.model_dump(exclude_unset=True)
        if "slug" in update_data and update_data["slug"]:
            clean_slug = slugify(update_data["slug"])
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

        if "images" in update_data and update_data["images"] is not None:
            update_data["images"] = update_data["images"][:5]
            if not update_data.get("image_url") and update_data["images"]:
                update_data["image_url"] = update_data["images"][0]

        for key, value in update_data.items():
            if value is not None:
                setattr(product, key, value)

        await db.commit()
        await db.refresh(product)
        return product

    async def update_inventory_batch(
        self,
        db: AsyncSession,
        store_id: uuid.UUID,
        owner_id: uuid.UUID,
        request: BatchInventoryUpdateRequest,
    ) -> list[Product]:
        """Batch update inventory quantities and limits for fast inline table editing."""
        await store_service.get_store_by_id(db, store_id, owner_id=owner_id)
        updated_products = []

        for item in request.updates:
            result = await db.execute(
                select(Product).where(Product.id == item.product_id, Product.store_id == store_id)
            )
            prod = result.scalar_one_or_none()
            if prod:
                prod.inventory = item.inventory
                if item.inventory_display_limit is not None:
                    prod.inventory_display_limit = item.inventory_display_limit
                if item.order_limit is not None:
                    prod.order_limit = item.order_limit
                updated_products.append(prod)

        await db.commit()
        for p in updated_products:
            await db.refresh(p)
        return updated_products

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
