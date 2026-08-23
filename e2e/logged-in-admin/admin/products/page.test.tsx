import { test, expect } from '@playwright/test';

test.describe('Admin - Product Lifecycle', () => {
  const uniqueId = Date.now();
  const testProductName = `ProdInit${uniqueId}`;
  const updatedProductName = `ProdEdit${uniqueId}`;

  const validPngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  );

  test('logged in admin user should be able to create, update, and delete a product', async ({ page }) => {
    // 1. ADIM: Admin Ürünler Sayfasına Git
    await page.goto('/admin/products');
    await expect(page).toHaveURL('/admin/products');

    // 2. ADIM: Ürün Oluştur (Create)
    await page.getByRole('link', { name: 'Create product' }).first().click();

    await page.getByLabel('Name').fill(testProductName);
    await page.getByLabel('Description').fill('E2E test ürün açıklaması.');
    await page.getByLabel('Price').fill('99');
    await page.getByLabel('Stock').fill('10');

    await page.locator('input[name="images"]').setInputFiles({
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: validPngBuffer,
    });

    await page.getByRole('button', { name: 'Create product' }).click();

    await expect(page.getByText('Product created')).toBeVisible({ timeout: 15_000 });
    await page.getByRole('link', { name: 'View all products' }).click();
    await expect(page.getByText(testProductName)).toBeVisible({ timeout: 15_000 });

    // 3. ADIM: Ürün Güncelle (Update)
    const productRow = page.locator('tr', { hasText: testProductName });
    await productRow.getByRole('link', { name: 'Edit' }).click();

    const nameInput = page.getByRole('textbox').first();
    await expect(nameInput).toBeVisible();
    await nameInput.fill(updatedProductName);

    await page.getByRole('button', { name: /save changes|save/i }).click();

    await page.waitForTimeout(3000);
    await page.goto('/admin/products');
    await expect(page.getByText(updatedProductName)).toBeVisible({ timeout: 15_000 });

    // 4. ADIM: Ürün Sil (Delete)
    const updatedRow = page.locator('tr', { hasText: updatedProductName });
    
    // Tablodaki Delete/Remove linkine/butonuna basarak silme sayfasına yönlen
    await updatedRow.getByRole('link', { name: /delete|remove/i }).click();

    // Açılan /admin/products/[id]/delete sayfasındaki "Delete product" butonuna tıkla
    await expect(page.getByText('Confirm deletion')).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: 'Delete product' }).click();

    // Silindikten sonra listenin güncellendiğini doğrula
    await page.waitForTimeout(2000);
    await page.goto('/admin/products');
    await expect(page.getByText(updatedProductName)).not.toBeVisible({ timeout: 15_000 });
  });
});