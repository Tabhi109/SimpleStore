import { test, expect } from "@playwright/test";

test.describe("Merchant Dashboard & Shopper End-to-End Flow", () => {
  test("Full merchant management: Products 5-image modal, Inline Inventory, Coupons, and Shopper COD Checkout", async ({ page }) => {
    // 1. Register a merchant
    const timestamp = Date.now();
    await page.goto("/auth/register");
    await page.fill("#email", `creator-${timestamp}@example.com`);
    await page.fill("#pass", "Password123!");
    await page.click("button:has-text('Create Account')");

    // Land on onboarding
    await expect(page).toHaveURL(/.*\/onboarding.*/, { timeout: 10000 });
    await page.fill("#sname", `Luxe Candles ${timestamp}`);
    await page.fill("#scat", "Aromatherapy Soy Candles");
    await page.fill("#sprod", "Hand-poured organic candles with wooden wicks.");

    // Generate store
    await page.click("button:has-text('Generate Sample Preview')");
    await expect(page.getByText(/Theme & Design Matrix/i)).toBeVisible({ timeout: 15000 });
    await page.click("button:has-text('Save & Launch My Store')");

    // Redirected to Dashboard Hub
    await expect(page).toHaveURL(/.*\/dashboard.*/, { timeout: 15000 });
    await expect(page.getByText(`Luxe Candles ${timestamp}`)).toBeVisible();
    await expect(page.getByText(/Website Status/i)).toBeVisible();

    // 2. Products Tab: Add product with MRP, Selling Price, and open Photo Gallery Modal
    await page.click("button[role='tab']:has-text('Products')");
    await page.click("button:has-text('Add New Product')");

    await page.fill("input[placeholder='e.g. Lavender Soy Candle']", "Midnight Amber Glow");
    await page.fill("input[placeholder='25.00']", "30.00");
    await page.fill("input[placeholder='19.99']", "24.00");

    // Paste an image URL into product drawer and click exact "Add"
    await page.fill("input[placeholder='Or paste image URL...']", "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500");
    await page.getByRole("dialog").getByRole("button", { name: "Add", exact: true }).click();

    // Click AI write button
    await page.click("button:has-text('Write it for me (AI)')");

    // Save Product
    await page.click("button:has-text('Create Product')");
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Midnight Amber Glow")).toBeVisible();

    // Open Photo Gallery Modal (👁️)
    await page.locator("button:has-text('Photos')").first().click();
    await expect(page.getByText(/Photo Gallery/i)).toBeVisible();
    await page.keyboard.press("Escape");

    // 3. Inventory Tab: Fast inline stock editing
    await page.click("button[role='tab']:has-text('Inventory')");
    await expect(page.getByText(/Fast Inline Inventory Management/i)).toBeVisible();
    await page.click("button:has-text('Save All Inventory Changes')");
    await expect(page.getByText(/Inventory Updated!/i)).toBeVisible({ timeout: 5000 });

    // 4. Coupons Tab: Create promo code with suggestions toggle
    await page.click("button[role='tab']:has-text('Coupons')");
    await page.click("button:has-text('Create Coupon Code')");

    await page.fill("input[placeholder='e.g. WELCOME10, CANDLE20']", `SAVE20`);
    await page.fill("input[type='number'] >> nth=0", "20");
    await page.click("button:has-text('Save Coupon Code')");
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5000 });
    await expect(page.getByText("SAVE20")).toBeVisible();

    // 5. Shopper Flow: Open Live Storefront, add to cart, apply coupon pill, and COD checkout
    await page.click("button[role='tab']:has-text('Overview')");
    const storeLink = await page.getByRole("link", { name: "Open Live Store" }).getAttribute("href");
    await page.goto(storeLink || "/store/velvet-flame-candles");

    // Switch to store page context
    await expect(page).toHaveURL(/.*\/store\/.*/, { timeout: 10000 });
    await expect(page.getByText("All Products")).toBeVisible();

    // Add item to cart
    const addBtn = page.locator("button:has-text('Add to Cart')").first();
    await addBtn.click();

    // Cart drawer should be visible with one-click coupon pill
    await expect(page.getByRole("heading", { name: "Your Cart" })).toBeVisible();
    await expect(page.getByText("SAVE20")).toBeVisible();

    // Click suggested coupon pill
    await page.getByRole("button", { name: /SAVE20/i }).click();
    await expect(page.getByText(/Applied: SAVE20/i)).toBeVisible({ timeout: 5000 });

    // Click Checkout
    await page.click("button:has-text('Checkout')");

    // Fill customer profile and full delivery address
    await expect(page.getByText("Complete Your Order")).toBeVisible();
    await page.fill("#name", "Bob Shopper");
    await page.fill("#email", "bob@example.com");
    await page.fill("#phone", "+1 555 987 6543");
    await page.fill("#street", "742 Evergreen Terrace");
    await page.fill("#city", "Springfield");
    await page.fill("#zip", "97477");

    // Place COD Order
    await page.click("button:has-text('Confirm & Place COD Order')");

    // Verify Order Confirmation Receipt Modal
    await expect(page.getByText("Order Confirmed!")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Bob Shopper/i)).toBeVisible();
    await expect(page.getByText(/COD • Pending Delivery/i)).toBeVisible();
  });
});
