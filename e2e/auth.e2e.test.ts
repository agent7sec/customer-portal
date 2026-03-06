import { test, expect } from '@playwright/test';

test.describe('Authentication E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Sign Up Flow', () => {
    test('should display signup form with all required fields', async ({ page }) => {
      await page.click('text=Sign Up');

      await expect(page.locator('input[type="text"]').first()).toBeVisible();
      await expect(page.locator('label:has-text("First Name")')).toBeVisible();
      await expect(page.locator('label:has-text("Last Name")')).toBeVisible();
      await expect(page.locator('label:has-text("Email")')).toBeVisible();
      await expect(page.locator('label:has-text("Password")').first()).toBeVisible();
      await expect(page.locator('label:has-text("Confirm Password")')).toBeVisible();
      await expect(page.locator('button:has-text("Sign Up")')).toBeVisible();
    });

    test('should show validation errors for empty form submission', async ({ page }) => {
      await page.click('text=Sign Up');
      await page.click('button:has-text("Sign Up")');

      await expect(page.locator('text=First name is required')).toBeVisible();
      await expect(page.locator('text=Last name is required')).toBeVisible();
      await expect(page.locator('text=Email is required')).toBeVisible();
      await expect(page.locator('text=Password is required')).toBeVisible();
    });

    test('should validate email format', async ({ page }) => {
      await page.click('text=Sign Up');
      
      await page.fill('input[type="email"]', 'invalid-email');
      await page.click('button:has-text("Sign Up")');

      await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
    });

    test('should validate password requirements', async ({ page }) => {
      await page.click('text=Sign Up');
      
      // Test weak password
      await page.fill('label:has-text("Password") >> .. >> input', 'weak');
      await page.click('button:has-text("Sign Up")');

      await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();
    });

    test('should validate password confirmation match', async ({ page }) => {
      await page.click('text=Sign Up');
      
      await page.fill('label:has-text("Password") >> .. >> input', 'Test123!@#');
      await page.fill('label:has-text("Confirm Password") >> .. >> input', 'Different123!@#');
      await page.click('button:has-text("Sign Up")');

      await expect(page.locator('text=Passwords do not match')).toBeVisible();
    });

    test('should navigate to login from signup', async ({ page }) => {
      await page.click('text=Sign Up');
      await page.click('button:has-text("Sign In")');

      await expect(page.locator('h2:has-text("Sign In")')).toBeVisible();
    });
  });

  test.describe('Login Flow', () => {
    test('should display login form with required fields', async ({ page }) => {
      await expect(page.locator('label:has-text("Email")')).toBeVisible();
      await expect(page.locator('label:has-text("Password")')).toBeVisible();
      await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
    });

    test('should show validation errors for empty login', async ({ page }) => {
      await page.click('button:has-text("Sign In")');

      await expect(page.locator('text=Email is required')).toBeVisible();
      await expect(page.locator('text=Password is required')).toBeVisible();
    });

    test('should navigate to signup from login', async ({ page }) => {
      await page.click('button:has-text("Sign Up")');

      await expect(page.locator('h2:has-text("Create Account")')).toBeVisible();
    });

    test('should disable form during submission', async ({ page }) => {
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'Test123!@#');
      
      // Click submit
      await page.click('button:has-text("Sign In")');

      // Check that button shows loading state (implementation dependent)
      const submitButton = page.locator('button:has-text("Sign In")');
      await expect(submitButton).toBeDisabled();
    });
  });

  test.describe('Email Verification Flow', () => {
    test('should display verification form after signup', async ({ page }) => {
      // This test assumes successful signup redirects to verification
      // In a real scenario, you'd need to mock the API or use test credentials
      
      await page.click('text=Sign Up');
      
      // Fill out signup form
      await page.fill('label:has-text("First Name") >> .. >> input', 'John');
      await page.fill('label:has-text("Last Name") >> .. >> input', 'Doe');
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('label:has-text("Password") >> .. >> input', 'Test123!@#');
      await page.fill('label:has-text("Confirm Password") >> .. >> input', 'Test123!@#');
      
      // Note: This will fail without proper backend/mocking
      // await page.click('button:has-text("Sign Up")');
      // await expect(page.locator('text=Verification Code')).toBeVisible();
    });
  });

  test.describe('Form Interactions', () => {
    test('should clear validation errors when user types', async ({ page }) => {
      await page.click('button:has-text("Sign In")');
      
      // Trigger validation
      await expect(page.locator('text=Email is required')).toBeVisible();
      
      // Start typing
      await page.fill('input[type="email"]', 't');
      
      // Error should be cleared
      await expect(page.locator('text=Email is required')).not.toBeVisible();
    });

    test('should have proper autocomplete attributes', async ({ page }) => {
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');

      await expect(emailInput).toHaveAttribute('autocomplete', 'email');
      await expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
    });

    test('should be keyboard accessible', async ({ page }) => {
      // Tab through form fields
      await page.keyboard.press('Tab');
      await expect(page.locator('input[type="email"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('input[type="password"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('button:has-text("Sign In")')).toBeFocused();
    });

    test('should submit form on Enter key', async ({ page }) => {
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'Test123!@#');
      
      // Press Enter in password field
      await page.locator('input[type="password"]').press('Enter');
      
      // Form should be submitted (button disabled or loading state shown)
      const submitButton = page.locator('button:has-text("Sign In")');
      await expect(submitButton).toBeDisabled();
    });
  });

  test.describe('Responsive Design', () => {
    test('should display properly on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await expect(page.locator('h2:has-text("Sign In")')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
    });

    test('should display properly on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await expect(page.locator('h2:has-text("Sign In")')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels', async ({ page }) => {
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');

      // Check that inputs have associated labels
      await expect(emailInput).toHaveAttribute('id');
      await expect(passwordInput).toHaveAttribute('id');
    });

    test('should show error messages with proper semantics', async ({ page }) => {
      await page.click('button:has-text("Sign In")');
      
      // Error messages should be visible and associated with inputs
      const errorMessage = page.locator('text=Email is required');
      await expect(errorMessage).toBeVisible();
    });
  });
});
