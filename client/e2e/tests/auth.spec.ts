import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../helpers/test-credentials';

test.describe('Auth flows', () => {
  test('Student login → redirect to /dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_USERS.student.email);
    await page.fill('input[type="password"]', TEST_USERS.student.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('text=Khóa học của tôi')).toBeVisible();
  });

  test('Instructor login → redirect to /instructor', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_USERS.instructor.email);
    await page.fill('input[type="password"]', TEST_USERS.instructor.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/instructor/);
    await expect(page.locator('text=Tổng quan').or(page.locator('text=Quản lý'))).toBeVisible();
  });

  test('Admin login → redirect to /admin', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_USERS.admin.email);
    await page.fill('input[type="password"]', TEST_USERS.admin.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.locator('text=Tổng quan').or(page.locator('text=Quản trị'))).toBeVisible();
  });

  test('Moderator login → redirect to /admin', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_USERS.moderator.email);
    await page.fill('input[type="password"]', TEST_USERS.moderator.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin/);
  });

  test('Login with wrong password → show error', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_USERS.student.email);
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Sai email hoặc mật khẩu, thử lại').or(page.locator('[role="alert"]'))).toBeVisible({ timeout: 5000 });
  });

  test('Unauthenticated access to /dashboard → redirect to /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Unauthenticated access to /instructor → redirect to /login', async ({ page }) => {
    await page.goto('/instructor');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Unauthenticated access to /admin → redirect to /login', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
  });
});
