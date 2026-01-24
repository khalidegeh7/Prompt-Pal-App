# Quick Start Guide

Get your PromptPal backend with Clerk JWT authentication up and running in 10 minutes.

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Clerk account ([sign up free](https://clerk.com))
- 10 minutes

## Step 1: Clone & Install (2 minutes)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install
```

## Step 2: Get Clerk Credentials (3 minutes)

### 2.1 Create Clerk Application

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Click **"Add application"**
3. Name it "PromptPal Backend"
4. Click **"Create application"**

### 2.2 Get Credentials

In your Clerk application:

1. Navigate to **API Keys** (left sidebar)
2. Copy **Secret Key** (starts with `sk_test_...`)
3. Copy **Publishable Key** (starts with `pk_test_...`)

**Keep these handy - you'll need them next!**

## Step 3: Configure Environment Variables (1 minute)

### 3.1 Create .env.local

```bash
# Copy the example file
cp .env.local .env.local.local
```

### 3.2 Edit .env.local

Open `.env.local` and update:

```env
# Replace with your Clerk secret key from Step 2
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here

# Node environment
NODE_ENV=development

# CORS allowed origins (development)
ALLOWED_ORIGINS=exp://localhost:19000,http://localhost:8081,http://localhost:3000

# Logging level
LOG_LEVEL=debug
```

**That's it!** Other variables are optional for now.

## Step 4: Start Development Server (1 minute)

```bash
npm run dev
```

You should see:

```
▲ Next.js 14.2.0
- Local:        http://localhost:3000
- Network:      http://192.168.1.x:3000
```

**Your backend is now running!** 🎉

## Step 5: Test Authentication (3 minutes)

### 5.1 Get a JWT Token

You need a real Clerk JWT token to test. Options:

**Option A: Use Clerk's JWT Generator**
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **JWT Templates**
3. Create a test token (or use existing user)

**Option B: Use Mobile App**
1. Run your mobile app: `cd ../PromptPal && npm start`
2. Sign in via Clerk
3. The app will generate and store a JWT token
4. Extract token from app logs or debugger

### 5.2 Test Usage Endpoint

```bash
curl -X GET \
  'http://localhost:3000/api/user/usage' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

**Expected Response**:
```json
{
  "tier": "free",
  "used": {
    "textCalls": 15,
    "imageCalls": 3
  },
  "limits": {
    "textCalls": 50,
    "imageCalls": 10
  },
  "periodStart": 1737331200000
}
```

### 5.3 Test AI Proxy Endpoint

```bash
curl -X POST \
  'http://localhost:3000/api/ai/proxy' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "text",
    "model": "gemini-2.5-flash",
    "input": {
      "prompt": "Write a haiku about programming"
    }
  }'
```

**Expected Response**:
```json
{
  "type": "text",
  "model": "gemini-2.5-flash",
  "result": "Code flows like water,\nBugs emerge from digital depths,\nDebug in the light.",
  "tokensUsed": 100,
  "remaining": {
    "textCalls": 35,
    "imageCalls": 7
  },
  "metadata": {
    "latency": 1500,
    "tokensUsed": 100
  }
}
```

## Step 6: Update Mobile App (1 minute)

Update your mobile app's `.env` file:

```env
# Clerk publishable key (from Step 2)
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Backend URL
EXPO_PUBLIC_AI_PROXY_URL=http://localhost:3000
```

Now restart your mobile app:

```bash
cd ../PromptPal
npm start
```

**Your mobile app should now authenticate with the backend!** 🚀

## Verification Checklist

✅ Backend server running at `http://localhost:3000`
✅ Environment variables configured in `.env.local`
✅ Clerk secret key is valid
✅ Usage endpoint returns data with JWT token
✅ AI proxy endpoint returns mock AI response
✅ Mobile app can make authenticated requests
✅ No 401/403 errors

## Next Steps

### For Development

1. **Implement real AI integration**:
   - Add Gemini API key to `.env.local`
   - Update `src/lib/aiProxy.ts` to call real AI services

2. **Add database**:
   - Set up PostgreSQL database
   - Add `DATABASE_URL` to `.env.local`
   - Implement user data persistence

3. **Enable Redis for rate limiting**:
   - Set up Redis instance
   - Add `REDIS_URL` to `.env.local`
   - Update rate limiting logic

### For Production

1. **Deploy to Vercel**:
   ```bash
   vercel login
   vercel deploy
   ```

2. **Update production environment**:
   - Switch to production Clerk keys
   - Update `ALLOWED_ORIGINS`
   - Add production database URL

3. **Update mobile app**:
   ```env
   EXPO_PUBLIC_AI_PROXY_URL=https://your-vercel-app.vercel.app
   ```

## Common Issues & Fixes

### Issue: "CLERK_SECRET_KEY not set"

**Fix**: Ensure `.env.local` file exists in backend directory with the variable set.

### Issue: 401 Unauthorized

**Fix**: 
- Verify JWT token is valid and not expired
- Check Authorization header format: `Bearer <token>`
- Ensure Clerk secret key matches the app that generated the token

### Issue: "Module not found: @clerk/backend"

**Fix**: Run `npm install` to install dependencies.

### Issue: Port 3000 already in use

**Fix**: Either stop the process using port 3000 or use a different port:
```bash
PORT=3001 npm run dev
```

### Issue: CORS errors

**Fix**: Ensure your mobile app's URL is in `ALLOWED_ORIGINS` in `.env.local`.

## Debugging

### Enable Verbose Logging

Update `.env.local`:
```env
LOG_LEVEL=debug
```

### Check Server Logs

Look at terminal output for:
- JWT verification logs
- Request/response logs
- Error messages

### Test Without Authentication

Temporarily remove auth to test endpoints:

```typescript
// In route files, comment out withAuth wrapper
// export const GET = async (request: NextRequest) => { ... }
```

**Don't forget to re-enable before production!**

## Resources

- [Backend README](../backend/README.md) - Complete documentation
- [Mobile Integration Guide](MOBILE_INTEGRATION.md) - Connect mobile app
- [Deployment Guide](DEPLOYMENT.md) - Deploy to production
- [Clerk Documentation](https://clerk.com/docs) - Learn more about Clerk

## Need Help?

1. Check the [Backend README](../backend/README.md) for detailed docs
2. Review [Troubleshooting](#common-issues--fixes) section
3. Check Vercel/Clerk documentation
4. Contact development team

## Success! 🎉

Your PromptPal backend with Clerk JWT authentication is now running!

**What's working:**
- ✅ Clerk JWT verification
- ✅ Protected API endpoints
- ✅ Usage tracking
- ✅ AI proxy (mock)
- ✅ Error handling
- ✅ Rate limiting (in-memory)

**Ready to build:**
- 🚀 Real AI integration
- 🚀 Database persistence
- 🚀 Production deployment
- 🚀 Advanced features

Happy coding! 🎨
