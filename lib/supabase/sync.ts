import { getSupabaseBrowserClient } from "./client"
import { mockCategories, mockMenuItems, mockLocations } from "../mock-data"

const supabase = getSupabaseBrowserClient()

/**
 * Sync mock data to Supabase database
 * This function should be called once to populate the database with initial data
 */
export async function syncMockDataToSupabase() {
  try {
    console.log('Starting data sync to Supabase...')

    // 1. Sync Locations
    console.log('Syncing locations...')
    for (const location of mockLocations) {
      const { error } = await supabase
        .from('locations')
        .upsert(location, { onConflict: 'id' })
      
      if (error) {
        console.error('Error syncing location:', location.id, error)
      }
    }

    // 2. Sync Categories
    console.log('Syncing categories...')
    for (const category of mockCategories) {
      const { error } = await supabase
        .from('menu_categories')
        .upsert(category, { onConflict: 'id' })
      
      if (error) {
        console.error('Error syncing category:', category.id, error)
      }
    }

    // 3. Sync Menu Items
    console.log('Syncing menu items...')
    for (const item of mockMenuItems) {
      const { error } = await supabase
        .from('menu_items')
        .upsert(item, { onConflict: 'id' })
      
      if (error) {
        console.error('Error syncing menu item:', item.id, error)
      }
    }

    console.log('Data sync completed successfully!')
    return { success: true }

  } catch (error) {
    console.error('Error during data sync:', error)
    return { success: false, error }
  }
}

/**
 * Check if database has data
 */
export async function checkDatabaseData() {
  try {
    const { count: locationCount } = await supabase
      .from('locations')
      .select('*', { count: 'exact', head: true })

    const { count: categoryCount } = await supabase
      .from('menu_categories')
      .select('*', { count: 'exact', head: true })

    const { count: itemCount } = await supabase
      .from('menu_items')
      .select('*', { count: 'exact', head: true })

    return {
      locations: locationCount || 0,
      categories: categoryCount || 0,
      menuItems: itemCount || 0,
      isEmpty: (locationCount || 0) === 0 && (categoryCount || 0) === 0 && (itemCount || 0) === 0
    }
  } catch (error) {
    console.error('Error checking database data:', error)
    return {
      locations: 0,
      categories: 0,
      menuItems: 0,
      isEmpty: true,
      error
    }
  }
}

/**
 * Create database tables if they don't exist
 * Note: In production, you should create these tables through Supabase dashboard or migrations
 */
export async function createDatabaseTables() {
  // This is just for reference - tables should be created in Supabase dashboard
  const tableDefinitions = {
    locations: `
      CREATE TABLE IF NOT EXISTS locations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        zip_code TEXT NOT NULL,
        phone TEXT,
        is_active BOOLEAN DEFAULT true,
        opening_time TEXT,
        closing_time TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `,
    menu_categories: `
      CREATE TABLE IF NOT EXISTS menu_categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        parent_id TEXT REFERENCES menu_categories(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `,
    menu_items: `
      CREATE TABLE IF NOT EXISTS menu_items (
        id TEXT PRIMARY KEY,
        category_id TEXT REFERENCES menu_categories(id),
        name TEXT NOT NULL,
        description TEXT,
        base_price DECIMAL(10,2) NOT NULL,
        image_url TEXT,
        is_available BOOLEAN DEFAULT true,
        is_featured BOOLEAN DEFAULT false,
        prep_time_minutes INTEGER DEFAULT 5,
        variations JSONB DEFAULT '[]',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `,
    customization_options: `
      CREATE TABLE IF NOT EXISTS customization_options (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        menu_item_id TEXT REFERENCES menu_items(id) ON DELETE CASCADE,
        option_name TEXT NOT NULL,
        option_type TEXT CHECK (option_type IN ('single', 'multiple')) DEFAULT 'single',
        is_required BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `,
    customization_choices: `
      CREATE TABLE IF NOT EXISTS customization_choices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        option_id UUID REFERENCES customization_options(id) ON DELETE CASCADE,
        choice_name TEXT NOT NULL,
        price_modifier DECIMAL(10,2) DEFAULT 0,
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `,
    orders: `
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        location_id TEXT REFERENCES locations(id),
        order_number TEXT UNIQUE NOT NULL,
        customer_name TEXT NOT NULL,
        customer_email TEXT,
        customer_phone TEXT,
        total_amount DECIMAL(10,2) NOT NULL,
        tax_amount DECIMAL(10,2) DEFAULT 0,
        status TEXT CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')) DEFAULT 'pending',
        payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
        payment_intent_id TEXT,
        pickup_time TIMESTAMP WITH TIME ZONE,
        is_guest_order BOOLEAN DEFAULT true,
        special_instructions TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `,
    order_items: `
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        menu_item_id TEXT REFERENCES menu_items(id),
        item_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        customizations JSONB DEFAULT '[]',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  }

  console.log('Database table definitions ready. Please create these tables in your Supabase dashboard.')
  return tableDefinitions
}