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
('Electronics', 'electronics', 'Electronic devices and accessories', 1, TRUE),
('Clothing', 'clothing', 'Apparel and fashion items', 2, TRUE),
('Home & Garden', 'home-garden', 'Home improvement and garden supplies', 3, TRUE),
('Food & Beverages', 'food-beverages', 'Food and drink items', 4, TRUE),
('Books', 'books', 'Books and educational materials', 5, TRUE)
ON CONFLICT (slug) DO NOTHING;
