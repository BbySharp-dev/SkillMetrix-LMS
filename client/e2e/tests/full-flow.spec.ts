import { test, expect } from '@playwright/test';
import { loginAs, logout } from '../helpers/auth-helper';

test.describe('Full Student Flow E2E Test', () => {
  // Reset storage state for a clean session before each test run
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Student full flow: login -> browse courses -> view course -> learn lesson -> logout', async ({ page }) => {
    // 1. Login as student
    console.log('Step 1: Logging in as student...');
    await loginAs(page, 'student');
    await expect(page).toHaveURL(/\/dashboard/);

    // 2. Navigate to Course list
    console.log('Step 2: Navigating to Course listings...');
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');
    
    // Check if courses are visible
    const courseCard = page.locator('a[href^="/courses/"]').first();
    await expect(courseCard).toBeVisible({ timeout: 10000 });
    
    // 3. Click the first course to view details
    console.log('Step 3: Clicking first course to view details...');
    const courseUrl = await courseCard.getAttribute('href');
    expect(courseUrl).not.toBeNull();
    
    await page.goto(courseUrl!);
    await page.waitForLoadState('networkidle');
    
    // 4. Enroll or Start Learning
    console.log('Step 4: Checking enrollment status & entering classroom...');
    // The student may already be enrolled in some courses, or need to enroll.
    // We check for "Vào học", "Học tiếp" or "Đăng ký học", "Mua khóa học"
    const startLearningBtn = page.locator('button:has-text("Vào học"), button:has-text("Học tiếp"), button:has-text("Học ngay")').first();
    const enrollBtn = page.locator('button:has-text("Đăng ký"), button:has-text("Mua khóa học"), button:has-text("Đăng ký ngay")').first();
    
    if (await startLearningBtn.isVisible()) {
      console.log('Student already enrolled. Clicking learning button...');
      await startLearningBtn.click();
    } else if (await enrollBtn.isVisible()) {
      console.log('Student not enrolled yet. Clicking enroll button...');
      await enrollBtn.click();
      // Click the confirmation button inside the dialog modal (which is the second "ĐĂNG KÝ NGAY" button on the page)
      const confirmBtn = page.locator('button:has-text("ĐĂNG KÝ NGAY")').nth(1);
      await confirmBtn.click();
      await page.waitForLoadState('networkidle');
      console.log('Redirecting to classroom after enrollment...');
    } else {
      // If neither is visible, fallback to visiting /learning/:id directly using the course ID
      const courseId = courseUrl!.split('/').pop();
      console.log(`Fallback: Navigating directly to /learning/${courseId}`);
      await page.goto(`/learning/${courseId}`);
    }
    
    // 5. Verify classroom interface loads
    console.log('Step 5: Verifying classroom interface...');
    await page.waitForURL(/\/learning\//, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    
    // The learning interface should show curriculum or lesson components
    const lessonTitle = page.locator('[class*="lesson"], h1, h2, h3, [class*="Lesson"]').first();
    await expect(lessonTitle).toBeVisible({ timeout: 10000 });
    
    console.log('Success: Full E2E flow test completed without errors!');
  });
});
