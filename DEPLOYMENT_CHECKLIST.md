# 🚀 Deployment Checklist - Coffee Shop

## ✅ Supabase Setup (REQUIRED - Run First!)

### 1. Run RLS Fix Script
**IMPORTANT:** Products won't show without this!

1. Open **Supabase Dashboard** → Go to **SQL Editor**
2. Copy and paste the entire content of `scripts/13-FINAL-FIX-PRODUCTS-SHOP.sql`
3. Click **Run**
4. Verify you see:
   - ✅ Policies Created
   - ✅ Grants Applied
   - ✅ Test Query Results showing 340 products

### 2. Verify Database Tables
Run this query in Supabase SQL Editor to verify:

```sql
-- Check products count
SELECT COUNT(*) as total_products FROM menu_items;

-- Check categories count
SELECT COUNT(*) as total_categories FROM menu_categories;

-- Check products have categories
SELECT 
  COUNT(*) as products_with_categories,
  COUNT(*) FILTER (WHERE category_id IS NULL) as products_without_categories
FROM menu_items;
```

**Expected Results:**
- total_products: 340
- total_categories: Should match your categories
- products_without_categories: Should be 0 (all products should have category_id)

### 3. Get Supabase Credentials
From Supabase Dashboard → Settings → API:

1. **Project URL**: Copy `NEXT_PUBLIC_SUPABASE_URL`
2. **anon/public key**: Copy `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **service_role key** (for admin): Copy `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

---

## 📁 Environment Variables Setup

### For Coffee Shop (Main Website)

Create `.env.local` in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### For Admin Dashboard

Create `admin-dashboard/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

---

## 🔧 Local Development Setup

### 1. Install Dependencies

```bash
# Install shop dependencies
npm install

# Install admin dashboard dependencies
cd admin-dashboard
npm install
cd ..
```

### 2. Run Development Servers

```bash
# Terminal 1: Run shop
npm run dev

# Terminal 2: Run admin dashboard
cd admin-dashboard
npm run dev
```

### 3. Test the Shop

1. Open http://localhost:3000/menu
2. Check browser console (F12) for errors
3. Products should appear (all 340)
4. Categories should appear

### 4. Test Admin Dashboard

1. Open http://localhost:3001 (or port shown)
2. Login/Register
3. Go to Products tab
4. Should see all 340 products
5. Test: Create, Edit, Delete products

---

## 🌐 Production Deployment (Vercel)

### 1. Deploy Coffee Shop

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy

### 2. Deploy Admin Dashboard

1. Create new Vercel project for admin-dashboard
2. Set root directory to `admin-dashboard`
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy

---

## ✅ Pre-Deployment Checklist

- [ ] RLS script (`13-FINAL-FIX-PRODUCTS-SHOP.sql`) run in Supabase
- [ ] Verified 340 products in database
- [ ] All products have valid `category_id`
- [ ] Environment variables set in `.env.local`
- [ ] Shop shows products locally (test at `/menu`)
- [ ] Admin dashboard can create/edit/delete products
- [ ] No console errors in browser
- [ ] Test page (`/test-products`) shows products

---

## 🐛 Troubleshooting

### Products Not Showing on Shop

1. **Check RLS Policies:**
   ```sql
   SELECT policyname, cmd FROM pg_policies WHERE tablename = 'menu_items';
   ```
   Should see: "Shop can read all products" with cmd = "SELECT"

2. **Check Grants:**
   ```sql
   SELECT grantee, privilege_type 
   FROM information_schema.role_table_grants 
   WHERE table_name = 'menu_items' AND grantee = 'anon';
   ```
   Should see: SELECT privilege

3. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for errors starting with `❌`
   - Check network tab for failed requests

4. **Test Direct Query:**
   Visit `/test-products` page to see detailed diagnostics

### Categories Showing But Products Not

This means:
- ✅ RLS for categories is working
- ❌ RLS for products is NOT working

**Solution:** Run `scripts/13-FINAL-FIX-PRODUCTS-SHOP.sql` again

### Admin Dashboard Can't Update Products

1. Check `SUPABASE_SERVICE_ROLE_KEY` is set in admin dashboard `.env.local`
2. Verify service_role has ALL permissions:
   ```sql
   SELECT grantee, privilege_type 
   FROM information_schema.role_table_grants 
   WHERE table_name = 'menu_items' AND grantee = 'service_role';
   ```

---

## 📞 Support

If products still don't show after running the SQL script:

1. Check Supabase Dashboard → Logs for errors
2. Check browser console for detailed error messages
3. Visit `/test-products` page for diagnostics
4. Verify environment variables are correct

---

## 🎯 Quick Fix Commands

### Test Products Query (Run in Supabase SQL Editor)
```sql
-- This should return 340 products
SELECT COUNT(*) FROM menu_items;

-- This should return all products (no permission error)
SELECT * FROM menu_items LIMIT 10;
```

### Verify RLS is Working
```sql
-- Check if anon can read
SET ROLE anon;
SELECT COUNT(*) FROM menu_items;
RESET ROLE;
```

If this returns 340, RLS is working! ✅
