import { expect, test } from 'playwright/test';

test('captures the desktop homepage', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page).toHaveTitle('Rubix');

  await page.screenshot({
    path: 'artifacts/cubedesk.png',
    fullPage: true,
  });
});
