import { test, expect } from '@playwright/test';

test.describe('CSP-Compliant Landing Page Navigation', () => {
  test('should navigate to sign in page when Sign in button is clicked', async ({ page }) => {
    // In development mode, we allow unsafe-inline/unsafe-eval for Next.js
    // In production, we would have a strict CSP
    const cspViolations: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('Content Security Policy')) {
        cspViolations.push(msg.text());
      }
    });

    await page.goto('/');
    
    // Click the Sign in button in hero section
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Assert URL is correct
    await expect(page).toHaveURL('/auth/signin');
    
    // Assert no CSP violations occurred (should be none with proper dev CSP)
    expect(cspViolations).toHaveLength(0);
    
    // Assert page content loaded
    await expect(page.getByRole('heading', { name: /sign in to studiomate/i })).toBeVisible();
  });

  test('should navigate to signup page when Get started button is clicked', async ({ page }) => {
    // Capture any CSP violations  
    const cspViolations: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('Content Security Policy')) {
        cspViolations.push(msg.text());
      }
    });

    await page.goto('/');
    
    // Click the Get Started button in hero section
    await page.getByRole('button', { name: /get started/i }).click();
    
    // Assert URL is correct (should go to signup, which then redirects to profile/setup)
    await expect(page).toHaveURL('/auth/signup');
    
    // Assert no CSP violations occurred
    expect(cspViolations).toHaveLength(0);
    
    // Assert page content loaded
    await expect(page.getByRole('heading', { name: /create your studiomate account/i })).toBeVisible();
  });

  test('should not have CSP violations on page load', async ({ page }) => {
    const cspViolations: string[] = [];
    const networkErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        if (msg.text().includes('Content Security Policy')) {
          cspViolations.push(msg.text());
        }
        if (msg.text().includes('Failed to load') || msg.text().includes('404')) {
          networkErrors.push(msg.text());
        }
      }
    });

    page.on('response', response => {
      if (response.status() >= 400) {
        networkErrors.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.goto('/');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Assert no CSP violations
    expect(cspViolations).toHaveLength(0);
    
    // Assert no critical network errors (layout.css, etc)
    const criticalErrors = networkErrors.filter(error => 
      error.includes('layout.css') || error.includes('.css')
    );
    expect(criticalErrors).toHaveLength(0);
    
    // Assert key elements are visible
    await expect(page.getByText('StudioMate')).toBeVisible();
    await expect(page.getByRole('button', { name: /get started/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });
});