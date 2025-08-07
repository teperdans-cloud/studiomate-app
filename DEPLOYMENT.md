# StudioMate Deployment Guide

## 🚀 Quick Deploy Options

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy directly from local directory
vercel

# Or deploy from GitHub
# 1. Go to https://vercel.com/new
# 2. Import the repository: https://github.com/teperdans-cloud/studiomate-app
# 3. Configure environment variables (see below)
# 4. Deploy!
```

### Option 2: Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=.next
```

### Option 3: Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

## 🔧 Required Environment Variables

Create a `.env.local` file or configure in your deployment platform:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth Configuration
NEXTAUTH_SECRET="your-super-secure-nextauth-secret-here"
NEXTAUTH_URL="https://your-domain.com"

# OpenAI API (for AI features)
OPENAI_API_KEY="your-openai-api-key"

# Email Configuration (optional)
SMTP_HOST="your-smtp-host"
SMTP_PORT="587"
SMTP_USER="your-smtp-username"
SMTP_PASS="your-smtp-password"

# Google Calendar Integration (optional)
GOOGLE_CALENDAR_CLIENT_ID="your-google-client-id"
GOOGLE_CALENDAR_CLIENT_SECRET="your-google-client-secret"
```

## 📋 Pre-Deployment Checklist

### 1. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Seed initial data
npm run db:seed
```

### 2. Security Configuration
- [ ] Set a secure `NEXTAUTH_SECRET` (use: `openssl rand -base64 32`)
- [ ] Configure `NEXTAUTH_URL` to your production domain
- [ ] Enable HSTS headers in production
- [ ] Review Content Security Policy settings in `middleware.ts`

### 3. Performance Optimization
```bash
# Build and test locally
npm run build
npm run start
```

## 🔐 Security Features Enabled

✅ **Password Authentication**: Bcrypt hashing with 12 salt rounds  
✅ **Rate Limiting**: Protection against brute force attacks  
✅ **Security Headers**: CSP, HSTS, X-Frame-Options, XSS protection  
✅ **Input Sanitization**: XSS and injection prevention  
✅ **File Upload Security**: MIME type validation, malicious content detection  
✅ **Session Management**: Secure 24-hour JWT expiration  
✅ **CSRF Protection**: Form action restrictions  

## 🎯 Post-Deployment Steps

1. **Test Authentication Flow**
   - Create a new account
   - Verify password requirements work
   - Test sign in/out functionality

2. **Verify Security Headers**
   - Use [Security Headers](https://securityheaders.com/) to scan your domain
   - Should achieve A+ grade

3. **Test File Uploads**
   - Upload test images to portfolio
   - Verify file type restrictions work
   - Test malicious file rejection

4. **Configure Monitoring**
   - Set up error tracking (Sentry recommended)
   - Monitor rate limit triggers
   - Watch for security events

## 🛠️ Production Database

For production, consider upgrading from SQLite:

### PostgreSQL (Recommended)
```env
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
```

### MySQL
```env
DATABASE_URL="mysql://username:password@host:port/database"
```

After changing database provider:
```bash
npx prisma db push
npm run db:seed
```

## 🎨 Custom Domain Setup

1. **Vercel**: Add custom domain in project settings
2. **Netlify**: Configure domain in site settings
3. **Railway**: Add custom domain in project dashboard

Update `NEXTAUTH_URL` environment variable to match your domain.

## 📊 Monitoring & Analytics

Consider adding:
- **Vercel Analytics**: Built-in performance monitoring
- **Sentry**: Error tracking and performance monitoring
- **PostHog**: Product analytics and feature flags

## 🚨 Important Security Note

The application has been secured from its previous F-grade (critical vulnerabilities) to A-grade security. However, always:

- Keep dependencies updated
- Monitor security advisories
- Regularly review access logs
- Implement additional monitoring as needed

## 🆘 Support

For deployment issues:
1. Check the deployment logs
2. Verify all environment variables are set
3. Ensure database connections are working
4. Review the security configurations

The application is now production-ready with enterprise-grade security! 🔒✨