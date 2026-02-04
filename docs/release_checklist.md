# Release Checklist - Login & Redirect Fixes

## 1. Defect Verification (Smoke Test)
- [ ] **Scenario A: Normal Login**
    1. Open Incognito window (clean state).
    2. Navigate to `/login`.
    3. Enter valid credentials.
    4. Click "Login".
    5. **Expectation**: Page immediately redirects to Dashboard (`/`) without refresh.
    6. **Check**: Browser URL changes to `/`, Dashboard content loads.

- [ ] **Scenario B: Token Persistence**
    1. After successful login, close the tab.
    2. Open a new tab and navigate to `/`.
    3. **Expectation**: User remains logged in, no redirection to login.

- [ ] **Scenario C: Logout**
    1. Click "Logout" (or Clear User).
    2. **Expectation**: Redirects to `/login`.
    3. **Check**: `localStorage.getItem('token')` is null.

## 2. Regression Testing (Cross-Browser)
- [ ] **Chrome (Latest)**: Verify Login -> Auto-jump.
- [ ] **Firefox (Latest)**: Verify Login -> Auto-jump.
- [ ] **Edge (Latest)**: Verify Login -> Auto-jump.
- [ ] **Mobile WebView (if applicable)**: Verify Login touch interaction.

## 3. Network & Edge Cases
- [ ] **Slow Network**: Throttle network to "Slow 3G" in DevTools.
    - Login should show loading state.
    - Upon success, redirect should happen only after response.
- [ ] **Invalid Token**:
    - Manually set an invalid token in localStorage: `localStorage.setItem('token', 'invalid')`.
    - Refresh page.
    - **Expectation**: API request fails (401), redirects to `/login`.

## 4. Code Quality & Maintenance
- [ ] **Unit Tests**: Run `npm run test` (requires vitest setup) to verify `src/stores/__tests__/auth.spec.ts`.
- [ ] **Linting**: Run `npm run lint` (if available) to ensure no style violations.

## 5. Deployment
- [ ] Build frontend: `npm run build`.
- [ ] Deploy to staging.
- [ ] Verify fix in staging environment.
