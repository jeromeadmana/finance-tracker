# Vercel Deployment Guide for Finance Tracker

## Overview
This guide covers deploying the Finance Tracker application to Vercel with proper production configurations.

## Architecture
- **Frontend**: Deploy to Vercel (React/Vite app)
- **Backend**: Deploy separately (Vercel, Railway, Render, or other Node.js hosting)
- **Database**: PostgreSQL (managed service like Neon, Supabase, or Railway)

---

## Part 1: Code Changes Required

### 1. Frontend Environment Variables

**Current**: Uses `VITE_API_URL` pointing to `http://localhost:5000`

**Change needed**: Update to production API URL

**File**: `frontend/.env.production` (create this file)
```env
VITE_API_URL=https://your-backend-domain.vercel.app
```

**No code changes needed** - Vite automatically uses `.env.production` when building for production.

---

### 2. Backend CORS Configuration

**File**: `backend/src/server.js`

**Current code** (lines 15-30):
```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

**Production change**:
```javascript
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      process.env.FRONTEND_URL,  // Your Vercel frontend URL
      'https://your-app.vercel.app'
    ]
  : [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000'
    ];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

---

### 3. Database Connection

**Current**: Uses local PostgreSQL
**Production**: Use managed PostgreSQL service

**File**: `backend/src/config/database.js`

**Current code**:
```javascript
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'finance_tracker',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'root'
});
```

**Production change** (add connection string support):
```javascript
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false
        }
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'finance_tracker',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'root'
      }
);
```

---

### 4. Port Configuration

**File**: `backend/src/server.js`

**Current**:
```javascript
const PORT = process.env.PORT || 5000;
```

**No change needed** - This is already production-ready. Vercel will provide PORT.

---

## Part 2: Vercel Configuration Files

### 1. Frontend - `vercel.json`

**Create**: `frontend/vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 2. Backend - `vercel.json`

**Create**: `backend/vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.js"
    }
  ]
}
```

---

## Part 3: Environment Variables Setup

### Frontend Environment Variables (Vercel Dashboard)
```
VITE_API_URL=https://your-backend.vercel.app
```

### Backend Environment Variables (Vercel Dashboard)
```
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-frontend.vercel.app

# Database (use connection string from your provider)
DATABASE_URL=postgresql://user:password@host:5432/database?ssl=true

# JWT
JWT_SECRET=your-super-secure-secret-key-change-this

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4o
```

---

## Part 4: Database Setup (Production)

### Option 1: Neon (Recommended - Free tier available)
1. Sign up at https://neon.tech
2. Create a new project
3. Get connection string: `postgresql://user:password@host/database?sslmode=require`
4. Run migrations:
   ```bash
   psql "your-connection-string" -f backend/src/config/schema.sql
   node backend/src/config/init-demo-users.js
   ```

### Option 2: Supabase
1. Sign up at https://supabase.com
2. Create new project
3. Get connection string from Settings > Database
4. Run migrations (same as above)

### Option 3: Railway
1. Sign up at https://railway.app
2. Create PostgreSQL database
3. Get connection string
4. Run migrations (same as above)

---

## Part 5: Deployment Steps

### Step 1: Prepare Code
```bash
# 1. Update CORS configuration in backend/src/server.js
# 2. Update database connection in backend/src/config/database.js
# 3. Create vercel.json files for frontend and backend
# 4. Create .env.production for frontend
```

### Step 2: Deploy Backend
```bash
cd backend
vercel --prod
# Note the deployment URL
```

### Step 3: Deploy Frontend
```bash
cd frontend
# Add VITE_API_URL to Vercel environment variables first
vercel --prod
```

### Step 4: Update Environment Variables
1. Go to Vercel Dashboard > Your Project > Settings > Environment Variables
2. Add all environment variables listed in Part 3
3. Redeploy to apply changes

---

## Part 6: Post-Deployment Tasks

### 1. Initialize Database
Run these commands with your production database:
```bash
# Connect to your database
psql "your-production-database-url"

# Or run initialization script
node backend/src/config/run-schema.js
node backend/src/config/init-demo-users.js
```

### 2. Test the Application
1. Visit your Vercel frontend URL
2. Try logging in with demo credentials:
   - Email: `demo@financetracker.com`
   - Password: `demo123`
3. Test AI features, transactions, budgets

### 3. Monitor Logs
```bash
vercel logs [deployment-url]
```

---

## Part 7: Important Security Changes

### 1. Remove Demo Credentials (Optional)
For production, you may want to disable demo users or require signup.

**File**: `backend/src/config/init-demo-users.js`
Comment out or remove demo user initialization.

### 2. Strengthen JWT Secret
Use a strong, random secret for production:
```bash
openssl rand -base64 32
```
Add to Vercel environment variables.

### 3. Rate Limiting (Recommended)
Add rate limiting to protect your API:

```bash
npm install express-rate-limit
```

**File**: `backend/src/server.js`
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## Part 8: Files to Update Summary

### Files that MUST be changed:
1. ✅ `backend/src/server.js` - CORS configuration
2. ✅ `backend/src/config/database.js` - Add DATABASE_URL support
3. ✅ Create `frontend/vercel.json`
4. ✅ Create `backend/vercel.json`
5. ✅ Create `frontend/.env.production`

### Files that should be reviewed:
- `backend/src/middleware/demo.middleware.js` - Consider if you want demo limits in production
- `backend/src/config/init-demo-users.js` - Decide if you want demo users in production

### No changes needed:
- All React components
- All route files
- Controller files
- OpenAI service
- Authentication logic

---

## Part 9: Alternative: Single Deployment (Not Recommended)

You could deploy both frontend and backend together, but it's not recommended because:
- Vercel serverless functions have timeout limits
- Separate deployments allow independent scaling
- Better for debugging and monitoring

---

## Part 10: Cost Estimates

### Free Tier (Development/Portfolio)
- **Vercel Frontend**: Free
- **Vercel Backend**: Free (with limits)
- **Neon Database**: Free (500MB storage)
- **OpenAI API**: Pay per use (~$0.01-0.10 per recommendation)

**Total**: ~$0-5/month depending on usage

### Paid Tier (Production)
- **Vercel Pro**: $20/month
- **Database (Neon/Supabase)**: $10-25/month
- **OpenAI API**: Variable based on usage

**Total**: ~$30-50/month

---

## Troubleshooting

### CORS Errors
- Verify FRONTEND_URL in backend environment variables
- Check Vercel deployment logs
- Ensure credentials: true in CORS config

### Database Connection Issues
- Verify DATABASE_URL format includes `?ssl=true` or `?sslmode=require`
- Check database firewall allows connections from Vercel IPs
- Test connection locally first

### Environment Variables Not Working
- Redeploy after adding environment variables
- Check variable names match exactly (case-sensitive)
- Use Vercel CLI: `vercel env pull` to verify

### Build Failures
- Check Node.js version matches local (add `.nvmrc` or `engines` in package.json)
- Verify all dependencies are in `package.json`, not just devDependencies
- Check build logs in Vercel dashboard

---

## Quick Checklist

- [ ] Update CORS in `backend/src/server.js`
- [ ] Add DATABASE_URL support in `backend/src/config/database.js`
- [ ] Create `frontend/vercel.json`
- [ ] Create `backend/vercel.json`
- [ ] Create `frontend/.env.production`
- [ ] Set up production database (Neon/Supabase/Railway)
- [ ] Run database migrations on production DB
- [ ] Deploy backend to Vercel
- [ ] Add environment variables to Vercel
- [ ] Deploy frontend to Vercel
- [ ] Test login and all features
- [ ] Monitor logs for errors

---

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Test database connection separately
4. Check browser console for frontend errors
5. Review backend logs for API errors
