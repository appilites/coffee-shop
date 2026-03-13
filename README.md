# Druids Nutrition - Mobile Drive-Through Coffee Shop App

A modern, fast mobile-first application for ordering healthy drinks ahead and picking them up via drive-through. Built with Next.js 16, React 19, Supabase, and Stripe.

## Features

### Customer Features
- **QR Code Entry** - Scan a QR code to instantly access the menu without sign-up
- **Guest Checkout** - Browse menu and place orders without creating an account
- **Location Selection** - Choose from multiple coffee shop locations
- **Menu Browsing** - Browse drinks by category (Coffee, Espresso, Tea, Food)
- **Drink Customization** - Customize size, milk type, extras, and temperature
- **Shopping Cart** - Add multiple items with quantity controls
- **Multiple Auth Options** - Continue as guest, login, or sign up
- **Secure Payments** - Card payment processing (demo mode included)
- **Real-Time Order Tracking** - Live order status updates via WebSocket
- **Order History** - View past orders (for registered users)
- **Quick Reorder** - One-click reorder from order history
- **Drive-Through Pickup** - Pre-order for fast drive-through pickup
- **Mobile Navigation** - Easy bottom navigation bar

### Admin Features
- **Order Management** - View and manage incoming orders in real-time
- **Status Controls** - Update order status (pending → confirmed → preparing → ready → completed)
- **Menu Management** - Add, edit, delete, and toggle availability of menu items
- **Store Settings** - Manage locations, hours, and contact information
- **Real-Time Updates** - Automatic order updates via Supabase subscriptions

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe (demo mode included)
- **Real-Time**: Supabase Realtime subscriptions
- **State Management**: React Context API

## Project Structure

\`\`\`
├── app/
│   ├── page.tsx                 # QR landing page
│   ├── menu/                    # Menu browsing
│   ├── cart/                    # Shopping cart
│   ├── checkout/                # Customer info & auth
│   ├── payment/                 # Payment processing
│   ├── order-status/            # Real-time order tracking
│   ├── profile/                 # User profile & order history
│   ├── admin/                   # Admin dashboard
│   └── api/                     # API routes
│       ├── create-order/        # Order creation
│       ├── create-payment-intent/  # Payment intent
│       └── confirm-payment/     # Payment confirmation
├── components/
│   ├── menu/                    # Menu components
│   ├── admin/                   # Admin components
│   ├── mobile-nav.tsx           # Mobile navigation
│   └── ui/                      # shadcn/ui components
├── lib/
│   ├── context/                 # React contexts
│   ├── supabase/                # Supabase clients
│   └── types.ts                 # TypeScript types
└── scripts/                     # Database scripts
    ├── 01-create-tables.sql     # Table creation
    ├── 02-row-level-security.sql  # RLS policies
    └── 03-seed-data.sql         # Seed data
\`\`\`

## Database Schema

### Tables
- **users** - User accounts and profiles
- **locations** - Coffee shop locations
- **menu_items** - Menu items with categories and pricing
- **menu_item_options** - Customization options (size, milk, etc.)
- **option_choices** - Available choices for each option
- **orders** - Customer orders with items and status

### Key Features
- Row Level Security (RLS) enabled
- Real-time subscriptions for order updates
- Guest and authenticated user support
- Admin role-based access control

## Getting Started

### 1. Set up Supabase Integration

1. Go to the **Connect** section in the v0 sidebar
2. Add the **Supabase** integration
3. Follow the prompts to connect your Supabase project

### 2. Run Database Scripts

The following SQL scripts will automatically create your database schema:

1. `01-create-tables.sql` - Creates all necessary tables
2. `02-row-level-security.sql` - Sets up security policies
3. `03-seed-data.sql` - Adds sample locations and menu items

These scripts are located in the `scripts/` folder and can be run directly in v0.

### 3. Set up Stripe (Optional)

1. Go to the **Connect** section in the v0 sidebar
2. Add the **Stripe** integration for real payment processing
3. Without Stripe, the app runs in demo mode

### 4. Create Admin User

To access the admin dashboard, you need to create a user with the `admin` role:

\`\`\`sql
-- First, sign up through the app, then run:
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
\`\`\`

### 5. Access the Application

- **Customer App**: `/` or `/menu`
- **Admin Dashboard**: `/admin` (requires admin role)

## User Flows

### Guest Checkout Flow
1. Scan QR code → Land on menu page
2. Select location
3. Browse menu and add items to cart
4. Customize drinks
5. Go to checkout
6. Enter name, email, phone (guest option)
7. Enter payment details
8. Track order status in real-time

### Registered User Flow
1. Scan QR → Menu
2. Add items to cart
3. Login or sign up at checkout
4. Complete payment
5. View order in profile
6. Quick reorder from history

### Admin Flow
1. Login to `/admin`
2. View incoming orders
3. Update order status as preparation progresses
4. Manage menu items and pricing
5. Configure locations and settings

## Key Features Explained

### Real-Time Order Tracking
Orders update automatically using Supabase Realtime subscriptions. When an admin changes an order status, customers see the update instantly without refreshing.

### Guest Checkout
Users can place orders without creating an account. Their order data is still stored in the database for tracking, but not linked to a user account.

### Mobile-First Design
The app uses a coffee-themed color palette with warm browns and creams, optimized for mobile screens with easy thumb-reach navigation.

### Quick Reorder
Registered users can reorder their favorite drinks with one click from their order history.

## Environment Variables

The following environment variables are automatically configured when you add integrations:

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL`

### Stripe (Optional)
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

## Customization

### Adding Menu Items
Use the admin dashboard to add menu items through the UI, or insert directly:

\`\`\`sql
INSERT INTO menu_items (name, description, category, price, image_url)
VALUES ('Caramel Macchiato', 'Sweet and creamy', 'espresso', 4.95, '/images/caramel-macchiato.jpg');
\`\`\`

### Adding Locations
\`\`\`sql
INSERT INTO locations (name, address, phone, hours, is_active)
VALUES ('Downtown', '123 Main St', '(555) 123-4567', 'Mon-Fri 7am-6pm', true);
\`\`\`

### Customizing Colors
Edit `app/globals.css` to change the color scheme:

\`\`\`css
--brand: 30 40% 25%;        /* Coffee brown */
--accent: 25 60% 50%;       /* Warm orange */
\`\`\`

## Deployment

### Deploy to Vercel
1. Click the **Publish** button in v0
2. Follow the prompts to deploy to Vercel
3. Your environment variables will be automatically configured

### Production Checklist
- [ ] Set up production Supabase project
- [ ] Configure Stripe live keys
- [ ] Set up email confirmation for new users
- [ ] Configure custom domain
- [ ] Set up backup system for database
- [ ] Test all order flows
- [ ] Enable push notifications (optional)

## Security

- All database tables have Row Level Security (RLS) enabled
- Admin routes are protected by middleware
- Authentication handled by Supabase Auth
- Passwords are securely hashed
- Payment details never stored in database
- Guest orders isolated from user accounts

## Support

For issues or questions:
- Check the v0 documentation
- Visit vercel.com/help for support
- Review Supabase documentation for database questions

## License

MIT License - Feel free to use this project for your coffee shop!

---

Built with ☕ using Next.js 16, React 19, Supabase, and v0
