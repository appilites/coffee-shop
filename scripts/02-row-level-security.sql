-- Enable Row Level Security
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customization_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE customization_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Locations: Everyone can read active locations
CREATE POLICY "Anyone can view active locations" ON locations
  FOR SELECT USING (is_active = true);

-- Users: Users can view and update their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Menu: Everyone can read available menu items (for guest browsing)
CREATE POLICY "Anyone can view active menu categories" ON menu_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view available menu items" ON menu_items
  FOR SELECT USING (is_available = true);

CREATE POLICY "Anyone can view customization options" ON customization_options
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view customization choices" ON customization_choices
  FOR SELECT USING (true);

-- Orders: Users can view their own orders, guests can view by order_id
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (
    auth.uid() = user_id OR 
    is_guest_order = true
  );

CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    is_guest_order = true
  );

CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    is_guest_order = true
  );

-- Order Items: Users can view items from their orders
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.user_id = auth.uid() OR orders.is_guest_order = true)
    )
  );

CREATE POLICY "Users can create order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.user_id = auth.uid() OR orders.is_guest_order = true)
    )
  );
