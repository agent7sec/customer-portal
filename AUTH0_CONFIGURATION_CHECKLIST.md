# Auth0 Configuration Checklist

## ✅ Completed

1. **Environment Variables**
   - ✅ Added VITE_AUTH0_DOMAIN
   - ✅ Added VITE_AUTH0_CLIENT_ID
   - ✅ Added VITE_AUTH0_AUDIENCE
   - ✅ Removed CLIENT_SECRET from frontend (security)

2. **Configuration Files**
   - ✅ Created `src/config/auth0.ts`
   - ✅ Created `src/services/Auth0Service.ts`
   - ✅ Created setup documentation

## ⚠️ Missing Configuration

### 1. Install Auth0 SDK (REQUIRED)

Run this command:
```bash
npm install @auth0/auth0-spa-js
```

### 2. Auth0 Dashboard Configuration (REQUIRED)

Go to https://manage.auth0.com/ and configure:

#### Application Settings:
- **Application Type:** Single Page Application
- **Allowed Callback URLs:** 
  ```
  http://localhost:5173
  http://localhost:5173/callback
  ```
- **Allowed Logout URLs:**
  ```
  http://localhost:5173
  ```
- **Allowed Web Origins:**
  ```
  http://localhost:5173
  ```
- **Allowed Origins (CORS):**
  ```
  http://localhost:5173
  ```

#### Grant Types (Enable these):
- ✅ Authorization Code
- ✅ Refresh Token
- ✅ Implicit (dev only)

### 3. Database Connection (REQUIRED)

In Auth0 Dashboard:
1. Go to Authentication → Database
2. Enable "Username-Password-Authentication"
3. Configure Password Policy:
   - Min length: 8
   - Require: lowercase, uppercase, numbers, special chars

### 4. Update AuthService (REQUIRED)

Replace Cognito with Auth0 in `src/services/AuthService.ts`:

```typescript
// Change this:
import { signUp as amplifySignUp, ... } from 'aws-amplify/auth';

// To this:
import { auth0Service } from './Auth0Service';

// Then delegate all methods to auth0Service
async signUp(params: SignUpParams) {
  return auth0Service.signUp(params);
}
```

## 🔧 Optional Enhancements

### 1. Use Auth0 React SDK (Recommended)

Instead of the SPA SDK, use the React SDK for better integration:

```bash
npm install @auth0/auth0-react
```

Then wrap your app:
```tsx
import { Auth0Provider } from '@auth0/auth0-react';

<Auth0Provider
  domain="YOUR_AUTH0_DOMAIN"
  clientId="YOUR_AUTH0_CLIENT_ID"
  authorizationParams={{
    redirect_uri: window.location.origin,
    audience: "https://YOUR_AUTH0_DOMAIN/api/v2/"
  }}
>
  <App />
</Auth0Provider>
```

### 2. Use Universal Login (Recommended)

Instead of embedded login, redirect to Auth0's hosted page:

```typescript
// In LoginForm, instead of form submission:
await auth0Service.signInWithRedirect(email);

// Then handle callback in App.tsx:
await auth0Service.handleRedirectCallback();
```

### 3. Configure Email Templates

In Auth0 Dashboard → Branding → Email Templates:
- Verification Email
- Welcome Email  
- Password Reset Email

### 4. Enable Social Logins (Optional)

In Auth0 Dashboard → Authentication → Social:
- Google
- GitHub
- Microsoft
- etc.

## 🧪 Testing Checklist

After configuration:

- [ ] Install Auth0 SDK
- [ ] Update AuthService to use Auth0
- [ ] Configure Auth0 Dashboard settings
- [ ] Test signup flow
- [ ] Test login flow
- [ ] Test logout flow
- [ ] Test email verification
- [ ] Check browser console for errors
- [ ] Verify tokens are stored securely
- [ ] Test token refresh
- [ ] Update unit tests to mock Auth0

## 🚨 Common Issues & Solutions

### Issue: "Invalid redirect_uri"
**Solution:** Add your URL to "Allowed Callback URLs" in Auth0 Dashboard

### Issue: "CORS error"
**Solution:** Add your URL to "Allowed Origins (CORS)" in Auth0 Dashboard

### Issue: "Access denied"
**Solution:** Verify Application Type is "Single Page Application"

### Issue: "Invalid audience"
**Solution:** Check VITE_AUTH0_AUDIENCE matches your API identifier

### Issue: "Cannot find module '@auth0/auth0-spa-js'"
**Solution:** Run `npm install @auth0/auth0-spa-js`

## 📝 Quick Start Commands

```bash
# 1. Install Auth0 SDK
npm install @auth0/auth0-spa-js

# 2. Start dev server
npm run dev

# 3. Test the application
# Navigate to http://localhost:5173
# Try to sign up / log in
# Check browser console for any errors
```

## 🔐 Security Notes

- ✅ CLIENT_SECRET is NOT in frontend code (correct)
- ✅ Using VITE_ prefix for environment variables
- ✅ Tokens stored in memory (not localStorage)
- ⚠️ Consider using Universal Login for production
- ⚠️ Enable HTTPS in production
- ⚠️ Set appropriate CORS policies

## 📚 Documentation

- Setup Guide: `AUTH0_SETUP_GUIDE.md`
- Auth0 Service: `src/services/Auth0Service.ts`
- Auth0 Config: `src/config/auth0.ts`
- Auth0 Docs: https://auth0.com/docs

## Next Action Required

**IMMEDIATE:** Run this command to install Auth0 SDK:
```bash
npm install @auth0/auth0-spa-js
```

Then configure your Auth0 Application settings in the dashboard!
