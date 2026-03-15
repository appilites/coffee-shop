# Variations Manual Setup Guide

## Overview
Ab **sirf dashboard se manually added variations** show hongi. Koi default/auto-generated variations nahi hongi.

## How It Works

1. ✅ **Dashboard se variations add karein** - Product edit page se variations add/edit/delete kar sakte hain
2. ✅ **Shop page par automatically show hongi** - Database se fetch hokar show hongi
3. ✅ **No auto-generation** - Koi default Size ya Add-ons nahi banayenge

## Removing Auto-Generated Variations

Agar pehle se auto-generated variations database mein hain, to unhe remove karne ke liye:

### Step 1: Supabase SQL Editor Kholo
1. Supabase Dashboard → SQL Editor

### Step 2: Remove Script Run Karo
1. `scripts/20-remove-auto-variations.sql` file kholo
2. Code copy karke SQL Editor mein paste karo
3. Run karo

Yeh script:
- ✅ Size variations delete karega
- ✅ Add-ons variations delete karega
- ✅ Sirf manually added variations reh jayengi

## Adding Variations via Dashboard

1. **Admin Dashboard** kholo
2. **Products** section mein jao
3. Kisi product ko **Edit** karo
4. **Variations** section mein:
   - New variation add karo
   - Options add karo
   - Prices set karo
5. **Save** karo

## Verification

1. Shop page par product detail page kholo
2. Agar variations add ki hain, to wahan show hongi
3. Agar koi variation nahi hai, to directly "Add to Cart" button dikhega

## Important Points

- ❌ **No default variations** - Koi auto-generated Size/Add-ons nahi honge
- ✅ **Full control** - Sab kuch dashboard se manage karein
- ✅ **Clean database** - Sirf manually added variations database mein hongi

## Troubleshooting

### Issue: Variations show nahi ho rahi
**Solution**: 
1. Dashboard se verify karo ke variations add hui hain
2. Database mein check karo (`customization_options` table)
3. Browser console mein errors check karo

### Issue: Old auto-generated variations abhi bhi dikh rahi hain
**Solution**: 
1. `scripts/20-remove-auto-variations.sql` run karo
2. Page refresh karo
3. Clear browser cache karo
