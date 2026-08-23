import { test, expect } from "@playwright/test";

test.describe("SimpleStore End-to-End User Journey", () => {
  test("Homepage loads and displays telemetry, interactive sandbox, and theme toggle", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/SimpleStore/i);
    await expect(page.locator("h1")).toContainText("Sell online in 5 minutes");

    // Telemetry section
    await expect(page.getByText(/Live Monolith Infrastructure Health/i)).toBeVisible();
    await expect(page.getByText("PostgreSQL 16", { exact: true })).toBeVisible();
    await expect(page.getByText("Redis 7", { exact: true })).toBeVisible();

    // Interactive Sandbox is present
    await expect(page.getByText(/Test the Deterministic Design Matrix/i)).toBeVisible();
    await page.click("button:has-text('Editorial Luxury')");
    await page.click("button:has-text('Emerald')");

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
    await page.fill("#sname", `Artisan Candles ${timestamp}`);
    await page.fill("#scat", "Handmade Scented Candles");
    await page.fill("#sprod", "Organic soy wax candles infused with lavender and amber.");

    // Click Generate Button
    await page.click("button:has-text('Generate Sample Preview')");

    // Wait for AI generation & theme matrix split screen
    await expect(page.getByText(/Theme & Design Matrix/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Live Storefront Preview/i)).toBeVisible();

    // Click Save & Launch Store -> Opens Auth Gate Modal
    await page.click("button:has-text('Save & Launch My Store')");
    await expect(page.getByText(/Create Account to Claim Store/i)).toBeVisible();

    // Fill Auth Gate Modal registration form
    await page.fill("input[placeholder='merchant@example.com']", `merchant-${timestamp}@example.com`);
    await page.fill("input[placeholder='••••••••']", "Password123!");
    await page.click("button:has-text('Create Account & Launch Store')");

    // Should redirect to Merchant Dashboard Hub
    await expect(page).toHaveURL(/.*\/dashboard.*/, { timeout: 15000 });
    await expect(page.getByText(`Artisan Candles ${timestamp}`)).toBeVisible();
    await expect(page.getByText(/Website Status/i)).toBeVisible();
    await expect(page.getByText(/Live & Active/i)).toBeVisible();
  });
});
