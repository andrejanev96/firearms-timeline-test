import { test, expect } from '@playwright/test';

// Helper to stabilize screenshots by disabling animations/transitions
async function disableAnimations(page) {
  await page.addStyleTag({ content: `
    *, *::before, *::after { 
      transition: none !important; 
      animation: none !important; 
      caret-color: transparent !important;
    }
    html { scroll-behavior: auto !important; }
  `});
}

test.describe('Timeline visual regression', () => {
  test('desktop 1440px', async ({ page }) => {
    await page.goto('/');
    await disableAnimations(page);

    // Enter the quiz from intro
    await page.getByRole('button', { name: /start timeline challenge/i }).click();

    // Wait for timeline to render
    const timeline = page.locator('.chronological-timeline');
    await expect(timeline).toBeVisible();

    // Screenshot the component
    await expect(timeline).toHaveScreenshot('timeline-1440.png');
  });

  test('tablet 1024px', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.goto('/');
    await disableAnimations(page);
    await page.getByRole('button', { name: /start timeline challenge/i }).click();
    const timeline = page.locator('.chronological-timeline');
    await expect(timeline).toBeVisible();
    await expect(timeline).toHaveScreenshot('timeline-1024.png');
  });

  test('small tablet 768px', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 900 });
    await page.goto('/');
    await disableAnimations(page);
    await page.getByRole('button', { name: /start timeline challenge/i }).click();
    const timeline = page.locator('.chronological-timeline');
    await expect(timeline).toBeVisible();
    await expect(timeline).toHaveScreenshot('timeline-768.png');
  });

  test('phone 430px', async ({ page }) => {
    await page.setViewportSize({ width: 430, height: 900 });
    await page.goto('/');
    await disableAnimations(page);
    await page.getByRole('button', { name: /start timeline challenge/i }).click();
    const timeline = page.locator('.chronological-timeline');
    await expect(timeline).toBeVisible();
    await expect(timeline).toHaveScreenshot('timeline-430.png');
  });
});

