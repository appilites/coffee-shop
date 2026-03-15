# 🔐 Environment Variables Setup

## ✅ Quick Setup (Automatic)

Run this PowerShell script to automatically create `.env.local`:

```powershell
.\setup-env.ps1
```

## 📝 Manual Setup

Create `.env.local` file in the root directory with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xnmnklgmmeqpajxwrkir.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhubW5rbGdtbWVxcGFqeHdya2lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MzQ0MzgsImV4cCI6MjA4ODMxMDQzOH0.kQAaa27pr99vO8Ez1ffQJMrdFmiYD2uc00odwOmA9eM

# Service Role Key (for admin operations - keep secret!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhubW5rbGdtbWVxcGFqeHdya2lyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjczNDQzOCwiZXhwIjoyMDg4MzEwNDM4fQ.swodebMA9Oz_YhxPyYiFsYv7QhTC94QXQScZYhkJ898
```

## 🔑 What Each Key Does

### `NEXT_PUBLIC_SUPABASE_URL`
- Your Supabase project URL
- Used by both shop and admin dashboard
- Safe to expose (public)

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Anonymous/public key
- Used by shop website to read products
- Safe to expose (public)
- Subject to RLS policies

### `SUPABASE_SERVICE_ROLE_KEY`
- Service role key (admin key)
- **KEEP SECRET!** Never expose to client-side
- Bypasses RLS policies
- Used for admin operations (create/update/delete)
- Only used in server-side API routes

## ⚠️ Security Notes

1. **Never commit `.env.local` to git**
   - It's already in `.gitignore`
   - Contains sensitive keys

2. **Service Role Key is Powerful**
   - Can bypass all RLS policies
   - Only use in server-side code
   - Never expose to browser/client

3. **For Production Deployment**
   - Set these in Vercel/Netlify environment variables
   - Don't hardcode in code

## ✅ Verification

After setting up `.env.local`:

1. Restart your dev server:
   ```bash
   npm run dev
   ```

2. Check browser console for errors
3. Visit `/test-products` to verify connection
4. Products should appear on `/menu` page

## 🐛 Troubleshooting

### "Missing Supabase configuration"
- Check `.env.local` exists in root directory
- Verify all three variables are set
- Restart dev server after creating `.env.local`

### "Permission denied" errors
- Run `scripts/13-FINAL-FIX-PRODUCTS-SHOP.sql` in Supabase
- Verify RLS policies are set correctly

### Products not showing
- Check browser console for errors
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Run verification script: `scripts/14-verify-products-visible.sql`
