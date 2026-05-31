import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth-helper';

test.describe('Instructor Features', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'instructor');
  });

  test('Instructor dashboard loads', async ({ page }) => {
    await page.goto('/instructor');
    await expect(page).toHaveURL(/\/instructor/);
    await expect(
      page.locator('text=Tổng quan').first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test('Sidebar shows instructor + student sections', async ({ page }) => {
    await page.goto('/instructor');
    await expect(page.locator('text=Khóa học').first()).toBeVisible();
    await expect(page.locator('text=Khóa học đã ghi danh').first()).toBeVisible();
    await expect(page.locator('text=Lịch sử thanh toán').first()).toBeVisible();
  });

  test('Navigate to instructor courses list', async ({ page }) => {
    await page.goto('/instructor');
    await page.click('text=Khóa học');
    await expect(page).toHaveURL(/\/instructor\/courses/);
    await page.waitForLoadState('networkidle');
  });

  test('Instructor courses page shows course list or empty state', async ({ page }) => {
    await page.goto('/instructor/courses');
    await page.waitForLoadState('networkidle');
    const content = page.locator('table, [class*="course"], [class*="Card"], h3:has-text("Chưa có khóa học nào")');
    await expect(content.first()).toBeVisible({ timeout: 10_000 });
  });

  test('Create course button exists', async ({ page }) => {
    await page.goto('/instructor/courses');
    await page.waitForLoadState('networkidle');
    const createBtn = page.locator('a:has-text("TẠO KHÓA HỌC MỚI"), a:has-text("Tạo"), button:has-text("Tạo"), button:has-text("Thêm")').first();
    await expect(createBtn).toBeVisible({ timeout: 5000 });
  });

  test('Click create course → open editor page', async ({ page }) => {
    await page.goto('/instructor/courses');
    await page.waitForLoadState('networkidle');
    const createBtn = page.locator('a:has-text("TẠO KHÓA HỌC MỚI"), a:has-text("Tạo"), button:has-text("Tạo")').first();
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await expect(page).toHaveURL(/\/instructor\/courses\/new/);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('input[type="text"], textarea').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('Course editor page has curriculum section', async ({ page }) => {
    await page.goto('/instructor/courses');
    await page.waitForLoadState('networkidle');
    const firstCourseLink = page.locator('a[href^="/instructor/courses/"]:not([href$="new"])').first();
    if (await firstCourseLink.isVisible()) {
      await firstCourseLink.click();
      await page.waitForLoadState('networkidle');
      // Switch to curriculum tab
      const curriculumTab = page.locator('button:has-text("Giáo trình"), [role="tab"]:has-text("Giáo trình")').first();
      await curriculumTab.click();
      const curriculumSection = page.locator('text=Cấu trúc khóa học').first()
        .or(page.locator('text=Chương').first())
        .or(page.locator('text=Nội dung').first())
        .or(page.locator('text=Thêm chương').first());
      await expect(curriculumSection).toBeVisible({ timeout: 5000 });
    }
  });

  test('Save course with title only', async ({ page }) => {
    await page.goto('/instructor/courses/new');
    await page.waitForLoadState('networkidle');
    const titleInput = page.locator('input[placeholder*="VD:"], input[placeholder*="Tiêu đề"], input[type="text"]').first();
    await titleInput.fill('Test Course ' + Date.now());
    const saveBtn = page.locator('button:has-text("Lưu"), button:has-text("LƯU THAY ĐỔI"), button:has-text("Tạo khóa học")').first();
    await saveBtn.click();
    await page.waitForLoadState('networkidle');
  });

  test('Instructor can access student features via sidebar', async ({ page }) => {
    await page.goto('/instructor');
    await page.click('text=Khóa học đã ghi danh');
    await expect(page).toHaveURL(/\/instructor\/my-enrollments/);
    await page.waitForLoadState('networkidle');
    const content = page.locator('[class*="course"], [class*="Card"], table, a:has-text("Khám phá"), button:has-text("Khám phá")');
    await expect(content.first()).toBeVisible({ timeout: 10_000 });
  });

  test('Instructor my enrollments shows enrolled courses', async ({ page }) => {
    await page.goto('/instructor/my-enrollments');
    await page.waitForLoadState('networkidle');
    const content = page.locator('[class*="course"], [class*="Card"], table, a:has-text("Khám phá"), button:has-text("Khám phá")');
    await expect(content.first()).toBeVisible({ timeout: 10_000 });
  });

  test('Instructor my transactions loads', async ({ page }) => {
    await page.goto('/instructor/my-transactions');
    await page.waitForLoadState('networkidle');
    const content = page.locator('table, [class*="transaction"], [class*="payment"]');
    await expect(content.first()).toBeVisible({ timeout: 10_000 });
  });
});
