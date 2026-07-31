-- Seed data for production database
-- Extracted from schema.sql

-- System Settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('store_name', '"My Store"', 'Store display name'),
('store_phone', '"+856 20 00 000 000"', 'Store contact phone'),
('currency', '"LAK"', 'Default currency'),
('tax_percent', '7', 'Default tax rate'),
('store_logo', '""', 'Store logo URL')
ON CONFLICT (setting_key) DO NOTHING;

-- Expense Categories
INSERT INTO expense_categories (name, description) VALUES
('Rent', 'Monthly rent'),
('Utilities', 'Electricity, water, internet'),
('Supplies', 'Office and store supplies'),
('Marketing', 'Advertising and promotions'),
('Transport', 'Delivery and logistics')
ON CONFLICT DO NOTHING;

-- Admin user (password: admin123, bcrypt hash)
INSERT INTO users (email, password_hash, full_name, role, email_verified, is_active) VALUES
('admin@template.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Admin', 'admin', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

-- Categories
INSERT INTO categories (name, slug, description, sort_order, is_active) VALUES
('Electronics', 'electronics', 'Phones, tablets, and accessories', 1, TRUE),
('Clothing', 'clothing', 'Men and women fashion', 2, TRUE),
('Home & Garden', 'home-garden', 'Furniture and home decor', 3, TRUE),
('Sports', 'sports', 'Sports equipment and gear', 4, TRUE),
('Books', 'books', 'Physical and digital books', 5, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- Products (from local dev database export)
INSERT INTO products (name, slug, sku, category_id, description, cost_price, selling_price, compare_price, stock, is_featured, is_active) VALUES
('iPhone 15 Pro Max', 'iphone-15-pro-max', 'IPH15PM', (SELECT id FROM categories WHERE slug='electronics'), 'Latest Apple smartphone with A17 Pro chip', 999.00, 1299.99, 0, 25, TRUE, TRUE),
('Samsung Galaxy S24', 'samsung-galaxy-s24', 'SGS24', (SELECT id FROM categories WHERE slug='electronics'), 'Samsung flagship with AI features', 699.00, 899.99, 0, 30, TRUE, TRUE),
('MacBook Air M3', 'macbook-air-m3', 'MBA3', (SELECT id FROM categories WHERE slug='electronics'), 'Ultra-thin laptop with M3 chip', 899.00, 1099.99, 0, 15, TRUE, TRUE),
('AirPods Pro 2', 'airpods-pro-2', 'APP2', (SELECT id FROM categories WHERE slug='electronics'), 'Active noise cancelling earbuds', 179.99, 249.99, 0, 50, FALSE, TRUE),
('USB-C Hub 7-in-1', 'usb-c-hub-7in1', 'USB7', (SELECT id FROM categories WHERE slug='electronics'), 'Multiport adapter for MacBook', 19.99, 39.99, 0, 100, FALSE, TRUE),
('Classic Cotton T-Shirt', 'classic-cotton-tshirt', 'CCT01', (SELECT id FROM categories WHERE slug='clothing'), '100% cotton casual t-shirt', 10.00, 24.99, 0, 200, FALSE, TRUE),
('Denim Jacket', 'denim-jacket', 'DJ01', (SELECT id FROM categories WHERE slug='clothing'), 'Vintage style denim jacket', 40.00, 79.99, 0, 50, TRUE, TRUE),
('Running Shoes Pro', 'running-shoes-pro', 'RSP01', (SELECT id FROM categories WHERE slug='clothing'), 'Lightweight running shoes', 65.00, 129.99, 0, 75, FALSE, TRUE),
('Ergonomic Office Chair', 'ergonomic-office-chair', 'EOC01', (SELECT id FROM categories WHERE slug='home-garden'), 'Adjustable lumbar support chair', 180.00, 349.99, 0, 20, TRUE, TRUE),
('LED Desk Lamp', 'led-desk-lamp', 'LDL01', (SELECT id FROM categories WHERE slug='home-garden'), 'Dimmable LED desk lamp with USB port', 25.00, 49.99, 0, 60, FALSE, TRUE),
('Yoga Mat Premium', 'yoga-mat-premium', 'YMP01', (SELECT id FROM categories WHERE slug='sports'), 'Non-slip exercise yoga mat', 15.00, 39.99, 0, 80, FALSE, TRUE),
('Adjustable Dumbbells', 'adjustable-dumbbells', 'AD01', (SELECT id FROM categories WHERE slug='sports'), '5-25 lb adjustable dumbbell set', 100.00, 199.99, 0, 30, TRUE, TRUE),
('The Art of Code', 'the-art-of-code', 'TAOC', (SELECT id FROM categories WHERE slug='books'), 'Modern software engineering patterns', 10.00, 29.99, 0, 100, FALSE, TRUE),
('Business Strategy 101', 'business-strategy-101', 'BS101', (SELECT id FROM categories WHERE slug='books'), 'Essential business strategy guide', 12.00, 34.99, 0, 60, FALSE, TRUE)
ON CONFLICT (slug) DO NOTHING;
