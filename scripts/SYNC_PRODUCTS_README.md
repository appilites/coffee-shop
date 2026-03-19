# Sync Products to Database

Saves your products API response into `menu_items` so the shop and dashboard use one source of truth.

## 1. Add `variations` column (one-time)

In **Supabase → SQL Editor**, run:

```sql
ALTER TABLE menu_items
ADD COLUMN IF NOT EXISTS variations JSONB DEFAULT '[]';
```

Or run the file: `scripts/add-menu-items-variations-column.sql`

## 2. Sync products

**Option A – From browser or Postman**

- `POST` to: `https://your-domain.com/api/sync-products`  
  (or `http://localhost:3000/api/sync-products` in dev)
- Body (JSON): `{ "products": [ ... ] }`  
  Use the same array you get from your products API (each item: `id`, `category_id`, `name`, `description`, `base_price`, `image_url`, `is_available`, `is_featured`, `prep_time_minutes`, `variations`, etc.).

**Option B – From Node**

Save your API response to a file, e.g. `products.json`, then:

```bash
node -e "
const fs = require('fs');
const body = JSON.parse(fs.readFileSync('products.json','utf8'));
const products = Array.isArray(body) ? body : (body.products || body.data || []);
fetch('http://localhost:3000/api/sync-products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ products })
}).then(r=>r.json()).then(console.log);
"
```

**Option C – Paste in Supabase**

If you prefer not to use the app, you can insert/update `menu_items` in Supabase (including a `variations` JSONB column) from your JSON.

## 3. Behaviour

- Each object in `products` is **upserted** into `menu_items` (matched by `id`).
- If `variations` is **empty** and the product is a known “build your own” type, default variations are applied:
  - **Build Your Own Power Bowl** → Base, Granola, Pick 3 Fruits, Agaves Boosta
  - **Build Your Own Protein Waffle** → Toppings
- Response: `{ success, message, results: [{ id, name, variationsCount, error? }] }`.

## 4. Dashboard

After sync, open the **Admin → Menu** tab. It loads `menu_items` with `variations`. Edits keep `variations` intact unless you change the product in a way that overwrites them.
