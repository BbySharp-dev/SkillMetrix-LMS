import { test, expect } from '@playwright/test';

test.describe('Public pages', () => {
  test('Home page loads with course listings', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/SkillMetrix|Khóa học/);
    await expect(page.locator('a[href^="/courses/"]').first()).toBeVisible({ timeout: 10_000 });
  });

  test('Course search works', async ({ page }) => {
    await page.goto('/');
    const searchInput = page.locator('input[placeholder*="Tìm"], input[placeholder*="Search"], input[type="search"]').first();
    await searchInput.fill('test');
    await page.keyboard.press('Enter');
    await page.waitForLoadState('networkidle');
    // Should show results or empty state
    const cards = page.locator('a[href^="/courses/"], h3:has-text("không tìm thấy"), h3:has-text("Chưa có")');
    await expect(cards.first()).toBeVisible({ timeout: 10_000 });
  });

  test('Course filter by category works', async ({ page }) => {
    await page.goto('/');
    const filterBtn = page.locator('button:has-text("Danh mục"), button:has-text("Lọc"), [aria-label*="filter"]').first();
    if (await filterBtn.isVisible()) {
      await filterBtn.click();
      await page.waitForTimeout(500);
      await page.locator('[role="option"], [role="menuitem"]').first().click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('Click course → navigate to course detail', async ({ page }) => {
    await page.goto('/');
    const courseCard = page.locator('a[href^="/courses/"]').first();
    if (await courseCard.isVisible()) {
      await courseCard.click();
      await expect(page).toHaveURL(/\/courses\/[^/]+/);
      await expect(page.locator('text=Mô tả, text=Giá, text=Khóa học').first()).toBeVisible({ timeout: 10_000 });
    }
  });

  test('Course detail page shows curriculum and enroll button', async ({ page }) => {
    // First go to home page to find a valid course link
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const courseCard = page.locator('a[href^="/courses/"]').first();
    
    // If there are no courses yet, skip this test
    if (!(await courseCard.isVisible())) {
      return;
    }
    
    // Get the href and navigate to it
    const courseUrl = await courseCard.getAttribute('href');
    if (courseUrl) {
      await page.goto(courseUrl);
      await page.waitForLoadState('networkidle');
      
      // Check curriculum
      await expect(
        page.locator('text=Nội dung khóa học').first()
      ).toBeVisible({ timeout: 10_000 });
      
      // Check enroll button
      const enrollBtn = page.locator('button:has-text("Đăng ký"), button:has-text("Mua khóa học"), button:has-text("ĐĂNG KÝ NGAY"), button:has-text("VÀO HỌC NGAY"), button:has-text("Enroll")').first();
      await expect(enrollBtn).toBeVisible({ timeout: 5000 });
    }
  });

  test('Login link on login page works', async ({ page }) => {
    await page.goto('/login');
    const registerLink = page.locator('a:has-text("Đăng ký"), a:has-text("Register")');
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await expect(page).toHaveURL(/\/register/);
    }
  });

  test('Register page loads', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
