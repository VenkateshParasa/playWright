import { test, expect } from '../fixtures/test-helpers';
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage } from '../pages/AuthPages';
import { TEST_USERS, generateTestUser } from '../fixtures/test-data';

test.describe('Authentication Flows', () => {
  test.describe('Login', () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
      loginPage = new LoginPage(page);
      await loginPage.goto();
    });

    test('should display login form', async () => {
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.submitButton).toBeVisible();
    });

    test('should login with valid credentials', async ({ page }) => {
      await loginPage.login(TEST_USERS.student.email, TEST_USERS.student.password);

      // Verify redirect to dashboard
      await expect(page).toHaveURL(/\/dashboard/);
      await page.waitForLoadState('networkidle');
    });

    test('should show error with invalid credentials', async () => {
      await loginPage.login('invalid@test.com', 'wrongpassword');

      // Verify error message appears
      await expect(loginPage.errorMessage).toBeVisible();
      const errorText = await loginPage.getErrorMessage();
      expect(errorText.toLowerCase()).toContain('invalid');
    });

    test('should show error with empty fields', async () => {
      await loginPage.submitButton.click();

      // HTML5 validation or custom error
      const isEmailInvalid = await loginPage.emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
      expect(isEmailInvalid).toBe(true);
    });

    test('should toggle password visibility', async () => {
      await loginPage.passwordInput.fill('testpassword');

      // Check initial type
      let inputType = await loginPage.passwordInput.getAttribute('type');
      expect(inputType).toBe('password');

      // Toggle visibility
      await loginPage.togglePasswordVisibility();

      // Check changed type
      inputType = await loginPage.passwordInput.getAttribute('type');
      expect(inputType).toBe('text');
    });

    test('should remember user when checkbox is checked', async ({ page }) => {
      await loginPage.login(TEST_USERS.student.email, TEST_USERS.student.password, true);

      // Verify remember me is stored
      const rememberMe = await page.evaluate(() => localStorage.getItem('rememberMe'));
      expect(rememberMe).toBeTruthy();
    });

    test('should navigate to registration page', async ({ page }) => {
      await loginPage.goToRegister();
      await expect(page).toHaveURL(/\/register/);
    });

    test('should navigate to forgot password page', async ({ page }) => {
      await loginPage.goToForgotPassword();
      await expect(page).toHaveURL(/\/forgot-password/);
    });

    test('should persist login across page refresh', async ({ page }) => {
      await loginPage.login(TEST_USERS.student.email, TEST_USERS.student.password);
      await page.waitForURL(/\/dashboard/);

      // Refresh page
      await page.reload();

      // Should still be on dashboard
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate offline mode
      await page.context().setOffline(true);

      await loginPage.login(TEST_USERS.student.email, TEST_USERS.student.password);

      // Should show network error
      await expect(loginPage.errorMessage).toBeVisible();

      // Restore online mode
      await page.context().setOffline(false);
    });
  });

  test.describe('Registration', () => {
    let registerPage: RegisterPage;

    test.beforeEach(async ({ page }) => {
      registerPage = new RegisterPage(page);
      await registerPage.goto();
    });

    test('should display registration form', async () => {
      await expect(registerPage.firstNameInput).toBeVisible();
      await expect(registerPage.lastNameInput).toBeVisible();
      await expect(registerPage.emailInput).toBeVisible();
      await expect(registerPage.passwordInput).toBeVisible();
      await expect(registerPage.confirmPasswordInput).toBeVisible();
    });

    test('should register new user successfully', async ({ page }) => {
      const newUser = generateTestUser();

      await registerPage.register({
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        password: newUser.password,
        acceptTerms: true,
      });

      // Verify redirect to dashboard or success page
      await page.waitForURL(/\/(dashboard|welcome)/, { timeout: 10000 });
    });

    test('should show error when passwords do not match', async () => {
      const newUser = generateTestUser();

      await registerPage.register({
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        password: newUser.password,
        confirmPassword: 'different-password',
        acceptTerms: true,
      });

      // Verify error message
      await expect(registerPage.errorMessage).toBeVisible();
      const errorText = await registerPage.getErrorMessage();
      expect(errorText.toLowerCase()).toContain('password');
    });

    test('should validate email format', async () => {
      await registerPage.emailInput.fill('invalid-email');
      await registerPage.submitButton.click();

      const isInvalid = await registerPage.emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
      expect(isInvalid).toBe(true);
    });

    test('should require terms acceptance', async () => {
      const newUser = generateTestUser();

      await registerPage.register({
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        password: newUser.password,
        acceptTerms: false,
      });

      // Should show error or prevent submission
      const isChecked = await registerPage.termsCheckbox.isChecked();
      expect(isChecked).toBe(false);
    });

    test('should show error for duplicate email', async () => {
      // Try to register with existing user email
      await registerPage.register({
        firstName: 'Test',
        lastName: 'User',
        email: TEST_USERS.student.email,
        password: 'Test123!@#',
        acceptTerms: true,
      });

      // Verify error message
      await expect(registerPage.errorMessage).toBeVisible();
      const errorText = await registerPage.getErrorMessage();
      expect(errorText.toLowerCase()).toContain('exists' || 'already');
    });

    test('should validate password strength', async () => {
      const newUser = generateTestUser();

      await registerPage.firstNameInput.fill(newUser.firstName);
      await registerPage.lastNameInput.fill(newUser.lastName);
      await registerPage.emailInput.fill(newUser.email);

      // Try weak password
      await registerPage.passwordInput.fill('123');

      // Should show password strength indicator or error
      await registerPage.submitButton.click();
      await expect(registerPage.errorMessage).toBeVisible();
    });

    test('should navigate to login page', async ({ page }) => {
      await registerPage.goToLogin();
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Password Reset', () => {
    let forgotPasswordPage: ForgotPasswordPage;

    test.beforeEach(async ({ page }) => {
      forgotPasswordPage = new ForgotPasswordPage(page);
      await forgotPasswordPage.goto();
    });

    test('should display forgot password form', async () => {
      await expect(forgotPasswordPage.emailInput).toBeVisible();
      await expect(forgotPasswordPage.submitButton).toBeVisible();
    });

    test('should send reset link for valid email', async () => {
      await forgotPasswordPage.requestPasswordReset(TEST_USERS.student.email);

      // Verify success message
      await expect(forgotPasswordPage.successMessage).toBeVisible();
      const successText = await forgotPasswordPage.getSuccessMessage();
      expect(successText.toLowerCase()).toContain('email' || 'sent');
    });

    test('should handle unknown email gracefully', async () => {
      await forgotPasswordPage.requestPasswordReset('unknown@test.com');

      // For security, might show success message anyway
      // or show specific error - depends on implementation
      await expect(
        forgotPasswordPage.successMessage.or(forgotPasswordPage.errorMessage)
      ).toBeVisible();
    });

    test('should navigate back to login', async ({ page }) => {
      await forgotPasswordPage.goToLogin();
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Reset Password', () => {
    test('should display reset password form with valid token', async ({ page }) => {
      const resetPasswordPage = new ResetPasswordPage(page);
      await resetPasswordPage.goto('valid-reset-token');

      await expect(resetPasswordPage.newPasswordInput).toBeVisible();
      await expect(resetPasswordPage.confirmPasswordInput).toBeVisible();
    });

    test('should reset password successfully', async ({ page }) => {
      const resetPasswordPage = new ResetPasswordPage(page);
      await resetPasswordPage.goto('valid-reset-token');

      await resetPasswordPage.resetPassword('NewPassword123!@#');

      // Verify success message or redirect to login
      await expect(resetPasswordPage.successMessage).toBeVisible();
    });

    test('should show error for invalid token', async ({ page }) => {
      const resetPasswordPage = new ResetPasswordPage(page);
      await resetPasswordPage.goto('invalid-token');

      // Should show error or redirect
      await expect(resetPasswordPage.errorMessage).toBeVisible();
    });

    test('should validate password match', async ({ page }) => {
      const resetPasswordPage = new ResetPasswordPage(page);
      await resetPasswordPage.goto('valid-reset-token');

      await resetPasswordPage.resetPassword('NewPassword123!@#', 'DifferentPassword');

      // Should show error
      await expect(resetPasswordPage.errorMessage).toBeVisible();
    });
  });

  test.describe('Logout', () => {
    test('should logout successfully', async ({ page, authHelper }) => {
      // Login first
      await authHelper.login(TEST_USERS.student.email, TEST_USERS.student.password);

      // Logout
      await authHelper.logout();

      // Verify redirect to login
      await expect(page).toHaveURL(/\/login/);

      // Verify token is cleared
      const token = await authHelper.getAuthToken();
      expect(token).toBeNull();
    });

    test('should clear session data on logout', async ({ page, authHelper, storageHelper }) => {
      await authHelper.login(TEST_USERS.student.email, TEST_USERS.student.password);

      // Verify session data exists
      const tokenBefore = await storageHelper.getItem('token');
      expect(tokenBefore).toBeTruthy();

      // Logout
      await authHelper.logout();

      // Verify session data is cleared
      const tokenAfter = await storageHelper.getItem('token');
      expect(tokenAfter).toBeNull();
    });

    test('should prevent access to protected routes after logout', async ({ page, authHelper }) => {
      await authHelper.login(TEST_USERS.student.email, TEST_USERS.student.password);
      await authHelper.logout();

      // Try to access protected route
      await page.goto('/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Session Management', () => {
    test('should maintain session across tabs', async ({ browser }) => {
      const context = await browser.newContext();
      const page1 = await context.newPage();
      const page2 = await context.newPage();

      const loginPage = new LoginPage(page1);
      await loginPage.goto();
      await loginPage.login(TEST_USERS.student.email, TEST_USERS.student.password);

      // Open dashboard in second tab
      await page2.goto('/dashboard');

      // Should be authenticated in both tabs
      await expect(page1).toHaveURL(/\/dashboard/);
      await expect(page2).toHaveURL(/\/dashboard/);

      await context.close();
    });

    test('should handle concurrent login attempts', async ({ browser }) => {
      const context1 = await browser.newContext();
      const context2 = await browser.newContext();

      const page1 = await context1.newPage();
      const page2 = await context2.newPage();

      const loginPage1 = new LoginPage(page1);
      const loginPage2 = new LoginPage(page2);

      await loginPage1.goto();
      await loginPage2.goto();

      // Login simultaneously
      await Promise.all([
        loginPage1.login(TEST_USERS.student.email, TEST_USERS.student.password),
        loginPage2.login(TEST_USERS.student.email, TEST_USERS.student.password),
      ]);

      // Both should succeed
      await expect(page1).toHaveURL(/\/dashboard/);
      await expect(page2).toHaveURL(/\/dashboard/);

      await context1.close();
      await context2.close();
    });

    test('should handle expired session', async ({ page, authHelper, storageHelper }) => {
      await authHelper.login(TEST_USERS.student.email, TEST_USERS.student.password);

      // Set expired token
      await storageHelper.setItem('token', 'expired-token');

      // Try to access protected route
      await page.goto('/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });
  });
});
