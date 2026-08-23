import { test, expect } from '@playwright/test';

test.describe('Standard User Pages Access', () => {
  test('logged in standard user should be able to access profile page', async ({ page }) => {
    await page.goto('/user/profile');
    
    // Kullanıcının /user/profile adresinde kaldığını ve giriş/oturum sayfasına yönlendirilmediğini doğrula
    await expect(page).toHaveURL(/\/user\/profile|\/profile/);

    // Sayfadaki hesap ayarları başlığının görünür olduğunu doğrula
    await expect(page.getByRole('heading', { name: /account settings|profile/i })).toBeVisible();
  });

});