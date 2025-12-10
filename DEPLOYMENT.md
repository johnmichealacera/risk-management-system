# Deployment Guide for Vercel

This guide explains how to set up the database when deploying to Vercel.

## Prerequisites

Before deploying, ensure you have:

1. **PostgreSQL Database**: Set up a PostgreSQL database (e.g., Neon, Supabase, Railway, or any PostgreSQL provider)
2. **Environment Variables**: Configure these in Vercel project settings:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL`: Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
   - `SETUP_SECRET` (optional): Secret token for database setup endpoint

## Deployment Steps

### Option 1: Automatic Setup (Recommended)

After your first deployment:

1. **Run Database Setup**: Call the setup endpoint with your secret token:
   ```bash
   curl -X POST "https://your-app.vercel.app/api/setup?token=YOUR_SETUP_SECRET"
   ```

   Or visit in browser:
   ```
   https://your-app.vercel.app/api/setup?token=YOUR_SETUP_SECRET
   ```

   This will:
   - ✅ Run database migrations
   - ✅ Seed initial data (barangays, users, relief goods, etc.)

2. **Verify Setup**: Check the status:
   ```bash
   curl https://your-app.vercel.app/api/setup
   ```

### Option 2: Manual Setup via Vercel CLI

If you have Vercel CLI installed:

```bash
# Set environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add SETUP_SECRET

# Deploy
vercel --prod

# Run migrations and seed
vercel env pull .env.local
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

### Option 3: Local Migration Then Deploy

1. **Create Migration Locally**:
   ```bash
   npx prisma migrate dev --name init
   ```

2. **Deploy to Vercel**:
   ```bash
   git push origin main
   ```

3. **Run Migrations on Production**:
   - Use the setup API endpoint (Option 1), or
   - Connect to your production database and run:
     ```bash
     DATABASE_URL="your-production-url" npx prisma migrate deploy
     DATABASE_URL="your-production-url" npx tsx prisma/seed.ts
     ```

## Database Setup Endpoint

The `/api/setup` endpoint provides:

- **POST**: Runs migrations and seeds database (requires `?token=SETUP_SECRET`)
- **GET**: Returns database status (no authentication needed)

### Security Note

⚠️ **Important**: The setup endpoint should be protected. Set `SETUP_SECRET` in your Vercel environment variables and use it when calling the endpoint. After initial setup, you can disable or further secure this endpoint.

## Default Login Credentials

After seeding, you can login with:

- **Admin**: `admin@socorro.gov.ph` / `password123`
- **MDRRMC Officer**: `mdrrmc@socorro.gov.ph` / `password123`
- **Barangay Staff 1**: `staff1@barangay.ph` / `password123`
- **Barangay Staff 2**: `staff2@barangay.ph` / `password123`

⚠️ **Change these passwords immediately after first login in production!**

## Troubleshooting

### Migration Fails

If migrations fail, check:
1. `DATABASE_URL` is correctly set in Vercel
2. Database is accessible from Vercel's IP ranges
3. Database user has proper permissions

### Seed Fails

The seed script uses `upsert`, so it's safe to run multiple times. If it fails:
1. Check database connection
2. Verify all required fields are present
3. Check seed script logs in Vercel build logs

### Build Fails

If build fails:
1. Ensure `DATABASE_URL` is set (even if migrations run separately)
2. Check Prisma Client generation in build logs
3. Verify Node.js version (should be 20+)

## Production Checklist

- [ ] Set all required environment variables in Vercel
- [ ] Run database migrations
- [ ] Seed initial data
- [ ] Change default passwords
- [ ] Test login with different user roles
- [ ] Verify all features work correctly
- [ ] Set up database backups
- [ ] Monitor application logs

