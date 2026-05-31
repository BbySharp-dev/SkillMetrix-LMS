import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth-helper';

test.describe('Student Dashboard', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'student');
  });

  test('Dashboard overview loads', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(
      page.locator('text=Bảng điều khiển').first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test('Sidebar shows student navigation', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('text=Khóa học của tôi')).toBeVisible();
    await expect(page.locator('text=Lịch sử thanh toán')).toBeVisible();
  });

  test('Navigate to my enrollments', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('text=Khóa học của tôi');
    await expect(page).toHaveURL(/\/dashboard\/my-enrollments/);
    await page.waitForLoadState('networkidle');
  });

  test('My enrollments shows enrolled courses', async ({ page }) => {
    await page.goto('/dashboard/my-enrollments');
    await page.waitForLoadState('networkidle');
    // Should show course list or empty state
    const content = page.locator('[class*="course"], [class*="Card"], table, [class*="enrollment"], a:has-text("Khám phá"), button:has-text("Khám phá")');
    await expect(content.first()).toBeVisible({ timeout: 10_000 });
  });

  test('Navigate to my transactions', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('text=Lịch sử thanh toán');
    await expect(page).toHaveURL(/\/dashboard\/my-transactions/);
    await page.waitForLoadState('networkidle');
  });

  test('Transactions page loads', async ({ page }) => {
    await page.goto('/dashboard/my-transactions');
    await page.waitForLoadState('networkidle');
    // Should show table or empty state
    const content = page.locator('table, [class*="transaction"], [class*="payment"]');
    await expect(content.first()).toBeVisible({ timeout: 10_000 });
  });

  test('Click enrolled course → go to learning page', async ({ page }) => {
    await page.goto('/dashboard/my-enrollments');
    await page.waitForLoadState('networkidle');
    const courseLink = page.locator('a[href^="/learning/"]').first();
    if (await courseLink.isVisible()) {
      await courseLink.click();
      await expect(page).toHaveURL(/\/learning\//);
    }
  });
});
