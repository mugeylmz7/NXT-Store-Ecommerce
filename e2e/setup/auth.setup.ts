import fs from "node:fs";
import path from "node:path";
import { expect, test as setup, type Page } from "@playwright/test";

const authDir = path.join(__dirname, "..", ".auth");
const authFile = path.join(authDir, "admin.json");

async function assertNoAuth0CallbackError(page: Page): Promise<void> {
  const url = new URL(page.url());
  const error = url.searchParams.get("error");
  if (!error) {
    return;
  }

  const description = url.searchParams.get("error_description") ?? "unknown";
  throw new Error(
    [
      "Auth0 login was denied.",
      `error=${error}`,
      `error_description=${description}`,
      "Check Auth0 Actions/Rules for this app, and that E2E_ADMIN_EMAIL is allowed to log in.",
    ].join("\n"),
  );
}

async function completeAuth0Login(page: Page): Promise<void> {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      [
        "Missing E2E admin credentials.",
        "Add to .env.local:",
        "  E2E_ADMIN_EMAIL=admin@test.com",
        "  E2E_ADMIN_PASSWORD=your-password",
      ].join("\n"),
    );
  }

  const acceptButton = page.getByRole("button", { name: "Accept" });
  const emailInput = page.getByRole("textbox", { name: "Email address" });

  await expect(acceptButton.or(emailInput)).toBeVisible({ timeout: 15_000 });

  if (await acceptButton.isVisible()) {
    await acceptButton.click();
  } else {
    await emailInput.fill(email);
    await page.getByRole("textbox", { name: "Password" }).fill(password);
    await page.getByRole("button", { name: "Continue", exact: true }).click();
  }

  await page.waitForURL(/localhost:3000/, { timeout: 30_000 });
  await assertNoAuth0CallbackError(page);
}

setup("authenticate as admin", async ({ page }) => {
  fs.mkdirSync(authDir, { recursive: true });

  await page.goto("/admin/products");

  // Next.js auth redirects can finish after goto resolves — wait for a real outcome.
  const productsHeading = page.getByRole("heading", { name: "Products" });
  const auth0Email = page.getByRole("textbox", { name: "Email address" });
  const auth0Accept = page.getByRole("button", { name: "Accept" });

  await expect(productsHeading.or(auth0Email).or(auth0Accept)).toBeVisible({
    timeout: 30_000,
  });

  if (!(await productsHeading.isVisible())) {
    await completeAuth0Login(page);
    await page.goto("/admin/products");
  }

  if (page.url().includes("/forbidden")) {
    throw new Error(
      "E2E admin user lacks the admin role. Assign the admin role in Auth0.",
    );
  }

  await expect(page).toHaveURL(/\/admin\/products/);
  await expect(productsHeading).toBeVisible();

  await page.context().storageState({ path: authFile });
});