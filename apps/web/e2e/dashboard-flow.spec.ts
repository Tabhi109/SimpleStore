import { test, expect } from "@playwright/test";

test.describe("Merchant Dashboard & Shopper End-to-End Flow", () => {
  test("Full merchant management: Products 5-image modal, Inline Inventory, Coupons, and Shopper COD Checkout", async ({ page }) => {
    // 1. Register a merchant
    const timestamp = Date.now();
    await page.goto("/auth/register");
    await page.fill("#email", `creator-${timestamp}@example.com`);
    await page.fill("#pass", "Password123!");
    await page.click("button:has-text('Create Account & Continue')");

    // Land on onboarding categorized builder
    await expect(page).toHaveURL(/.*\/onboarding.*/, { timeout: 10000 });
    await expect(page.getByText(/Customize Storefront/i)).toBeVisible();

    await page.fill("#storeName", `Luxe Candles ${timestamp}`);
    await page.fill("#category", "Aromatherapy Soy Candles");

    // Launch store directly (already logged in)
    await page.locator("button:has-text('Save & Launch My Store')").first().click();

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
    const liveStoreLink = await page.locator("a:has-text('Open Live Store')").getAttribute("href");
    expect(liveStoreLink).toBeTruthy();

    await page.goto(liveStoreLink!);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(`Luxe Candles ${timestamp}`);

    // Add to cart from storefront (automatically opens Cart Drawer)
    await page.click("button:has-text('Add') >> nth=0");
    await expect(page.getByRole("heading", { name: /Your Cart/i })).toBeVisible();

    // Click suggested coupon pill
    const couponPill = page.locator("button:has-text('SAVE20')");
    if (await couponPill.isVisible()) {
      await couponPill.click();
    }

    // Proceed to Checkout
    await page.click("button:has-text('Checkout')");
    await expect(page.getByRole("heading", { name: "Complete Your Order" })).toBeVisible();

    // Fill customer checkout details
    await page.fill("input[placeholder='Alice Customer']", "Aarav Sharma");
    await page.fill("input[placeholder='alice@example.com']", "aarav@gmail.com");
    await page.fill("input[placeholder='+1 (555) 123-4567']", "+91 9876543210");
    await page.fill("input[placeholder='124 Olive St, Apt 4B']", "74 Park Avenue");
    await page.fill("input[placeholder='Seattle']", "Mumbai");
    await page.fill("input[placeholder='98101']", "400001");

    // Place Order via COD
    await page.click("button:has-text('Confirm & Place COD Order')");

    // Expect Receipt Confirmation Modal
    await expect(page.getByRole("heading", { name: /Order Confirmed!/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Aarav Sharma")).toBeVisible();
    await expect(page.getByText(/COD • Pending Delivery/i)).toBeVisible();
  });
});
