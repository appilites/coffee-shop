# 🚀 Quick Fix Guide - Products Not Showing

## ⚡ IMMEDIATE FIX (5 Minutes)

### Step 1: Run SQL Script in Supabase

1. Open **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy **ENTIRE** content from: `scripts/13-FINAL-FIX-PRODUCTS-SHOP.sql`
6. Paste in SQL Editor
7. Click **Run** (or press Ctrl+Enter)
8. Wait for success message ✅

**You should see:**
- ✅ Policies Created
- ✅ Grants Applied  
- ✅ Test Query Results showing 340 products

### Step 2: Verify Products

Run this in Supabase SQL Editor:

```sql
SELECT COUNT(*) as total FROM menu_items;
```

**Should return: 340**

### Step 3: Test Shop Website

1. Open your shop: `http://localhost:3000/menu`
2. Open Browser Console (F12)
3. Check for errors
4. Products should now appear! ✅

---

## 🔍 If Products Still Don't Show

### Check 1: Browser Console Errors

Open DevTools (F12) → Console tab

Look for errors like:
- `❌ Error fetching menu items`
- `permission denied`
- `policy`

**If you see permission errors:**
- Run the SQL script again
- Make sure you copied the ENTIRE script

### Check 2: Test Page

Visit: `http://localhost:3000/test-products`

This page shows:
- ✅ Supabase connection status
- ✅ Direct query results
- ✅ Service query results
- ✅ Detailed error messages

### Check 3: Verify RLS Policies

Run in Supabase SQL Editor:

```sql
-- Check if policies exist
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'menu_items';
```

**Should see:** "Shop can read all products" with cmd = "SELECT"

### Check 4: Verify Grants

Run in Supabase SQL Editor:

```sql
-- Check if anon can read
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'menu_items' AND grantee = 'anon';
```

**Should see:** SELECT privilege for anon

---

## 📋 Environment Variables Check

### Coffee Shop `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://xnmnklgmmeqpajxwrkir.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Get keys from:** Supabase Dashboard → Settings → API

---

## ✅ Success Checklist

After running SQL script, verify:

- [ ] SQL script ran without errors
- [ ] Test query shows 340 products
- [ ] Shop website shows products (not just categories)
- [ ] No console errors in browser
- [ ] `/test-products` page shows success

---

## 🆘 Still Not Working?

1. **Check Supabase Logs:**
   - Supabase Dashboard → Logs
   - Look for errors related to `menu_items`

2. **Verify Database:**
   ```sql
   -- Check products exist
   SELECT COUNT(*) FROM menu_items;
   
   -- Check products have categories
   SELECT COUNT(*) FROM menu_items WHERE category_id IS NULL;
   ```

3. **Clear Browser Cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

4. **Restart Dev Server:**
   ```bash
   # Stop server (Ctrl+C)
   # Start again
   npm run dev
   ```

---

## 📞 What to Share if Still Not Working

1. Screenshot of SQL Editor results
2. Browser console errors (F12 → Console)
3. Results from `/test-products` page
4. Output of this query:
   ```sql
   SELECT policyname, cmd FROM pg_policies WHERE tablename = 'menu_items';
   ```
