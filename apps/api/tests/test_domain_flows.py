"""Integration tests for Store, Product, Coupon, Inventory, and Order workflows."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import User
from app.core.security import create_access_token, hash_password


@pytest.fixture
async def test_user(db_session: AsyncSession) -> User:
    """Create test merchant user."""
    user = User(
        email="merchant@simplestore.test",
        password_hash=hash_password("Password123!"),
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
def auth_headers(test_user: User) -> dict[str, str]:
    """Generate authorization header for test merchant."""
    token = create_access_token(subject=str(test_user.id))
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_store_creation_and_public_retrieval(
    client: AsyncClient,
    auth_headers: dict[str, str],
):
    """Test merchant creating a store and customer fetching public storefront data."""
    # 1. Create Store
    payload = {
        "name": "Artisan Candles Co",
        "slug": "artisan-candles",
        "category": "Handmade Candles",
        "tagline": "Organic soy candles for your home.",
        "currency": "USD",
        "language": "en",
        "theme_config": {
            "archetype": "warm",
            "font_pairing": "rounded",
            "color_preset": "amber",
            "enable_dark_mode_toggle": True,
            "hero_style": "centered",
        },
        "published": False,
    }
    response = await client.post("/api/v1/stores", json=payload, headers=auth_headers)
    assert response.status_code == 201
    store_data = response.json()
    assert store_data["name"] == "Artisan Candles Co"
    assert store_data["slug"] == "artisan-candles"
    assert store_data["currency"] == "USD"
    store_id = store_data["id"]

    # 2. Add a product to the store with MRP and images
    prod_payload = {
        "name": "Lavender & Sage Candle",
        "slug": "lavender-sage-candle",
        "description": "Calming aroma made with pure essential oils.",
        "mrp": 32.00,
        "price": 24.50,
        "currency": "USD",
        "inventory": 10,
        "images": ["https://example.com/candle1.jpg", "https://example.com/candle2.jpg"],
        "published": True,
    }
    prod_res = await client.post(
        f"/api/v1/stores/{store_id}/products",
        json=prod_payload,
        headers=auth_headers,
    )
    assert prod_res.status_code == 201
    prod_json = prod_res.json()
    assert "id" in prod_json
    assert prod_json["product_code"].startswith("PROD-")
    assert len(prod_json["images"]) == 2

    # 3. Unpublished storefront is not public
    unpublished = await client.get("/api/v1/stores/artisan-candles")
    assert unpublished.status_code == 404

    # 4. Publish the store
    pub_res = await client.post(f"/api/v1/stores/{store_id}/publish", headers=auth_headers)
    assert pub_res.status_code == 200
    assert pub_res.json()["published"] is True

    # 4. Fetch public storefront
    pub_store_res = await client.get("/api/v1/stores/artisan-candles")
    assert pub_store_res.status_code == 200
    pub_data = pub_store_res.json()
    assert pub_data["name"] == "Artisan Candles Co"
    assert len(pub_data["products"]) == 1
    assert pub_data["products"][0]["name"] == "Lavender & Sage Candle"


@pytest.mark.asyncio
async def test_order_creation_and_inventory_atomic_deduction(
    client: AsyncClient,
    auth_headers: dict[str, str],
):
    """Test placing an order decrements inventory server-side and applies coupon."""
    # 1. Create Store
    store_res = await client.post(
        "/api/v1/stores",
        json={"name": "Tea Haven", "slug": "tea-haven", "currency": "USD"},
        headers=auth_headers,
    )
    store_id = store_res.json()["id"]

    # 2. Add Product with 5 inventory
    prod_res = await client.post(
        f"/api/v1/stores/{store_id}/products",
        json={
            "name": "Matcha Green Tea",
            "slug": "matcha-green-tea",
            "mrp": 38.00,
            "price": 30.00,
            "inventory": 5,
            "published": True,
        },
        headers=auth_headers,
    )
    product_id = prod_res.json()["id"]

    # 3. Create 10% Discount Coupon with Suggestions
    coupon_res = await client.post(
        f"/api/v1/stores/{store_id}/coupons",
        json={
            "code": "TEALOVER10",
            "discount_type": "percentage",
            "discount_value": 10.0,
            "show_in_suggestions": True,
            "is_active": True,
        },
        headers=auth_headers,
    )
    assert coupon_res.status_code == 201

    # Check coupon suggestions endpoint
    sugg_res = await client.get(f"/api/v1/stores/{store_id}/coupons/suggestions")
    assert sugg_res.status_code == 200
    assert len(sugg_res.json()) == 1
    assert sugg_res.json()[0]["code"] == "TEALOVER10"

    # 4. Place Customer Order for 2 items with Coupon & COD
    order_payload = {
        "customer_name": "Jane Doe",
        "customer_email": "jane@example.com",
        "customer_phone": "+1234567890",
        "shipping_address": "123 Green St, Portland OR",
        "coupon_code": "TEALOVER10",
        "payment_method": "COD",
        "items": [{"product_id": product_id, "quantity": 2}],
    }
    order_res = await client.post(f"/api/v1/stores/{store_id}/orders", json=order_payload)
    assert order_res.status_code == 201
    order_data = order_res.json()

    # Subtotal = 2 * $30 = $60. 10% Discount = $6. Total = $54.
    assert float(order_data["subtotal_amount"]) == 60.00
    assert float(order_data["discount_amount"]) == 6.00
    assert float(order_data["total_amount"]) == 54.00
    assert order_data["coupon_code"] == "TEALOVER10"
    assert order_data["payment_method"] == "COD"
    assert order_data["payment_status"] == "pending"
    assert order_data["order_number"].startswith("ORD-")
    order_id = order_data["id"]

    # 5. Verify inventory decremented from 5 to 3
    get_prod = await client.get(f"/api/v1/products/{product_id}")
    assert get_prod.json()["inventory"] == 3

    # 6. Verify invoice generation
    inv_res = await client.get(f"/api/v1/orders/{order_id}/invoice", headers=auth_headers)
    assert inv_res.status_code == 200
    inv_data = inv_res.json()
    assert inv_data["invoice_number"].startswith("INV-")
    assert inv_data["store"]["name"] == "Tea Haven"

    # 7. Test batch inventory update endpoint
    batch_res = await client.patch(
        f"/api/v1/stores/{store_id}/inventory/batch",
        json={
            "updates": [
                {
                    "product_id": product_id,
                    "inventory": 25,
                    "inventory_display_limit": 10,
                    "order_limit": 3,
                }
            ]
        },
        headers=auth_headers,
    )
    assert batch_res.status_code == 200
    updated_prods = batch_res.json()
    assert updated_prods[0]["inventory"] == 25
    assert updated_prods[0]["inventory_display_limit"] == 10
    assert updated_prods[0]["order_limit"] == 3


@pytest.mark.asyncio
async def test_invalid_coupon_is_rejected(
    client: AsyncClient,
    auth_headers: dict[str, str],
):
    store_res = await client.post(
        "/api/v1/stores",
        json={"name": "Herb Shop", "slug": "herb-shop", "currency": "USD"},
        headers=auth_headers,
    )
    store_id = store_res.json()["id"]
    prod_res = await client.post(
        f"/api/v1/stores/{store_id}/products",
        json={"name": "Mint Tea", "price": 10.00, "inventory": 5, "published": True},
        headers=auth_headers,
    )
    product_id = prod_res.json()["id"]
    order_res = await client.post(
        f"/api/v1/stores/{store_id}/orders",
        json={
            "customer_name": "Jane Doe",
            "customer_email": "jane@example.com",
            "payment_method": "COD",
            "coupon_code": "NOPE",
            "items": [{"product_id": product_id, "quantity": 1}],
        },
    )
    assert order_res.status_code == 400


@pytest.mark.asyncio
async def test_order_detail_requires_merchant_auth(
    client: AsyncClient,
    auth_headers: dict[str, str],
):
    store_res = await client.post(
        "/api/v1/stores",
        json={"name": "Lockbox", "slug": "lockbox", "currency": "USD"},
        headers=auth_headers,
    )
    store_id = store_res.json()["id"]
    prod_res = await client.post(
        f"/api/v1/stores/{store_id}/products",
        json={"name": "Safe", "price": 12.00, "inventory": 3, "published": True},
        headers=auth_headers,
    )
    order_res = await client.post(
        f"/api/v1/stores/{store_id}/orders",
        json={
            "customer_name": "Jane Doe",
            "customer_email": "jane@example.com",
            "payment_method": "COD",
            "items": [{"product_id": prod_res.json()["id"], "quantity": 1}],
        },
    )
    order_id = order_res.json()["id"]
    anon = await client.get(f"/api/v1/orders/{order_id}")
    assert anon.status_code == 401
    owner = await client.get(f"/api/v1/orders/{order_id}", headers=auth_headers)
    assert owner.status_code == 200

