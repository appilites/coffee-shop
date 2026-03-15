# Variations Migration Guide

## Overview
Yeh guide aapko help karega ki shop par jo auto-generated variations dikh rahi hain, unko database mein save kaise karein.

## Steps to Save Variations to Database

### Step 1: Supabase Dashboard Open Karein
1. [Supabase Dashboard](https://supabase.com/dashboard) par jayein
2. Apna project select karein
3. Left sidebar se **SQL Editor** click karein

### Step 2: SQL Script Run Karein
1. `scripts/15-save-auto-variations-to-db.sql` file open karein
2. Saara SQL code copy karein
3. Supabase SQL Editor mein paste karein
4. **RUN** button click karein

### Step 3: Verify Karein
Script run hone ke baad, yeh variations create ho jayengi:
- **Size** variations (agar product liquid hai aur database mein nahi hai)
- **Add-ons** variations (agar product drink/shake hai aur database mein nahi hai)

## Kya Script Karega?

### Size Variations:
- **Beauty/Specialty/Kids Drinks**: Mini (24oz), Full (32oz)
- **Meal Replacement Shakes**: 24oz
- **Other Liquid Items**: Small, Medium, Large

### Add-ons Variations:
- **Beauty/Specialty/Kids Drinks**: Whipped Cream, Caramel Drizzle, Vanilla Syrup, Honey
- **Meal Replacement Shakes**: Extra Lift off, Extra NRG, Extra Tea, Extra Protein, Defense Tablet, Immunity Booster, Probiotic, Hibiscus Tea, Green Tea, Whip Cream, Prolessa
- **Other Drinks**: Whipped Cream, Caramel Drizzle, Vanilla Syrup, Honey

## Important Notes:
- Script sirf un products ke liye variations create karega jo database mein nahi hain
- Agar product ke paas already variations hain, wo preserve rahengi
- Script idempotent hai - multiple times run kar sakte hain safely

## After Migration:
1. Variations database mein save ho jayengi
2. Dashboard se edit/update kar sakte hain
3. Shop par wo variations database se aayengi (auto-generated nahi)

## Troubleshooting:
Agar koi error aaye:
1. Check karein ki `customization_options` aur `customization_choices` tables exist karte hain
2. Check karein ki RLS policies allow INSERT operations
3. Console mein error message check karein
