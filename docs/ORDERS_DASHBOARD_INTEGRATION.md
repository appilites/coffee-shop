# Orders — Dashboard integration guide

This document explains how customer orders from the **shop** are stored and how a **separate admin dashboard** (or any backend) can **read** and **update** them so orders show and are handled correctly.

---

## Where orders live

Orders are stored in **Supabase** (PostgreSQL), not only in the browser.

| Table | Purpose |
|--------|---------|
| `orders` | One row per order: customer, totals, status, payment |
| `order_items` | Line items: product, quantity, prices, customizations JSON |

The shop creates rows when the customer checks out (`POST /api/create-order`) and updates payment status after the payment step (`POST /api/confirm-payment`).

---

## `orders` row (main fields)

Use these columns in your dashboard UI and filters.

| Column | Type | Notes |
|--------|------|--------|
| `id` | UUID | Primary key — use in URLs and updates |
| `order_number` | text | Human-readable, e.g. `ORD-1730...` |
| `user_id` | UUID, nullable | Set when customer is logged in |
| `customer_name` | text | Required for checkout |
| `customer_email` | text | |
| `customer_phone` | text, nullable | |
| `total_amount` | numeric | Includes tax |
| `tax_amount` | numeric | |
| `status` | text | `pending` → `confirmed` → `preparing` → `ready` → `completed` (or `cancelled`) |
| `payment_status` | text | `pending`, `paid`, `failed`, `refunded` |
| `payment_intent_id` | text, nullable | Set after payment |
| `pickup_time` | timestamptz, nullable | Customer preference |
| `special_instructions` | text, nullable | |
| `is_guest_order` | boolean | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

Optional columns may exist in your project (e.g. `location_id`, `estimated_ready_time`) — read from Supabase or your migrations.

---

## `order_items` row

| Column | Type | Notes |
|--------|------|--------|
| `id` | UUID | |
| `order_id` | UUID | FK → `orders.id` |
| `menu_item_id` | text | FK → `menu_items.id` |
| `item_name` | text | Snapshot at order time |
| `quantity` | int | |
| `unit_price` | numeric | Per unit |
| `total_price` | numeric | Line total |
| `customizations` | jsonb | Array of objects from the shop cart (options / choices) |

---

## Shop API routes (reference)

These run on the **same Next.js app** as the storefront. Your dashboard does **not** have to call them if it talks to Supabase directly — they are documented so behavior matches.

### `POST /api/create-order`

- **Body (JSON):** `items[]` (each with `menu_item_id`, `name`, `quantity`, `totalPrice`, `customizations`), `customer_name`, `customer_email`, `customer_phone`, optional `user_id`, `special_instructions`, `pickup_time`, `is_guest_order`.
- **Effect:** Inserts one `orders` row and related `order_items` rows.
- **Server:** Uses **service role** when `SUPABASE_SERVICE_ROLE_KEY` is set (recommended for production).

### `POST /api/confirm-payment`

- **Body:** `{ "orderId": "<uuid>", "paymentIntentId": "..." }`
- **Effect:** Sets `payment_status` to `paid`, stores `payment_intent_id`. **`orders.status` stays `pending`** until the dashboard confirms the order (`status` → `confirmed`, then kitchen flow).

---

## Dashboard: recommended approach (Supabase directly)

### 1. Environment

In the dashboard app, set:

- `NEXT_PUBLIC_SUPABASE_URL` — same project as the shop  
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — for **client-side** reads if RLS allows  
- **`SUPABASE_SERVICE_ROLE_KEY`** — **only on the server** (API routes / server actions) for full access if RLS blocks the anon key  

Never expose the service role in browser code.

### 2. Fetch orders (example query)

```sql
select
  o.*,
  json_agg(
    json_build_object(
      'id', oi.id,
      'item_name', oi.item_name,
      'quantity', oi.quantity,
      'unit_price', oi.unit_price,
      'total_price', oi.total_price,
      'customizations', oi.customizations
    )
  ) filter (where oi.id is not null) as items
from orders o
left join order_items oi on oi.order_id = o.id
group by o.id
order by o.created_at desc;
```

In JS (Supabase client):

```ts
const { data, error } = await supabase
  .from("orders")
  .select(`
    *,
    items:order_items (*)
  `)
  .order("created_at", { ascending: false })
```

### 3. Update order status (kitchen / admin)

```ts
await supabase
  .from("orders")
  .update({
    status: "preparing", // or confirmed, ready, completed, cancelled
    updated_at: new Date().toISOString(),
  })
  .eq("id", orderId)
```

Use the same `status` values the shop expects (see table above).

### 4. Realtime (optional)

Subscribe to `postgres_changes` on `public.orders` (and optionally `order_items`) so the dashboard refreshes when new orders arrive — same pattern as `components/admin/orders-tab.tsx` in this repo.

---

## Row Level Security (RLS)

If the dashboard **cannot** read or update `orders` with the **anon** key:

1. Add policies so **authenticated admin users** can `select` / `update` `orders` and `order_items`, **or**
2. Perform all dashboard mutations from **server-side** code using the **service role** (never ship the service key to the client).

---

## Checklist for your dashboard team

- [ ] Same Supabase project URL and keys as the shop (or service role on server only).  
- [ ] List view: query `orders` with `order_items` (join or nested select).  
- [ ] Detail view: filter `order_items` by `order_id`.  
- [ ] Actions: `update` `orders.status` (and `payment_status` only if your flow needs it).  
- [ ] New orders from the shop appear after checkout + create-order; **`payment_status`** becomes **paid** after payment (confirm-payment); **`status`** becomes **confirmed** only when the dashboard sets it.  

---

## File reference in this repo

| File | Role |
|------|------|
| `app/api/create-order/route.ts` | Creates DB order + line items |
| `app/api/confirm-payment/route.ts` | Marks order **paid**; does not set workflow `status` to confirmed (dashboard does) |
| `app/checkout/page.tsx` | Calls create-order before payment |
| `app/payment/page.tsx` | Calls confirm-payment after demo pay |
| `components/admin/orders-tab.tsx` | Example admin UI (same Supabase queries) |

---

## Support

If orders still do not appear: verify `SUPABASE_SERVICE_ROLE_KEY` on the **shop** deployment (so create-order succeeds), confirm RLS policies allow the dashboard’s client or server role to `select` on `orders`, and check Supabase **Table Editor** for new rows in `orders` after a test purchase.

---

## Troubleshooting: order shows “Order Placed” but nothing in the database

The **order status page** reads from **localStorage** first, so the UI can look successful even when Supabase insert failed. Fix the database layer:

### 1. Set the service role key (recommended)

In **Vercel** (or `.env.local` locally), add:

```bash
SUPABASE_SERVICE_ROLE_KEY=<from Supabase → Settings → API → service_role>
```

Redeploy / restart `next dev`. The shop’s `/api/create-order` uses this key so inserts **bypass RLS**.

See `.env.example` in this repo.

### 2. Or run the RLS SQL (if you cannot use the service role)

In Supabase → **SQL Editor**, run:

`scripts/supabase-orders-rls.sql`

This adds policies so **anon** can `INSERT` into `orders` and `order_items` (used when the API falls back to the anon key). Prefer the service role in production.

### 3. Foreign key on `menu_items`

`order_items.menu_item_id` must exist in `menu_items`. If the cart uses **mock IDs** or products not synced to Supabase, inserts fail. Use real menu items from your database or run product sync.

### 4. See the real error

If checkout fails, the alert now includes Supabase **details** and a short **hint**. Check the browser Network tab for `POST /api/create-order` response JSON.
