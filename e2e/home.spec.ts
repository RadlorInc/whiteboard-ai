import { test, expect } from "@playwright/test";

// Smoke (M0): the home page renders. The expected name is written here by hand, not imported from src/product.ts.
test("the home page renders the product name", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Ask anything. Watch it drawn.");
  await expect(page).toHaveTitle("Whiteboard AI");
});
