import { expect, test } from '@playwright/test';

async function openLetter(page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open your little surprise' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Enable the magic mirror' })).toBeDisabled();
  await page.getByRole('button', { name: 'Continue without recording' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('a few words for you');
}

async function reachProposal(page) {
  await page.getByRole('button', { name: 'See yourself through my eyes' }).click();
  await expect(page.locator('.photo-pin')).toHaveCount(0);
  await expect(page.locator('.photo-annotation')).toHaveCount(0);
  await expect(page.locator('.memory-polaroid')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'A little game, just for us' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Another little memory' }).click();
  await page.getByRole('button', { name: 'I saved the cutest for last' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('cutest scene ever');
  await page.getByRole('button', { name: 'A little game, just for us' }).click();
  await page.getByRole('button', { name: 'A beach at sunset' }).click();
  await expect(page.locator('.quiz-feedback')).toContainText('close second');
  await page.getByRole('button', { name: 'Anywhere with you' }).click();
  await page.getByRole('button', { name: 'One more little question' }).click();
  await page.getByRole('button', { name: 'You, a movie & takeout' }).click();
  await page.getByRole('button', { name: 'One more little question' }).click();
  await page.getByRole('button', { name: 'Definitely me' }).click();
  await page.getByRole('button', { name: 'There’s more I love about you' }).click();
  await page.locator('.reason-card').first().click();
  await expect(page.locator('.reason-card').first()).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'I have something to ask you' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Will you be my forever?');
}

test('complete experience without camera, with trivia and annotations', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await openLetter(page);
  await reachProposal(page);
  await page.getByRole('button', { name: 'Let me think' }).click();
  await expect(page.getByRole('button', { name: 'Are you sure?' })).toBeVisible();
  await page.getByRole('button', { name: 'YES!' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('You said yes.');
  await expect(page.locator('.keepsake-note')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('camera denial gracefully proceeds to the letter', async ({ page }) => {
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => { throw new DOMException('Denied', 'NotAllowedError'); };
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open your little surprise' }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Enable the magic mirror' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('a few words for you');
});

test('welcome fits the viewport and dialog traps keyboard focus', async ({ page }) => {
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Open your little surprise' }).click();
  await expect(page.getByRole('checkbox')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: 'Continue without recording' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('consented reaction records, finalizes after yes, plays, and downloads', async ({ page, context }) => {
  await context.grantPermissions(['camera', 'microphone']);
  await page.goto('/');
  await page.getByRole('button', { name: 'Open your little surprise' }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Enable the magic mirror' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('a few words for you');
  await reachProposal(page);
  await expect(page.locator('.proposal-footnote')).toContainText(/recording/i);
  const started = Date.now();
  await page.getByRole('button', { name: 'YES!' }).click();
  const envelope = page.getByRole('button', { name: 'ONE LAST LITTLE SURPRISE' });
  await expect(envelope).toBeVisible({ timeout: 10000 });
  expect(Date.now() - started).toBeGreaterThanOrEqual(2400);
  await envelope.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('video')).toHaveAttribute('src', /^blob:/);
  await expect(page.locator('video')).toHaveCSS('transform', 'matrix(-1, 0, 0, 1, 0, 0)');
  await expect.poll(() => page.locator('video').evaluate(video => video.readyState)).toBeGreaterThanOrEqual(1);
  const download = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Save video' }).click();
  expect((await download).suggestedFilename()).toMatch(/^our-little-yes\.(mp4|webm)$/);
  await page.getByRole('button', { name: 'Close reaction video' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('skipping a pending permission request never skips the letter', async ({ page }) => {
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = () => new Promise((_, reject) => setTimeout(() => reject(new DOMException('Denied', 'NotAllowedError')), 1000));
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open your little surprise' }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Enable the magic mirror' }).click();
  await page.getByRole('button', { name: 'Continue without recording' }).click();
  await page.waitForTimeout(1200);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('a few words for you');
});

test('real no after 15 seconds discards recording and respects the answer', async ({ page, context }) => {
  test.setTimeout(45000);
  await context.grantPermissions(['camera', 'microphone']);
  await page.addInitScript(() => {
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = async constraints => {
      const stream = await original(constraints);
      window.testReactionStream = stream;
      return stream;
    };
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open your little surprise' }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Enable the magic mirror' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('a few words for you');
  await reachProposal(page);
  await expect(page.locator('.proposal-footnote')).toContainText(/recording/i);
  await expect(page.getByRole('button', { name: 'Is it really a no?' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Let me think' }).click();
  const started = Date.now();
  await expect(page.getByRole('button', { name: 'Is it really a no?' })).toBeVisible({ timeout: 18000 });
  expect(Date.now() - started).toBeGreaterThanOrEqual(14000);
  await page.getByRole('button', { name: 'Is it really a no?' }).click();
  await page.getByRole('button', { name: 'Yes, it’s a no' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('being honest');
  await expect(page.locator('.secret-envelope')).toHaveCount(0);
  await expect(page.locator('.celebration-icon')).toHaveCount(0);
  expect(await page.evaluate(() => window.testReactionStream.getTracks().every(track => track.readyState === 'ended'))).toBe(true);
});
