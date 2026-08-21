import { test, expect } from "@playwright/test";

test.describe("Merchant Dashboard Flow", () => {
  test("Merchant can register, build store, add product with AI, create coupon, and switch appearance", async ({ page }) => {
    // 1. Register a merchant
    const timestamp = Date.now();
    await page.goto("/auth/register");
    await page.fill("#email", `merchant-${timestamp}@example.com`);
    await page.fill("#pass", "Password123!");
    await page.click("button:has-text('Create Account')");

    // Land on onboarding
    await expect(page).toHaveURL(/.*\/onboarding.*/, { timeout: 10000 });
    await page.fill("#sname", `Bakery Haven ${timestamp}`);
    await page.fill("#scat", "Fresh Artisan Bakery");
    await page.fill("#sprod", "Fresh sourdough breads and buttery croissants.");

    // Generate store
    await page.click("button:has-text('Generate My Store with AI')");
    await expect(page.getByText(/Theme & Design Matrix/i)).toBeVisible({ timeout: 15000 });
    await page.click("button:has-text('Launch & Publish Store')");
    await expect(page).toHaveURL(/.*\/store\/.*/, { timeout: 10000 });

    // 2. Go to Dashboard
    await page.goto("/dashboard");
    await expect(page.getByText(/Bakery Haven/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Total Revenue/i)).toBeVisible();

    // 3. Products Tab: Add new product with AI button
    await page.click("button[role='tab']:has-text('Products')");
    await page.click("button:has-text('Add Product')");

    await page.fill("#pname", "Cinnamon Brioche Swirl");
    await page.fill("#pprice", "6.50");
    await page.fill("#pstock", "20");

    // Click AI write button
    await page.click("button:has-text('Write it for me (AI)')");
    await expect(page.locator("#pdesc")).not.toBeEmpty({ timeout: 10000 });

    // Submit product
    await page.click("button:has-text('Add to Catalog')");
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Cinnamon Brioche Swirl")).toBeVisible();

    // 4. Coupons Tab: Create promo code
    await page.click("button[role='tab']:has-text('Coupons')");
    await page.click("button:has-text('Create Coupon')");

    await page.fill("#ccode", `SAVE15_${timestamp}`);
    await page.fill("input[type='number']", "15");
    await page.click("button:has-text('Save Promo Code')");
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5000 });
    await expect(page.getByText(`SAVE15_${timestamp}`)).toBeVisible();

    // 5. Appearance Tab: Switch theme and save
    await page.click("button[role='tab']:has-text('Appearance')");
    await page.click("button:has-text('Warm Organic')");
    await page.click("button:has-text('Save Theme Changes')");
    await expect(page.getByText(/Saved!/i)).toBeVisible({ timeout: 5000 });
  });
});
