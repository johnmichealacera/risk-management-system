# Quick Deployment Checklist

## ✅ What's Ready

- ✅ Migration files created (`prisma/migrations/`)
- ✅ Seed script ready (`prisma/seed.ts`)
- ✅ Setup API endpoint created (`/api/setup`)
- ✅ All scripts configured in `package.json`

## 🚀 Deployment Steps

### 1. Commit Everything
```bash
git add .
git commit -m "feat: Add database migrations and deployment setup"
git push origin main
```

### 2. Generate SETUP_SECRET

Generate a secure random token using one of these methods:

**Option A: Using OpenSSL (Linux/Mac/WSL)**
```bash
openssl rand -base64 32
```

**Option B: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Option C: Using Online Generator**
Visit: https://generate-secret.vercel.app/32 (or any secure random string generator)

**Example output:**
```
kX9mP2qR7vN4wL8tY3zA6bC1dE5fG0hI2jK4lM6nO8pQ
```

**Save this value** - you'll need it in the next step!

### 3. Set Environment Variables in Vercel

Go to your Vercel project → Settings → Environment Variables and add:

- `DATABASE_URL` - Your PostgreSQL connection string
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your Vercel URL (e.g., `https://your-app.vercel.app`)
- `SETUP_SECRET` - Paste the token you generated above

### 4. Deploy

Vercel will automatically deploy when you push to main branch.

### 5. Run Database Setup (ONE TIME)

After deployment completes, call the setup endpoint:

**Option A: Using curl**
```bash
curl -X POST "https://your-app.vercel.app/api/setup?token=YOUR_SETUP_SECRET"
```

**Option B: Using browser**
Visit:
```
https://your-app.vercel.app/api/setup?token=YOUR_SETUP_SECRET
```

This will:
- ✅ Run all database migrations
- ✅ Seed initial data (barangays, users, relief goods, etc.)

### 6. Verify Setup

Check if everything worked:
```bash
curl https://your-app.vercel.app/api/setup
```

You should see:
```json
{
  "status": "ok",
  "database": {
    "users": 4,
    "barangays": 2,
    "isSeeded": true
  }
}
```

### 7. Login

Use the default credentials:
- Admin: `admin@socorro.gov.ph` / `password123`
- MDRRMC: `mdrrmc@socorro.gov.ph` / `password123`
- Barangay Staff: `staff1@barangay.ph` / `password123`

⚠️ **Change passwords immediately after first login!**

## 📝 Important Notes

- **Migrations run ONCE**: After calling `/api/setup`, migrations are applied. Future deployments won't need to run migrations again (unless you add new ones).
- **Seed is safe**: The seed script uses `upsert`, so it's safe to run multiple times - it won't create duplicates.
- **Setup endpoint**: You only need to call `/api/setup` once after the first deployment. Future deployments will just build and deploy.

## 🔄 Future Deployments

For future deployments with new migrations:

1. Create migration locally: `npm run db:migrate`
2. Commit and push
3. Deploy (Vercel auto-deploys)
4. Call `/api/setup` again to apply new migrations

Or manually run:
```bash
DATABASE_URL="your-prod-url" npm run db:migrate:deploy
```

