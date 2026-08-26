import { test, expect } from "@playwright/test";

test.describe("SimpleStore End-to-End User Journey", () => {
  test("Homepage loads with clear value proposition, interactive sandbox, and theme toggle", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/SimpleStore/i);
    await expect(page.locator("h1")).toContainText("Turn your passion into a thriving online store");

    // Value pillars
    await expect(page.getByText(/Built for Modern Merchants/i)).toBeVisible();
    await expect(page.getByText("Pre-Built Luxury Aesthetics", { exact: true })).toBeVisible();
    await expect(page.getByText("Cash on Delivery & Instant Checkout", { exact: true })).toBeVisible();

    // Interactive Sandbox is present
    await expect(page.getByText(/Test your store’s look and feel/i)).toBeVisible();
    await page.locator("button:has-text('Bold High-Contrast')").first().click();
    await page.locator("button:has-text('Forest Emerald')").first().click();

    // Dark Mode Toggle works
    const themeBtn = page.getByRole("button", { name: /Toggle theme/i });
    await expect(themeBtn).toBeVisible();
    await themeBtn.click();
    await page.click("div[role='menuitem']:has-text('Dark')");
    await expect(page.locator("html")).toHaveClass(/dark/);

    // Switch back to Light
    await themeBtn.click();
    await page.click("div[role='menuitem']:has-text('Light')");
    await expect(page.locator("html")).not.toHaveClass(/dark/);
  });

  test("Merchant can navigate onboarding, use Auth Gate modal, and launch store", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page.getByText("Tell us about your store")).toBeVisible();

    // Fill questionnaire
    const timestamp = Date.now();
    await page.fill("#storeName", `Artisan Candles ${timestamp}`);
    await page.fill("#category", "Handmade Scented Candles");
    await page.fill("#productSummary", "Organic soy wax candles infused with lavender and amber.");

    // Click Generate Button
    await page.click("button:has-text('Build Live Store Preview')");

    // Wait for split-screen customizer
    await expect(page.getByText(/Customize Storefront/i)).toBeVisible({ timeout: 15000 });

    // Click Save & Launch Store -> Opens Auth Gate Modal
    await page.click("button:has-text('Save & Launch My Store')");
    await expect(page.getByText(/Create Account to Launch Store/i)).toBeVisible();

    // Fill Auth Gate Modal registration form
    await page.fill("input[placeholder='merchant@example.com']", `merchant-${timestamp}@example.com`);
    await page.fill("input[placeholder='••••••••']", "Password123!");
    await page.click("button:has-text('Create & Launch Store')");

    // Should redirect to Merchant Dashboard Hub
    await expect(page).toHaveURL(/.*\/dashboard.*/, { timeout: 15000 });
    await expect(page.getByText(`Artisan Candles ${timestamp}`)).toBeVisible();
    await expect(page.getByText(/Website Status/i)).toBeVisible();
    await expect(page.getByText(/Live & Active/i)).toBeVisible();
  });
});
