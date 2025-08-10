import { test, expect } from '@playwright/test';

/**
 * Modal Overlay Tests
 * 
 * Ensures modal overlays maintain the light StudioMate aesthetic
 * and don't introduce dark/black backgrounds that make the UI appear dark.
 */

test.describe('Modal Overlay Theme Compliance', () => {
  
  test('artwork modal overlay uses light theme colors', async ({ page }) => {
    // Go to portfolio page that has artwork modals
    await page.goto('/portfolio');
    
    // Wait for any auth redirects to complete
    await page.waitForURL(/\/(portfolio|auth\/signin)/);
    
    // If redirected to signin, sign in first
    if (page.url().includes('/auth/signin')) {
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'testpassword');
      await page.click('button[type="submit"]');
      await page.waitForURL('/portfolio');
    }
    
    // Look for artwork items to click
    const artworkItems = page.locator('[data-testid="artwork-item"], .artwork-item, .gallery-item').first();
    
    // Skip test if no artwork items are present
    const artworkCount = await artworkItems.count();
    test.skip(artworkCount === 0, 'No artwork items found to test modal');
    
    // Click on first artwork to trigger modal
    await artworkItems.click();
    
    // Wait for modal overlay to appear
    const overlay = page.locator('div.fixed.inset-0, .overlay-frost').first();
    await expect(overlay).toBeVisible({ timeout: 5000 });
    
    // Get computed background color of the overlay
    const backgroundColor = await overlay.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    
    // Parse RGB values to ensure it's not black/dark
    const rgbMatch = backgroundColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const [, r, g, b] = rgbMatch.map(Number);
      
      // Assert RGB values are light (> 200 for cream/light colors)
      // StudioMate base-100 (#FFF5E9) should give high RGB values
      expect(r).toBeGreaterThan(200);
      expect(g).toBeGreaterThan(200);
      expect(b).toBeGreaterThan(200);
    } else if (backgroundColor.includes('rgba')) {
      // Handle RGBA format
      const rgbaMatch = backgroundColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
      if (rgbaMatch) {
        const [, r, g, b] = rgbaMatch.slice(1, 4).map(Number);
        expect(r).toBeGreaterThan(200);
        expect(g).toBeGreaterThan(200); 
        expect(b).toBeGreaterThan(200);
      }
    }
    
    // Ensure overlay is not pure black or dark gray
    expect(backgroundColor).not.toMatch(/rgb\(0,\s*0,\s*0\)/); // pure black
    expect(backgroundColor).not.toMatch(/rgb\([0-4]?[0-9],\s*[0-4]?[0-9],\s*[0-4]?[0-9]\)/); // very dark
    
    // Test that Escape key closes the modal
    await page.keyboard.press('Escape');
    
    // Verify overlay is no longer visible
    await expect(overlay).not.toBeVisible({ timeout: 2000 });
  });
  
  test('sidebar drawer overlay uses light theme', async ({ page }) => {
    // Go to dashboard
    await page.goto('/dashboard');
    
    // Wait for any auth redirects
    await page.waitForURL(/\/(dashboard|auth\/signin)/);
    
    // Handle auth if needed
    if (page.url().includes('/auth/signin')) {
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'testpassword');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
    }
    
    // Find and click hamburger menu (should be visible on mobile/small screens)
    const hamburger = page.locator('button[aria-controls="app-drawer"], [aria-label*="navigation"]').first();
    
    // Make the viewport smaller to ensure hamburger is visible
    await page.setViewportSize({ width: 800, height: 600 });
    
    // Click hamburger to open drawer
    await hamburger.click();
    
    // Wait for drawer overlay to appear
    const drawerOverlay = page.locator('#app-drawer').first();
    await expect(drawerOverlay).toBeVisible({ timeout: 3000 });
    
    // Find the overlay backdrop (should be a sibling of the drawer)
    const backdrop = page.locator('.overlay-frost, div.fixed.inset-0').first();
    
    if (await backdrop.isVisible()) {
      const backgroundColor = await backdrop.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      
      // Ensure backdrop is not black
      expect(backgroundColor).not.toMatch(/rgb\(0,\s*0,\s*0\)/);
      expect(backgroundColor).not.toMatch(/rgb\([0-4]?[0-9],\s*[0-4]?[0-9],\s*[0-4]?[0-9]\)/);
    }
    
    // Test Escape key closes drawer
    await page.keyboard.press('Escape');
    await expect(drawerOverlay).not.toBeVisible({ timeout: 2000 });
  });
  
  test('no dark overlays exist on page load', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for any dark overlays that might be mounted but not visible
    const darkOverlays = page.locator([
      '.bg-black\\/\\d+',
      '.bg-neutral-900\\/\\d+', 
      '.bg-gray-900\\/\\d+',
      '[class*="bg-black/"]',
      '[style*="background: rgb(0, 0, 0)"]',
      '[style*="background-color: rgb(0, 0, 0)"]'
    ].join(', '));
    
    const count = await darkOverlays.count();
    
    // Report any dark overlays found
    if (count > 0) {
      const elements = await darkOverlays.all();
      for (const element of elements) {
        const className = await element.getAttribute('class');
        const style = await element.getAttribute('style');
        console.log(`Dark overlay found - Class: ${className}, Style: ${style}`);
      }
    }
    
    expect(count).toBe(0);
  });
});