import { test, expect } from "@playwright/test";

test("sign up, create a dynamic QR code, scan it, and see it recorded", async ({ page, request }) => {
  const email = `e2e-${Date.now()}@example.com`;

  await page.goto("/signup");
  await page.getByLabel("Name").fill("E2E Tester");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);

  await page.getByRole("button", { name: "Create QR code" }).first().click();
  await expect(page).toHaveURL(/\/dashboard\/qr\/new$/);

  await page.getByLabel("Name").fill("E2E Website");
  await page.getByLabel("Destination URL").fill("https://example.com");
  await page.getByRole("switch").click();
  await page.getByRole("button", { name: "Create QR code" }).click();

  await expect(page).toHaveURL(/\/dashboard\/qr\/[^/]+$/);
  await expect(page.getByText("Dynamic")).toBeVisible();

  const shortUrl = (await page.locator("p", { hasText: "/r/" }).first().textContent())?.trim();
  expect(shortUrl).toBeTruthy();

  const scanResponse = await request.get(shortUrl!, { maxRedirects: 0 });
  expect([301, 302, 307, 308]).toContain(scanResponse.status());

  await page.reload();
  await expect(page.getByText("Total scans: 1")).toBeVisible();
});
