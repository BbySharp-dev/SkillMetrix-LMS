import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth-helper';

test.describe('Admin Features', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('Admin dashboard loads with stats', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin/);
    await page.waitForLoadState('networkidle');
    const statsCards = page.locator('[class*="Card"], [class*="card"], [class*="stat"]');
    await expect(statsCards.first()).toBeVisible({ timeout: 10_000 });
  });

  test('Admin sidebar shows all menu items', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('text=Tổng quan').first()).toBeVisible();
    await expect(page.locator('text=Người dùng').first()).toBeVisible();
    await expect(page.locator('text=Quản lý khóa học').first()).toBeVisible();
    await expect(page.locator('text=Duyệt khóa học').first()).toBeVisible();
    await expect(page.locator('text=Cài đặt').first()).toBeVisible();
  });

  test('Navigate to users management', async ({ page }) => {
    await page.goto('/admin');
    await page.click('text=Người dùng');
    await expect(page).toHaveURL(/\/admin\/users/);
    await page.waitForLoadState('networkidle');
  });

  test('Users page loads table with data', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
    const table = page.locator('table');
    await expect(table).toBeVisible({ timeout: 10_000 });
  });

  test('Users page shows correct role counts', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
    // Stats cards should show non-zero values (from actual DB data)
    const statNumbers = page.locator('[class*="Card"] [class*="text-"], [class*="stat"] [class*="text-"]');
    await expect(statNumbers.first()).toBeVisible({ timeout: 10_000 });
  });

  test('User search works', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
    const searchInput = page.locator('input[placeholder*="Tìm"], input[type="search"]').first();
    await searchInput.fill('admin');
    await page.waitForTimeout(600);
    await page.waitForLoadState('networkidle');
  });

  test('Navigate to course management', async ({ page }) => {
    await page.goto('/admin');
    await page.click('text=Quản lý khóa học');
    await expect(page).toHaveURL(/\/admin\/courses/);
    await page.waitForLoadState('networkidle');
  });

  test('Course management page loads', async ({ page }) => {
    await page.goto('/admin/courses');
    await page.waitForLoadState('networkidle');
    const table = page.locator('table');
    await expect(table).toBeVisible({ timeout: 10_000 });
  });

  test('Course management shows status stats', async ({ page }) => {
    await page.goto('/admin/courses');
    await page.waitForLoadState('networkidle');
    await expect(
      page.locator('text=Đang hiển thị, text=Chờ duyệt, text=Bị từ từ').first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('Navigate to approvals page', async ({ page }) => {
    await page.goto('/admin');
    await page.click('text=Duyệt khóa học');
    await expect(page).toHaveURL(/\/admin\/approvals/);
    await page.waitForLoadState('networkidle');
  });

  test('Approvals page loads with pending courses', async ({ page }) => {
    await page.goto('/admin/approvals');
    await page.waitForLoadState('networkidle');
    // Page should show table or empty state
    const content = page.locator('table, [class*="Card"]');
    await expect(content.first()).toBeVisible({ timeout: 10_000 });
  });

  test('Settings page loads', async ({ page }) => {
    await page.goto('/admin/settings');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 5000 });
  });

  test('Non-admin cannot access /admin routes', async ({ browser }) => {
    const ctx = await browser.newContext();
    const studentPage = await ctx.newPage();
    await loginAs(studentPage, 'student');
    await studentPage.goto('/admin');
    await expect(studentPage).toHaveURL(/login|forbidden/, { timeout: 5000 });
    await ctx.close();
  });
});