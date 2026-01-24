# Backend Deployment Guide

Complete guide for deploying the PromptPal backend to Vercel.

## Prerequisites

- Vercel account (free tier works)
- GitHub account with repository access
- Clerk account with application created
- Production Clerk secret key

## Deployment Steps

### Step 1: Prepare Repository

Ensure your backend code is in a Git repository:

```bash
cd backend
git init
git add .
git commit -m "Initial commit: Clerk JWT authentication backend"
```

Push to GitHub:
```bash
# Create repository on GitHub first, then:
git remote add origin https://github.com/your-username/your-repo.git
git branch -M main
git push -u origin main
```

### Step 2: Connect to Vercel

1. **Sign in to [Vercel](https://vercel.com)**
2. **Click "Add New" → "Project"**
3. **Import your Git repository**
4. **Configure project settings** (see below)

### Step 3: Configure Build Settings

Vercel will auto-detect Next.js. Verify:

**Framework Preset**: Next.js

**Build Command**:
```bash
npm run build
```

**Output Directory**: `.next`

**Install Command**:
```bash
npm install
```

**Node Version**: `18.x` or later

### Step 4: Set Environment Variables

In Vercel Project Settings → **Environment Variables**:

Add these variables:

| Name | Value | Environment |
|------|-------|-------------|
| `CLERK_SECRET_KEY` | `sk_live_your_clerk_secret_key` | Production |
| `NODE_ENV` | `production` | Production |
| `ALLOWED_ORIGINS` | `exp://*,https://promptpal.com` | Production |
| `LOG_LEVEL` | `warn` | Production |
| `DATABASE_URL` | Your PostgreSQL URL | Production |
| `REDIS_URL` | Your Redis URL | Production |
| `GEMINI_API_KEY` | Your Gemini API key | Production |

**Important**: Don't forget to check "Production" checkbox for each variable.

### Step 5: Deploy

Click **"Deploy"**. Vercel will:

1. Clone your repository
2. Install dependencies
3. Build the application
4. Deploy to edge network

Deployment typically takes 2-3 minutes.

### Step 6: Verify Deployment

After deployment:

1. **Get your production URL**: `https://your-project-name.vercel.app`
2. **Test health check**: `https://your-project-name.vercel.app/api/health`
3. **Test authentication**: Use a real Clerk JWT token

### Step 7: Update Mobile App

Update your mobile app's `.env` file:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
EXPO_PUBLIC_AI_PROXY_URL=https://your-project-name.vercel.app
```

## Custom Domain (Optional)

### 1. Add Custom Domain

1. Go to Vercel project → **Settings → Domains**
2. Click **"Add"** → Enter domain (e.g., `api.promptpal.com`)
3. Follow DNS instructions

### 2. Configure DNS

Add these records to your DNS provider:

| Type | Name | Value |
|------|------|-------|
| CNAME | api | cname.vercel-dns.com |

### 3. Update CORS

Update `.env.production`:

```env
ALLOWED_ORIGINS=exp://*,https://promptpal.com,https://api.promptpal.com
```

## Environment Variables Reference

### Required Variables

#### CLERK_SECRET_KEY
- **Format**: `sk_live_...` or `sk_test_...`
- **Source**: Clerk Dashboard → API Keys
- **Purpose**: Verify JWT tokens
- **Security**: Secret (never expose)

#### NODE_ENV
- **Values**: `development` or `production`
- **Purpose**: Enable/disable development features
- **Security**: Not secret

#### ALLOWED_ORIGINS
- **Format**: Comma-separated URLs
- **Purpose**: CORS allowed origins
- **Example**: `exp://*,https://promptpal.com,https://www.promptpal.com`

### Optional Variables

#### DATABASE_URL
- **Format**: PostgreSQL connection string
- **Purpose**: Database connection for user data
- **Example**: `postgresql://user:password@host:5432/dbname`
- **Security**: Secret

#### REDIS_URL
- **Format**: Redis connection string
- **Purpose**: Rate limiting and caching
- **Example**: `redis://user:password@host:6379`
- **Security**: Secret

#### GEMINI_API_KEY
- **Format**: API key string
- **Purpose**: AI model access
- **Security**: Secret

#### SENTRY_DSN
- **Format**: Sentry Data Source Name
- **Purpose**: Error tracking
- **Example**: `https://xxxxx@o1234.ingest.sentry.io/123456`
- **Security**: Semi-secret

## Monitoring & Logging

### Vercel Analytics

Vercel provides built-in analytics:

1. Go to **Analytics** tab
2. View metrics:
   - Request count
   - Response time
   - Error rate
   - Geographic distribution

### Logs

View logs in Vercel dashboard:

1. Go to **Logs** tab
2. Filter by:
   - Status code
   - Route
   - Time range
3. Download logs for analysis

### Error Tracking (Sentry)

To enable Sentry:

1. Create Sentry account
2. Create new project (Next.js)
3. Get DSN
4. Add to environment variables:
   ```
   SENTRY_DSN=https://xxxxx@o1234.ingest.sentry.io/123456
   ```
5. Install Sentry SDK:
   ```bash
   npm install @sentry/nextjs
   ```

## Rollback Strategy

If deployment fails or issues arise:

### 1. Immediate Rollback

1. Go to **Deployments** tab
2. Find last successful deployment
3. Click **"..." → "Promote to Production"**

### 2. Git Rollback

```bash
# Revert to previous commit
git revert HEAD

# Or reset to specific commit
git reset --hard <commit-hash>

git push
```

Vercel will auto-deploy the rollback.

### 3. Environment Variable Rollback

1. Go to **Environment Variables** tab
2. Edit variables to previous values
3. **Redeploy** to apply changes

## Performance Optimization

### 1. Enable Edge Functions

Update `next.config.js`:

```javascript
module.exports = {
  // ... existing config
  experimental: {
    serverActions: true,
  },
};
```

### 2. Configure CDN

Vercel automatically uses CDN. Ensure:

- Cache headers set correctly
- Static assets optimized
- Images optimized with Next.js Image component

### 3. Database Connection Pooling

Use connection pooling for PostgreSQL:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname?pgbouncer=true
```

## Security Checklist

Before going production:

- [ ] CLERK_SECRET_KEY is secret (not logged)
- [ ] DATABASE_URL is secret
- [ ] REDIS_URL is secret
- [ ] API keys are in environment variables
- [ ] HTTPS only (Vercel default)
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak sensitive data
- [ ] Logging enabled but sanitized
- [ ] Monitoring configured

## Scaling

### Horizontal Scaling

Vercel auto-scales based on traffic. Adjust limits in project settings:

- **Serverless Function Timeout**: Default 10s
- **Serverless Function Memory**: Default 1GB
- **Concurrent Requests**: Based on plan

### Database Scaling

For high traffic:

1. **Use managed database** (Supabase, Neon, AWS RDS)
2. **Enable connection pooling** (PgBouncer)
3. **Add read replicas** for heavy read workloads
4. **Implement caching** (Redis)

### CDN Caching

Cache API responses for GET endpoints:

```typescript
export const GET = async (request: NextRequest) => {
  const data = await getData();
  
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
    },
  });
};
```

## Troubleshooting

### Deployment Fails

**Issue**: Build fails

**Solutions**:
1. Check build logs in Vercel
2. Verify `package.json` scripts are correct
3. Ensure all dependencies are in `package.json`
4. Check TypeScript errors: `npm run typecheck`

**Issue**: Runtime errors

**Solutions**:
1. Check runtime logs in Vercel
2. Verify environment variables are set
3. Test locally with production env: `vercel env pull .env.production.local`

### 500 Errors

**Issue**: Internal server errors

**Solutions**:
1. Check logs for specific error
2. Verify database connectivity
3. Check API keys are valid
4. Verify Clerk secret key is correct

### 401 Unauthorized

**Issue**: Authentication failures

**Solutions**:
1. Verify CLERK_SECRET_KEY is correct
2. Check JWT token is valid (not expired)
3. Ensure Authorization header format: `Bearer <token>`
4. Verify Clerk app is active

### CORS Errors

**Issue**: Browser blocks requests

**Solutions**:
1. Verify ALLOWED_ORIGINS includes your domain
2. Check `next.config.js` headers configuration
3. Ensure Authorization header is sent

## Cost Estimation

### Vercel Pricing (as of 2026)

- **Free**: 100GB bandwidth, 6 builds/month
- **Pro**: $20/month, 1TB bandwidth, unlimited builds
- **Enterprise**: Custom pricing

### Database Costs

- **Supabase Free**: 500MB, 1GB bandwidth
- **Supabase Pro**: $25/month, 8GB storage
- **Neon**: Serverless, pay-per-use
- **AWS RDS**: $15-$200/month (based on instance)

### Redis Costs

- **Redis Cloud Free**: 30MB
- **Redis Cloud Fixed**: $7/month (256MB)
- **AWS ElastiCache**: $15+/month

## Post-Deployment Tasks

After successful deployment:

1. **Monitor metrics** for first 24 hours
2. **Set up alerts** for:
   - Error rate > 5%
   - Response time > 3s
   - 502/503 errors
3. **Test mobile app** with production backend
4. **Gather feedback** from beta users
5. **Optimize** based on usage patterns
6. **Scale** resources as needed

## Support

For deployment issues:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Support](https://vercel.com/support)
- [Clerk Documentation](https://clerk.com/docs)

## Next Steps

After deployment:

1. [Set up monitoring and alerts](#monitoring--logging)
2. [Configure custom domain](#custom-domain-optional)
3. [Enable error tracking with Sentry](#error-tracking-sentry)
4. [Update mobile app with production URL](#step-7-update-mobile-app)
5. [Test end-to-end flow](#verify-deployment)
6. [Monitor performance](#performance-optimization)
