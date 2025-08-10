import { test, expect } from '@playwright/test';

test.describe('Landing Page Navigation', () => {
  test('should navigate to sign in page when Sign in button is clicked', async ({ page }) => {
    await page.goto('/');
    
    // Click the Sign in button in navigation
    await page.getByRole('button', { name: /sign in/i }).first().click();
    
    // Assert URL is correct
    await expect(page).toHaveURL('/auth/signin');
    
    // Assert page content
    await expect(page.getByRole('heading', { name: /sign in to studiomate/i })).toBeVisible();
  });

  test('should navigate to sign up page when Get started button is clicked', async ({ page }) => {
    await page.goto('/');
    
    // Click the Get Started button in hero section
    await page.getByRole('button', { name: /get started/i }).click();
    
    // Assert URL is correct
    await expect(page).toHaveURL('/auth/signup');
    
    // Assert page content
    await expect(page.getByRole('heading', { name: /create your studiomate account/i })).toBeVisible();
  });

  test('should navigate to sign up page when Create Account button is clicked', async ({ page }) => {
    await page.goto('/');
    
    // Click the Create Account button in navigation
    await page.getByRole('button', { name: /create account/i }).first().click();
    
    // Assert URL is correct  
    await expect(page).toHaveURL('/auth/signup');
    
    // Assert page content
    await expect(page.getByRole('heading', { name: /create your studiomate account/i })).toBeVisible();
  });

  test('should navigate to opportunities page when Opportunities button is clicked', async ({ page }) => {
    await page.goto('/');
    
    // Click the Opportunities button in navigation
    await page.getByRole('button', { name: /opportunities/i }).click();
    
    // Assert URL is correct
    await expect(page).toHaveURL('/opportunities');
  });

  test('should navigate to sign up page when Create Your Profile button is clicked', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to CTA section
    await page.getByRole('button', { name: /create your profile/i }).scrollIntoViewIfNeeded();
    
    // Click the Create Your Profile button in CTA section
    await page.getByRole('button', { name: /create your profile/i }).click();
    
    // Assert URL is correct
    await expect(page).toHaveURL('/auth/signup');
    
    // Assert page content
    await expect(page.getByRole('heading', { name: /create your studiomate account/i })).toBeVisible();
  });
});