# Variations Database Setup Guide

## ⚠️ Important Note
**Default mein koi variations nahi hongi!** Sab variations dashboard se manually add karni hongi. Auto-generated variations (Size, Add-ons) ab nahi banayenge.

## Overview
Yeh guide aapko batayegi ke kaise products ki variations ko database mein manually add karein via dashboard.

## Step 1: Supabase Dashboard Mein SQL Editor Kholo

1. Supabase Dashboard mein jao: https://supabase.com/dashboard
2. Apna project select karo
3. Left sidebar se **SQL Editor** select karo

## Step 2: SQL Script Run Karo

1. `scripts/17-save-variations-to-db.sql` file kholo
2. Saara SQL code copy karo
3. Supabase SQL Editor mein paste karo
4. **Run** button click karo (ya `Ctrl+Enter` press karo)

## Step 3: Results Check Karo

Script run hone ke baad:
- ✅ Success messages dikhengi
- ✅ Kitne variations create hue
- ✅ Products ki list with variations dikhegi

## Step 4: Verify Karo

1. Supabase Dashboard mein **Table Editor** kholo
2. `customization_options` table check karo
3. `customization_choices` table check karo
4. Data properly save hua hai ya nahi verify karo

## Common Issues aur Solutions

### Issue 1: "Table does not exist" Error
**Solution**: Pehle tables create karo:
```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('customization_options', 'customization_choices');
```

Agar tables nahi hain, to pehle create karo (Supabase Dashboard se ya migration script se).

### Issue 2: "Permission denied" Error
**Solution**: RLS (Row Level Security) policies check karo. Anonymous users ko read permission chahiye:
```sql
-- Allow anonymous users to read customizations
CREATE POLICY IF NOT EXISTS "Allow anonymous read" 
ON customization_options FOR SELECT 
TO anon 
USING (true);

CREATE POLICY IF NOT EXISTS "Allow anonymous read" 
ON customization_choices FOR SELECT 
TO anon 
USING (true);
```

### Issue 3: Variations Already Exist
**Solution**: Script automatically skip karega existing variations. Agar replace karna hai, to pehle delete karo:
```sql
-- Delete all existing variations (careful!)
DELETE FROM customization_choices;
DELETE FROM customization_options;
```

## What This Script Does

1. ✅ **Size Variations**: Liquid products ke liye Size options create karta hai
   - Small, Medium, Large (default)
   - Mini, Full (Beauty/Specialty drinks ke liye)
   - 24oz (Meal Replacement Shakes ke liye)

2. ✅ **Add-ons Variations**: Drinks/Shakes ke liye Add-ons create karta hai
   - Whipped Cream, Caramel Drizzle, etc. (default)
   - Extra Protein, Extra NRG, etc. (Meal Replacement ke liye)

3. ✅ **Smart Detection**: Category ke basis par automatically detect karta hai ke kya variations chahiye

4. ✅ **Skip Existing**: Agar variations already hain, to skip karta hai (duplicate nahi banata)

## After Running Script

1. ✅ Dashboard mein variations edit kar sakte hain
2. ✅ Shop page par automatically show hongi
3. ✅ Add to Cart flow mein variations select kar sakte hain

## Next Steps

1. Script run karo
2. Results verify karo
3. Dashboard mein kisi product ko edit karke variations check karo
4. Shop page par test karo

## Support

Agar koi issue aaye:
1. SQL Editor mein error message check karo
2. Console logs check karo
3. Database tables verify karo
