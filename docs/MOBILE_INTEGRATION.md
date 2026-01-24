# Mobile App Integration Guide

This guide explains how to integrate your PromptPal mobile app with the new Clerk JWT authentication backend.

## Overview

The mobile app has already been configured to use Clerk authentication. This guide shows how to ensure it's properly connected to your backend.

## Current Mobile App Configuration

### ✅ Already Implemented

1. **Clerk SDK Installed** (`@clerk/clerk-expo` v2.19.18)
2. **Token Cache** (`src/lib/auth.ts`) - Secure storage for JWT tokens
3. **Auth Sync** (`src/lib/auth-sync.tsx`) - Syncs tokens with AI proxy client
4. **AI Proxy Client** (`src/lib/aiProxy.ts`) - HTTP client with JWT injection
5. **Protected Routes** - Sign-in/Sign-up screens with auth guards

## Required Configuration

### 1. Update Environment Variables

Update your mobile app's `.env` file:

```env
# Clerk Publishable Key (from Clerk Dashboard)
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# AI Proxy Backend URL
# Development
EXPO_PUBLIC_AI_PROXY_URL=http://localhost:3000

# Production (when ready)
# EXPO_PUBLIC_AI_PROXY_URL=https://ai-proxy-backend-psi.vercel.app
```

### 2. Verify Clerk Configuration

Ensure `src/lib/clerk.tsx` is configured:

```typescript
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from './auth';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  if (!publishableKey) {
    console.warn('Clerk not configured');
    return <>{children}</>;
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      {children}
    </ClerkProvider>
  );
}
```

### 3. Verify AI Proxy Client

Ensure `src/lib/aiProxy.ts` has the JWT interceptor:

```typescript
aiProxy.interceptors.request.use(async (config) => {
  try {
    let token = null;
    if (authTokenProvider) {
      token = await authTokenProvider();
    } else {
      token = await tokenCache.getToken('__clerk_client_jwt');
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Failed to get auth token:', error);
  }


  return config;
});
```

## Testing the Integration

### Test 1: Sign In Flow

1. Start your mobile app
2. Navigate to sign-in screen
3. Sign in with your Clerk account
4. Verify you can access protected routes

**Expected Result**: Successfully signed in and redirected to home screen

### Test 2: JWT Token Injection

1. After signing in, open your app's developer console
2. Make a usage request:
```typescript
import { UsageClient } from '@/lib/usage';

const usage = await UsageClient.getUsage();
console.log('Usage:', usage);
```

**Expected Result**: Successful API call with JWT token in Authorization header

### Test 3: AI Proxy Request

1. Make an AI generation request:
```typescript
import { AIProxyClient } from '@/lib/aiProxy';

const result = await AIProxyClient.generateText('Write a haiku');
console.log('AI Result:', result);
```

**Expected Result**: Successful API call with response from backend

### Test 4: Error Handling

Test authentication errors by:
1. Using an expired token (wait for token to expire)
2. Clearing app data (deleting stored tokens)
3. Attempting to access protected endpoints

**Expected Result**: 
- 401 Unauthorized response
- App redirects to sign-in screen
- User-friendly error message

## API Request Flow

### How Authentication Works

```
1. User signs in via Clerk
   ↓
2. Clerk generates JWT token
   ↓
3. Token stored in SecureStore (tokenCache)
   ↓
4. AuthTokenSync registers token provider
   ↓
5. AI Proxy Client gets token from provider
   ↓
6. Request interceptor adds token to headers
   ↓
7. Backend verifies JWT via Clerk SDK
   ↓
8. Backend processes request and returns response
```

### Request Headers

All API requests include these headers:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### Backend Response

Success response (200 OK):
```json
{
  "tier": "free",
  "used": { "textCalls": 15, "imageCalls": 3 },
  "limits": { "textCalls": 50, "imageCalls": 10 },
  "periodStart": 1737331200000
}
```

Error response (401 Unauthorized):
```json
{
  "error": "Authentication failed",
  "code": "AUTHENTICATION_FAILED",
  "message": "Invalid or expired token. Please sign in again."
}
```

## Common Issues & Solutions

### Issue 1: 401 Unauthorized

**Symptoms**: API requests fail with 401 status

**Possible Causes**:
- Token expired
- Invalid token format
- Clerk secret key mismatch

**Solutions**:
```typescript
// 1. Clear token cache and re-authenticate
await SecureStore.deleteItemAsync('__clerk_client_jwt');

// 2. Sign out and sign in again
import { useAuth } from '@clerk/clerk-expo';
const { signOut } = useAuth();
await signOut();

// 3. Check token is being sent
console.log('Token:', await getToken());
```

### Issue 2: Network Errors

**Symptoms**: ECONNREFUSED or ENOTFOUND errors

**Possible Causes**:
- Backend not running
- Wrong API URL
- CORS issues

**Solutions**:
```env
# Check your EXPO_PUBLIC_AI_PROXY_URL
# Development: http://localhost:3000
# Production: https://ai-proxy-backend-psi.vercel.app

# Ensure backend is running:
# npm run dev (from backend directory)
```

### Issue 3: Token Not Being Sent

**Symptoms**: Backend receives no Authorization header

**Possible Causes**:
- AuthTokenSync not registered
- Token provider not set
- getToken() failing

**Solutions**:
```typescript
// 1. Verify AuthTokenSync is rendered in _layout.tsx
<AuthTokenSync />

// 2. Check setTokenProvider is called
setTokenProvider(async () => {
  return await getToken();
});

// 3. Add logging
const token = await getToken();
console.log('Token retrieved:', token ? 'Yes' : 'No');
```

### Issue 4: App ID Mismatch

**Symptoms**: 403 Forbidden error

**Possible Causes**:
- Authorization header missing

**Solutions**:
```typescript
// Verify Authorization header is set in aiProxy.ts

// Check backend allows 'prompt-pal'
// See backend/src/lib/auth/index.ts
const ALLOWED_APP_IDS = ['prompt-pal'];
```

## Debugging

### Enable Debug Logging

In `src/lib/aiProxy.ts`, add logging:

```typescript
aiProxy.interceptors.request.use(async (config) => {
  console.log('[API Request]', {
    url: config.url,
    method: config.method,
    hasAuth: !!config.headers.Authorization,
  });
  
  // ... existing code
});

aiProxy.interceptors.response.use(
  (response) => {
    console.log('[API Response]', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('[API Error]', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);
```

### Monitor Network Requests

Use React Native Debugger or Chrome DevTools:

1. Open React Native Debugger
2. Go to Network tab
3. Monitor API requests
4. Check Authorization header is present

## Production Checklist

Before deploying to production:

- [ ] Update `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` to production key
- [ ] Update `EXPO_PUBLIC_AI_PROXY_URL` to production backend
- [ ] Test with production Clerk credentials
- [ ] Verify all API endpoints work
- [ ] Test error handling (network failures, expired tokens)
- [ ] Remove debug logging
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Test on real devices (not just simulator)

## Clerk Dashboard Configuration

### 1. Get Publishable Key

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **API Keys**
4. Copy **Publishable Key** (starts with `pk_test_`)

### 2. Configure Redirect URLs

In Clerk Dashboard → **Develop → Domain & URLs**:

**Development**:
- Add: `exp://localhost:19000`
- Add: `http://localhost:8081`

**Production**:
- Add your app's deep link URL
- Add your app's website URL (if web version exists)

### 3. Get Backend Secret Key

For backend configuration:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **API Keys**
4. Copy **Secret Key** (starts with `sk_test_` for dev, `sk_live_` for prod)

## Next Steps

1. **Start Backend Server**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Update Mobile App .env**:
   ```env
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   EXPO_PUBLIC_AI_PROXY_URL=http://localhost:3000
   ```

3. **Test Integration**:
   ```bash
   # From mobile app directory
   npm start
   # Press 'i' for iOS or 'a' for Android
   ```

4. **Deploy Backend** (when ready):
   ```bash
   cd backend
   vercel deploy
   ```

5. **Update Mobile App**:
   ```env
   EXPO_PUBLIC_AI_PROXY_URL=https://ai-proxy-backend-psi.vercel.app
   ```

## Support

For issues:
- Check backend logs
- Review Clerk Dashboard for authentication events
- Verify environment variables are set correctly
- Check network connectivity

## Resources

- [Clerk Expo Documentation](https://clerk.com/docs/sdk/expo)
- [Clerk Backend Documentation](https://clerk.com/docs/backend)
- [Backend README](../backend/README.md)
