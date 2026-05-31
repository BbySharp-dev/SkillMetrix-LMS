import { type Page } from '@playwright/test';
import { TEST_USERS } from './test-credentials';

export async function loginAs(page: Page, role: keyof typeof TEST_USERS): Promise<void> {
  const { email, password } = TEST_USERS[role];
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard|instructor|admin|\/$/, { timeout: 10_000 });
}

export async function logout(page: Page): Promise<void> {
  await page.click('button:has-text("Đăng xuất"), button:has-text("Logout")');
  await page.waitForURL('/login');
}
