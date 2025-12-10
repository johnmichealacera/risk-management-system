# Troubleshooting Setup Endpoint

## Common Issues

### "Unauthorized. Token does not match"

This means the token in your URL doesn't match the `SETUP_SECRET` environment variable in Vercel.

**Solution:**

1. **Check Vercel Environment Variables:**
   - Go to your Vercel project → Settings → Environment Variables
   - Find `SETUP_SECRET`
   - Copy the exact value (be careful with spaces!)

2. **Verify the Token in Your URL:**
   - Your token: `5EAA+98WqRW8yULc1gW6i+tAWsyHj8rwoTVC8rpwkDA=`
   - Make sure it matches exactly in Vercel

3. **Common Issues:**
   - ✅ **Extra spaces**: Make sure there are no spaces before/after the token
   - ✅ **URL encoding**: The `+` and `=` characters should work, but if not, try URL-encoding:
     - `+` becomes `%2B`
     - `=` becomes `%3D`
   - ✅ **Copy-paste errors**: Copy the token directly from Vercel to avoid typos

4. **Test the Token:**
   ```bash
   # In Postman or curl, use the token directly:
   POST https://risk-management-system-sigma.vercel.app/api/setup?token=5EAA+98WqRW8yULc1gW6i+tAWsyHj8rwoTVC8rpwkDA=
   
   # Or if that doesn't work, try URL-encoded:
   POST https://risk-management-system-sigma.vercel.app/api/setup?token=5EAA%2B98WqRW8yULc1gW6i%2BtAWsyHj8rwoTVC8rpwkDA%3D
   ```

### Alternative: Use Request Body Instead

If URL parameters are causing issues, you can also send the token in the request body:

```json
POST https://risk-management-system-sigma.vercel.app/api/setup
Content-Type: application/json

{
  "token": "5EAA+98WqRW8yULc1gW6i+tAWsyHj8rwoTVC8rpwkDA="
}
```

But first, we need to update the endpoint to accept body tokens. For now, stick with URL parameters.

### Quick Fix: Regenerate SETUP_SECRET

If you're having persistent issues, regenerate the secret:

1. Generate a new token:
   ```bash
   openssl rand -base64 32
   ```

2. Update in Vercel:
   - Go to Environment Variables
   - Edit `SETUP_SECRET`
   - Paste the new value
   - Save

3. Use the new token in your URL

### Verify Environment Variable is Set

You can check if the environment variable is accessible by temporarily adding a test endpoint, or check Vercel's deployment logs to see if the variable is being read.

