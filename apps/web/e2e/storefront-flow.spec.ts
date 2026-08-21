import { test, expect } from "@playwright/test";

test.describe("SimpleStore End-to-End User Journey", () => {
  test("Homepage loads and displays telemetry and CTAs", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/SimpleStore/i);
    await expect(page.locator("h1")).toContainText("Sell online in 5 minutes");

    // Telemetry section
    await expect(page.getByText(/Live Monolith Infrastructure Health/i)).toBeVisible();
    await expect(page.getByText(/PostgreSQL 16/i)).toBeVisible();
    await expect(page.getByText(/Redis 7/i)).toBeVisible();
  });

  test("Merchant can navigate to onboarding and generate a store", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page.getByText("Tell us about your store")).toBeVisible();

    // Fill questionnaire
    const timestamp = Date.now();
    await page.fill("#sname", `Artisan Roasters ${timestamp}`);
    await page.fill("#scat", "Specialty Dark Roast Coffee");
    await page.fill("#sprod", "Handcrafted single-origin coffee beans roasted weekly.");
    await page.fill("#memail", `merchant-${timestamp}@example.com`);

    // Click Generate Button
    await page.click("button:has-text('Generate My Store with AI')");

    // Wait for AI generation & theme matrix split screen
    await expect(page.getByText(/Theme & Design Matrix/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Live Storefront Preview/i)).toBeVisible();

    // Toggle Style Archetype to Editorial
    await page.click("button:has-text('Editorial')");
    // Toggle Color Preset
    await page.click("button:has-text('Emerald')");

    // Launch & Publish Store
    await page.click("button:has-text('Launch & Publish Store')");

    // Should redirect to public storefront
    await expect(page).toHaveURL(/.*\/store\/.*/, { timeout: 10000 });
    await expect(page.getByText("All Products")).toBeVisible();

    // Add first product to cart
    const addToCartBtn = page.locator("button:has-text('Add to Cart')").first();
    await addToCartBtn.click();

    // Open Cart Drawer
    await expect(page.getByRole("heading", { name: "Your Cart" })).toBeVisible();
    await expect(page.getByText(/Subtotal/i)).toBeVisible();

    // Click Checkout
    await page.click("button:has-text('Checkout')");

    // Fill customer checkout details
    await expect(page.getByText("Instant Demo Confirmation")).toBeVisible();
    await page.fill("#name", "Alice Customer");
    await page.fill("#email", "alice@example.com");
    await page.fill("#phone", "+1 555 123 4567");
    await page.fill("#address", "Seattle, WA, USA");

    // Place Order
    await page.click("button:has-text('Place Order')");

    // Verify Order Confirmed Receipt Modal
    await expect(page.getByText("Order Confirmed!")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Thank you for your purchase.")).toBeVisible();
    await expect(page.getByText("Order Number")).toBeVisible();
    await expect(page.getByText("Alice Customer")).toBeVisible();
  });
});
