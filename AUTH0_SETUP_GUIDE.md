# Auth0 Setup Guide

## Current Status

✅ Auth0 credentials added to `.env`
✅ Auth0 configuration file created
✅ Auth0 service implementation created
⚠️ Need to install Auth0 SDK
⚠️ Need to update AuthService to use Auth0
⚠️ Need to configure Auth0 Application settings

## Required Configuration

### 1. Environment Variables (✅ Complete)

Your `.env` file now has:
```env
VITE_AUTH0_DOMAIN=YOUR_AUTH0_DOMAIN
VITE_AUTH0_CLIENT_ID=YOUR_AUTH0_CLIENT_ID
VITE_AUTH0_AUDIENCE=https://YOUR_AUTH0_DOMAIN/api/v2/
```

**Important Notes:**
- ✅ All variables use `VITE_` prefix (required for Vite)
- ✅ CLIENT_SECRET is commented out (should NOT be in frontend)
- ✅ Domain, Client ID, and Audience are configured

### 2. Install Auth0 SDK

Run one of these commands:

```bash
# Option 1: Auth0 React SDK (Recommended for React apps)
npm install @auth0/auth0-react

# Option 2: Auth0 SPA SDK (Lower level, more control)
npm install @auth0/auth0-spa-js
```

### 3. Auth0 Application Configuration

In your Auth0 Dashboard (https://manage.auth0.com/):

#### Application Settings:
1. Go to Applications → Your Application
2. Configure these settings:

**Allowed Callback URLs:**
```
http://localhost:5173,
http://localhost:5173/callback,
https://your-production-domain.com,
https://your-production-domain.com/callback
```

**Allowed Logout URLs:**
```
http://localhost:5173,
https://your-production-domain.com
```

**Allowed Web Origins:**
```
http://localhost:5173,
https://your-production-domain.com
```

**Allowed Origins (CORS):**
```
http://localhost:5173,
https://your-production-domain.com
```

#### Application Type:
- Select: **Single Page Application**

#### Grant Types:
Enable these:
- ✅ Authorization Code
- ✅ Refresh Token
- ✅ Implicit (for development only)

### 4. Auth0 API Configuration

If you're using an API:

1. Go to Applications → APIs
2. Create or select your API
3. Set the Identifier (this is your AUDIENCE)
4. Enable these settings:
   - ✅ Allow Offline Access (for refresh tokens)
   - ✅ Enable RBAC
   - ✅ Add Permissions in Access Token

### 5. Database Connection

1. Go to Authentication → Database
2. Ensure "Username-Password-Authentication" is enabled
3. Configure Password Policy:
   - Minimum length: 8 characters
   - Require: Lowercase, Uppercase, Numbers, Special characters
4. Enable "Disable Sign Ups" if you want invite-only

### 6. Email Templates (Optional)

Configure email templates for:
- Verification Email
- Welcome Email
- Password Reset

Go to: Branding → Email Templates

## Implementation Options

### Option A: Use Auth0 React SDK (Recommended)

**Pros:**
- Built-in React hooks
- Automatic token management
- Easier to implement
- Better React integration

**Implementation:**
```tsx
// Wrap your app with Auth0Provider
import { Auth0Provider } from '@auth0/auth0-react';

<Auth0Provider
  domain={auth0Config.domain}
  clientId={auth0Config.clientId}
  authorizationParams={{
    redirect_uri: window.location.origin,
    audience: auth0Config.audience,
  }}
>
  <App />
</Auth0Provider>
```

### Option B: Use Auth0 SPA SDK (Current Implementation)

**Pros:**
- More control
- Smaller bundle size
- Framework agnostic

**Implementation:**
- Already created in `src/services/Auth0Service.ts`
- Replace imports in `AuthService.ts`

## Migration Steps

### Step 1: Install SDK
```bash
npm install @auth0/auth0-spa-js
```

### Step 2: Update AuthService
Replace the import in `src/services/AuthService.ts`:

```typescript
// OLD (Cognito)
import { signUp as amplifySignUp, ... } from 'aws-amplify/auth';

// NEW (Auth0)
import { auth0Service } from './Auth0Service';
```

### Step 3: Update method implementations
Delegate to auth0Service:

```typescript
async signUp(params: SignUpParams) {
  return auth0Service.signUp(params);
}

async signIn(params: SignInParams) {
  return auth0Service.signIn(params);
}
// ... etc
```

### Step 4: Update Login Flow

**Option 1: Universal Login (Recommended)**
```typescript
// Redirect to Auth0 hosted login page
await auth0Service.signInWithRedirect(email);

// Handle callback
await auth0Service.handleRedirectCallback();
```

**Option 2: Embedded Login (Current)**
```typescript
// Use popup or embedded form
await auth0Service.signIn({ email, password });
```

## Testing Configuration

### Test Auth0 Connection:

1. Start your dev server:
```bash
npm run dev
```

2. Try to sign up/login
3. Check browser console for errors
4. Verify redirect URLs match your Auth0 config

### Common Issues:

**Issue: "Invalid redirect_uri"**
- Solution: Add your URL to Allowed Callback URLs in Auth0

**Issue: "Access denied"**
- Solution: Check Application Type is "Single Page Application"

**Issue: "CORS error"**
- Solution: Add your URL to Allowed Origins in Auth0

**Issue: "Invalid audience"**
- Solution: Verify VITE_AUTH0_AUDIENCE matches your API identifier

## Security Best Practices

✅ **Do:**
- Use Universal Login (redirect) for production
- Store tokens in memory (not localStorage)
- Use HTTPS in production
- Enable refresh tokens
- Set appropriate token expiration

❌ **Don't:**
- Expose CLIENT_SECRET in frontend code
- Use Resource Owner Password Grant in production
- Store tokens in localStorage (XSS risk)
- Disable HTTPS in production

## Next Steps

1. ✅ Install Auth0 SDK: `npm install @auth0/auth0-spa-js`
2. ⚠️ Update AuthService to use Auth0Service
3. ⚠️ Configure Auth0 Application settings in dashboard
4. ⚠️ Test login/signup flow
5. ⚠️ Update tests to mock Auth0 instead of Cognito
6. ⚠️ Consider using Universal Login for better security

## Additional Resources

- [Auth0 React Quickstart](https://auth0.com/docs/quickstart/spa/react)
- [Auth0 SPA SDK Documentation](https://auth0.com/docs/libraries/auth0-spa-js)
- [Auth0 Best Practices](https://auth0.com/docs/best-practices)
- [Auth0 Dashboard](https://manage.auth0.com/)

## Support

If you encounter issues:
1. Check Auth0 Dashboard → Monitoring → Logs
2. Check browser console for errors
3. Verify all URLs match between app and Auth0 config
4. Ensure Application Type is "Single Page Application"
