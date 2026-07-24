# Full-Stack Engineering Project

This is a full-stack monorepo with multiple frontend and backend services.

## Project Structure

```
/
├── apps/
│   ├── web/                 # React TypeScript web app (user + admin)
│   │   ├── src/
│   │   │   ├── routes/      # User routes (/, /products, /cart, /login)
│   │   │   │   └── admin/   # Admin routes (/admin, /admin/products, etc.)
│   │   │   ├── components/  # Shared UI components + AdminLayout
│   │   │   │   └── ui/      # shadcn/ui components
│   │   │   ├── services/    # API service layer (auth, products, orders)
│   │   │   └── lib/         # Utilities (cn helper)
│   │   ├── tests/
│   │   └── vite.config.ts   # Vite dev server (port 3000)
│   │
│   ├── mobile-flutter/     # Flutter mobile app
│   │   ├── lib/
│   │   │   ├── app/        # App configuration
│   │   │   ├── features/   # Feature modules
│   │   │   ├── shared/     # Shared widgets and utilities
│   │   │   └── core/       # Core services and configs
│   │   └── test/
│   │
│   └── mobile-rn/          # React Native mobile app
│       ├── src/
│       │   ├── screens/    # Screen components
│       │   ├── components/ # Reusable components
│       │   ├── hooks/      # Custom hooks
│       │   ├── navigation/ # Navigation configuration
│       │   ├── services/   # API services
│       │   └── types/      # TypeScript types
│       └── tests/
│
├── services/
│   ├── api-gateway/        # Go API gateway
│   │   ├── cmd/           # Entry points
│   │   ├── internal/      # Internal packages
│   │   ├── pkg/           # Public packages
│   │   └── go.mod
│   │
│   ├── auth-service/       # Python authentication service
│   │   ├── app/
│   │   │   ├── api/       # API endpoints
│   │   │   ├── core/      # Core logic
│   │   │   ├── models/    # Data models
│   │   │   └── services/  # Business logic
│   │   └── pyproject.toml
│   │
│   └── data-service/       # Rust high-performance data service
│       ├── src/
│       │   ├── handlers/  # Request handlers
│       │   ├── models/    # Data models
│       │   ├── services/  # Business logic
│       │   └── routes/    # Route definitions
│       └── Cargo.toml
│
├── packages/
│   ├── shared/             # Shared types and utilities
│   ├── ui/                 # Shared UI component library
│   └── config/             # Shared configuration
│
├── database/
│   ├── postgres/           # PostgreSQL schemas & migrations (full-stack)
│   │   ├── migrations/
│   │   ├── seeds/
│   │   └── schema.sql
│   └── mysql/              # MySQL schemas (PHP reference projects)
│       ├── land-houses/
│       ├── thiengtham/
│       ├── rent-miss-clean/
│       └── pos-legacy/
│
└── infra/                  # Infrastructure as Code
    ├── docker/
    ├── k8s/
    └── terraform/
```

## Technology Stack

### Frontend
- **Web Admin**: React 19+ TypeScript, TanStack Router, TanStack Query, TanStack Table, shadcn/ui
- **Web User**: TanStack Start (SSR), React 19+ TypeScript, TanStack Router, TanStack Query
- **Mobile**: Flutter 3.x (Dart) + React Native 0.76+ (TypeScript)

### Runtime & Package Manager
- **Bun 1.x+**: Primary JS/TS runtime, package manager, bundler, test runner
  - `bun install` — faster than npm/yarn/pnpm (10-100x)
  - `bun run` — execute scripts from package.json
  - `bun test` — built-in test runner (Jest-compatible)
  - `bun build` — bundler for browser/Node targets
  - `bunx` — execute packages (like npx)
  - `bun --watch` — hot reload dev server
  - Built-in TypeScript/JSX/TSX support (no transpile step)
  - Built-in SQLite, PostgreSQL, MySQL clients
  - Compatible with Node.js APIs (most `node:*` modules work)
  - Use `bunfig.toml` for config, `.env` loaded automatically

### Backend
- **API Gateway**: Go 1.22+ with Chi or Fiber
- **Auth Service**: Python 3.12+ with FastAPI
- **Data Service**: Rust with Axum or Actix-web

### Database
- **Full-Stack (React/Go/Python/Rust + Mobile)**: PostgreSQL 16+
- **Bun DB Clients**: `bun:postgresql`, `bun:mysql` built-in drivers
- **PHP Reference Projects (XAMPP)**: MySQL 8.0 (XAMPP local + InfinityFree hosting)
- **Cache**: Redis
- **Document Store**: MongoDB (optional)

### Infrastructure
- Docker, Kubernetes, Terraform
- Cloud: AWS/GCP/Azure

---

## Database Structure: PostgreSQL (Full-Stack)

> Used by: React Admin, TanStack Start, Flutter, React Native, Go API Gateway, Python Auth Service, Rust Data Service

### Connection

```
Host:     localhost (dev) / cloud-host (prod)
Port:     5432
Database: app_main
User:     app_user
Password: (env: DATABASE_URL)
```

### Core Schema

```sql
-- ============================================================
-- USERS & AUTH
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    phone           VARCHAR(20) UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(255) NOT NULL,
    avatar_url      TEXT,
    role            VARCHAR(20) NOT NULL DEFAULT 'user'
                    CHECK (role IN ('user', 'staff', 'admin', 'superadmin')),
    email_verified  BOOLEAN DEFAULT FALSE,
    is_active       BOOLEAN DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);

CREATE TABLE user_roles (
    id          BIGSERIAL PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role        VARCHAR(50) NOT NULL,
    granted_by  UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

CREATE TABLE user_sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash      VARCHAR(255) NOT NULL,
    device_info     JSONB,
    ip_address      INET,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(token_hash);

-- ============================================================
-- LISTINGS / PRODUCTS (Core business entity)
-- ============================================================

CREATE TABLE categories (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id       UUID REFERENCES categories(id) ON DELETE SET NULL,
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) UNIQUE NOT NULL,
    description     TEXT,
    image_url       TEXT,
    sort_order      INTEGER DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);

CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) UNIQUE NOT NULL,
    sku             VARCHAR(100) UNIQUE,
    barcode         VARCHAR(100),
    description     TEXT,
    cost_price      DECIMAL(12,2) DEFAULT 0,
    selling_price   DECIMAL(12,2) NOT NULL,
    compare_price   DECIMAL(12,2) DEFAULT 0,
    stock           INTEGER DEFAULT 0,
    min_stock       INTEGER DEFAULT 0,
    unit            VARCHAR(20) DEFAULT 'pcs',
    weight          DECIMAL(8,2),
    images          JSONB DEFAULT '[]',
    features        JSONB DEFAULT '{}',
    is_featured     BOOLEAN DEFAULT FALSE,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;

CREATE TABLE product_images (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url       TEXT NOT NULL,
    alt_text        VARCHAR(255),
    sort_order      INTEGER DEFAULT 0,
    is_primary      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_images_product ON product_images(product_id);

-- ============================================================
-- ORDERS & TRANSACTIONS
-- ============================================================

CREATE TABLE orders (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number        VARCHAR(50) UNIQUE NOT NULL,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status              VARCHAR(20) NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','confirmed','processing',
                                         'shipped','delivered','cancelled','refunded')),
    payment_status      VARCHAR(20) NOT NULL DEFAULT 'unpaid'
                        CHECK (payment_status IN ('unpaid','paid','partial','refunded','failed')),
    payment_method      VARCHAR(50),
    subtotal            DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount            DECIMAL(12,2) DEFAULT 0,
    tax_percent         DECIMAL(5,2) DEFAULT 0,
    tax_amount          DECIMAL(12,2) DEFAULT 0,
    shipping_fee        DECIMAL(12,2) DEFAULT 0,
    grand_total         DECIMAL(12,2) NOT NULL DEFAULT 0,
    currency            VARCHAR(3) DEFAULT 'LAK',
    shipping_address    JSONB,
    billing_address     JSONB,
    notes               TEXT,
    paid_at             TIMESTAMPTZ,
    shipped_at          TIMESTAMPTZ,
    delivered_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

CREATE TABLE order_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_name    VARCHAR(255) NOT NULL,
    quantity        INTEGER NOT NULL DEFAULT 1,
    unit_price      DECIMAL(12,2) NOT NULL,
    subtotal        DECIMAL(12,2) NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ============================================================
-- CART
-- ============================================================

CREATE TABLE cart_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id      VARCHAR(100),
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity        INTEGER NOT NULL DEFAULT 1,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT cart_owner CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE INDEX idx_cart_user ON cart_items(user_id);
CREATE INDEX idx_cart_session ON cart_items(session_id);

-- ============================================================
-- QUOTATIONS / B2B
-- ============================================================

CREATE TABLE quotations (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_number    VARCHAR(50) UNIQUE NOT NULL,
    user_id             UUID REFERENCES users(id) ON DELETE SET NULL,
    ref_no              VARCHAR(100),
    date                DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date         DATE,
    subtotal            DECIMAL(12,2) DEFAULT 0,
    discount            DECIMAL(12,2) DEFAULT 0,
    tax_percent         DECIMAL(5,2) DEFAULT 0,
    grand_total         DECIMAL(12,2) DEFAULT 0,
    status              VARCHAR(20) NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft','sent','approved','rejected','expired')),
    notes               TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE quotation_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id    UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_name    VARCHAR(255) NOT NULL,
    quantity        INTEGER NOT NULL DEFAULT 1,
    unit            VARCHAR(20) DEFAULT 'pcs',
    unit_price      DECIMAL(12,2) NOT NULL,
    amount          DECIMAL(12,2) NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quotation_items_quotation ON quotation_items(quotation_id);

CREATE TABLE quotation_history (
    id              BIGSERIAL PRIMARY KEY,
    quotation_id    UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    action          VARCHAR(100) NOT NULL,
    old_status      VARCHAR(20),
    new_status      VARCHAR(20),
    performed_by    UUID REFERENCES users(id) ON DELETE SET NULL,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INQUIRIES / MESSAGING
-- ============================================================

CREATE TABLE inquiries (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject             VARCHAR(255),
    status              VARCHAR(20) NOT NULL DEFAULT 'open'
                        CHECK (status IN ('open','in_progress','resolved','closed')),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inquiry_messages (
    id              BIGSERIAL PRIMARY KEY,
    inquiry_id      UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
    sender_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message         TEXT NOT NULL,
    is_read         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inquiry_messages_inquiry ON inquiry_messages(inquiry_id);

-- ============================================================
-- FAVORITES / WISHLIST
-- ============================================================

CREATE TABLE favorites (
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);

-- ============================================================
-- EXPENSES & FINANCE
-- ============================================================

CREATE TABLE expense_categories (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE expenses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id     UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    expense_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    amount          DECIMAL(12,2) NOT NULL,
    description     TEXT,
    receipt_url     TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_category ON expenses(category_id);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(50) NOT NULL,
    title           VARCHAR(255) NOT NULL,
    message         TEXT,
    data            JSONB DEFAULT '{}',
    is_read         BOOLEAN DEFAULT FALSE,
    read_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- ============================================================
-- AUDIT LOG
-- ============================================================

CREATE TABLE audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    action          VARCHAR(100) NOT NULL,
    target_table    VARCHAR(100),
    target_id       VARCHAR(100),
    old_values      JSONB,
    new_values      JSONB,
    ip_address      INET,
    user_agent      TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_target ON audit_logs(target_table, target_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- ============================================================
-- SYSTEM SETTINGS
-- ============================================================

CREATE TABLE system_settings (
    id              BIGSERIAL PRIMARY KEY,
    setting_key     VARCHAR(100) UNIQUE NOT NULL,
    setting_value   JSONB NOT NULL,
    description     TEXT,
    updated_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BANNERS & PROMOTIONS (E-commerce)
-- ============================================================

CREATE TABLE banners (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title           VARCHAR(255),
    subtitle        VARCHAR(255),
    image_url       TEXT NOT NULL,
    link            TEXT,
    sort_order      INTEGER DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    start_date      TIMESTAMPTZ,
    end_date        TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE promotions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    image_url       TEXT,
    link            TEXT,
    discount_type   VARCHAR(20) CHECK (discount_type IN ('percent','fixed')),
    discount_value  DECIMAL(12,2),
    min_purchase    DECIMAL(12,2) DEFAULT 0,
    max_uses        INTEGER,
    current_uses    INTEGER DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    start_date      TIMESTAMPTZ,
    end_date        TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('store_name', '"My Store"', 'Store display name'),
('store_phone', '"+856 20 00 000 000"', 'Store contact phone'),
('currency', '"LAK"', 'Default currency'),
('tax_percent', '7', 'Default tax rate'),
('store_logo', '""', 'Store logo URL');

INSERT INTO expense_categories (name, description) VALUES
('Rent', 'Monthly rent'),
('Utilities', 'Electricity, water, internet'),
('Supplies', 'Office and store supplies'),
('Marketing', 'Advertising and promotions'),
('Transport', 'Delivery and logistics');
```

### PostgreSQL ERD (Text)

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    users     │──1:N──│  user_roles  │       │  categories  │
│              │       └──────────────┘       │              │
│  id (UUID)   │──1:N──┌──────────────┐       │  id (UUID)   │
│  email       │       │   orders     │       │  parent_id   │──┐
│  phone       │       │              │       │  name        │  │
│  password    │       │  id (UUID)   │       │  slug        │  │
│  full_name   │       │  order_number│       └──────┬───────┘  │
│  role        │       │  user_id ────│──FK           │          │
│  avatar_url  │       │  status      │       ┌──────┘          │
│  is_active   │       │  grand_total │       │  (self-ref)     │
└──────┬───────┘       │  payment_*   │       ▼                 │
       │               └──────┬───────┘  ┌──────────────┐       │
       │                      │          │   products   │       │
       │               ┌──────┘          │              │       │
       │               ▼                 │  id (UUID)   │◄──────┘
       │       ┌──────────────┐          │  category_id │──FK
       │       │ order_items  │          │  name        │
       │       │              │          │  slug        │
       │       │  order_id    │──FK      │  sku         │
       │       │  product_id  │──FK      │  price       │
       │       │  quantity    │          │  stock       │
       │       └──────────────┘          │  images      │
       │                                 │  features    │
       │──1:N──┌──────────────┐          └──────┬───────┘
       │       │  favorites   │                 │
       │       │  user_id     │                 │──1:N──┌──────────────┐
       │       │  product_id  │──FK             │       │product_images│
       │       └──────────────┘                 │       └──────────────┘
       │                                        │
       │──1:N──┌──────────────┐          ┌─────┘
       │       │  inquiries   │          │
       │       └──────┬───────┘          │
       │              │                  │
       │       ┌──────┘                  │
       │       ▼                         │
       │  ┌──────────────┐        ┌──────┴───────┐
       │  │inquiry_msg   │        │  quotations  │
       │  │  inquiry_id  │        │              │
       │  │  sender_id   │        │  id (UUID)   │
       │  │  message     │        │  user_id     │──FK
       │  └──────────────┘        │  status      │
       │                          └──────┬───────┘
       │                                 │
       │──1:N──┌──────────────┐   ┌──────┘
       │       │notifications │   ▼
       │       │  user_id     │  ┌──────────────┐
       │       │  type        │  │quotation_item│
       │       │  is_read     │  │  quotation_id│──FK
       │       └──────────────┘  │  product_id  │──FK
       │                         └──────────────┘
       │──1:N──┌──────────────┐
       │       │ audit_logs   │
       │       │  user_id     │
       │       │  action      │
       │       │  old/new_val │
       │       └──────────────┘
       │
       │──1:N──┌──────────────┐       ┌──────────────┐
       │       │   expenses   │       │   banners    │
       │       │  user_id     │       │  title       │
       │       │  category_id │──FK   │  image_url   │
       │       │  amount      │       │  sort_order  │
       │       └──────────────┘       └──────────────┘
       │
       │       ┌──────────────┐       ┌──────────────┐
       │       │  cart_items  │       │ promotions   │
       │       │  user_id     │       │  title       │
       │       │  product_id  │──FK   │  discount_*  │
       │       │  quantity    │       │  start/end   │
       │       └──────────────┘       └──────────────┘
       │
       └───────┌──────────────┐
               │  user_sessions│
               │  user_id      │──FK
               │  token_hash   │
               │  expires_at   │
               └──────────────┘
```

---

## Database Structure: MySQL (PHP Reference Projects)

> Used by: Custom PHP MVC projects in `/Applications/XAMPP/xamppfiles/htdocs/`
> Connection: PDO Singleton via `app/Core/Database.php`
> Local: `localhost:3306` / root / `Admin123`
> Production: `sql*.infinityfree.com` / `if0_*` users

### Common PHP MVC Database Pattern

```php
// app/Core/Database.php — PDO Singleton (all modern PHP projects)
final class Database
{
    private static ?\PDO $pdo = null;

    public static function pdo(): \PDO
    {
        if (self::$pdo instanceof \PDO) {
            return self::$pdo;
        }
        $host = Env::get('DB_HOST', 'localhost');
        $port = Env::get('DB_PORT', '3306');
        $name = Env::get('DB_NAME', 'app_db');
        $user = Env::get('DB_USER', 'root');
        $pass = Env::get('DB_PASS', '');

        $dsn = "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";
        self::$pdo = new \PDO($dsn, $user, $pass, [
            \PDO::ATTR_ERRMODE            => \PDO::ERRMODE_EXCEPTION,
            \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
            \PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
        self::$pdo->exec("SET time_zone = '+07:00'");
        return self::$pdo;
    }
}
```

---

### Project: land-houses-dev (Real Estate Listing Platform)

**Database**: `if0_41833855_landhouse` | **Charset**: `utf8mb4_unicode_ci`

```sql
-- USER ACCOUNTS (UUID-based)
CREATE TABLE profiles (
    id              VARCHAR(36) PRIMARY KEY,  -- uuid_generate_v4()
    name            VARCHAR(255) NOT NULL,
    phone           VARCHAR(20) UNIQUE,
    email           VARCHAR(255) UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user','admin')),
    avatar_url      TEXT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     VARCHAR(36) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role        VARCHAR(50) NOT NULL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role)
);

-- LISTINGS (Land/House for sale/rent)
CREATE TABLE listings (
    id                  VARCHAR(36) PRIMARY KEY,
    user_id             VARCHAR(36) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title               VARCHAR(255) NOT NULL,
    title_en            VARCHAR(255),
    title_zh            VARCHAR(255),
    description         TEXT,
    description_en      TEXT,
    description_zh      TEXT,
    price               BIGINT NOT NULL,
    province            VARCHAR(100),
    province_en         VARCHAR(100),
    province_zh         VARCHAR(100),
    district            VARCHAR(100),
    district_en         VARCHAR(100),
    district_zh         VARCHAR(100),
    village             VARCHAR(100),
    village_en          VARCHAR(100),
    village_zh          VARCHAR(100),
    lat                 DECIMAL(10,7),
    lng                 DECIMAL(10,7),
    features            JSON,
    features_en         JSON,
    images              JSON,
    boundary            JSON,
    type                VARCHAR(10) NOT NULL CHECK (type IN ('sell','rent')),
    status              VARCHAR(20) DEFAULT 'active',
    property_category   ENUM('land','house','mixed') DEFAULT 'land',
    is_featured         BOOLEAN DEFAULT FALSE,
    deleted_at          DATETIME,
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE favorites (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     VARCHAR(36) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    listing_id  VARCHAR(36) NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, listing_id)
);

CREATE TABLE inquiries (
    id              VARCHAR(36) PRIMARY KEY,
    listing_id      VARCHAR(36) NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    sender_user_id  VARCHAR(36) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    recipient_user_id VARCHAR(36) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status          VARCHAR(20) DEFAULT 'open',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE inquiry_messages (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    inquiry_id      VARCHAR(36) NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
    sender_user_id  VARCHAR(36) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    message         TEXT NOT NULL,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     VARCHAR(36) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type        VARCHAR(50) NOT NULL,
    title       VARCHAR(255) NOT NULL,
    is_read     BOOLEAN DEFAULT FALSE,
    data        JSON,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reports (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    listing_id      VARCHAR(36) NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    reporter_user_id VARCHAR(36) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reason          TEXT NOT NULL,
    status          VARCHAR(20) DEFAULT 'pending',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     VARCHAR(36) REFERENCES profiles(id) ON DELETE SET NULL,
    action      VARCHAR(100) NOT NULL,
    target_table VARCHAR(100),
    target_id   VARCHAR(100),
    payload     JSON,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_settings (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    setting_key     VARCHAR(100) UNIQUE NOT NULL,
    setting_value   JSON NOT NULL,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

### Project: thiengtham-dev (POS + E-Commerce Platform)

**Database**: `if0_42353445_thiengtham` | **Charset**: `utf8mb4_unicode_ci`

```sql
-- USERS (INT auto-increment)
CREATE TABLE users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(100) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    full_name   VARCHAR(255) NOT NULL,
    role        ENUM('admin','staff') DEFAULT 'staff',
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- CATEGORIES
CREATE TABLE categories (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    slug        VARCHAR(255) UNIQUE NOT NULL,
    image       TEXT,
    sort_order  INT DEFAULT 0,
    status      ENUM('active','inactive') DEFAULT 'active',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PRODUCTS (shared between POS and e-commerce)
CREATE TABLE products (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) UNIQUE NOT NULL,
    sku             VARCHAR(100) UNIQUE,
    barcode         VARCHAR(100),
    category_id     INT REFERENCES categories(id) ON DELETE SET NULL,
    cost_price      DECIMAL(15,2) DEFAULT 0,
    selling_price   DECIMAL(15,2) NOT NULL,
    compare_price   DECIMAL(15,2) DEFAULT 0,
    stock           INT DEFAULT 0,
    min_stock       INT DEFAULT 0,
    unit            VARCHAR(20) DEFAULT 'pcs',
    featured        BOOLEAN DEFAULT FALSE,
    status          ENUM('active','inactive') DEFAULT 'active',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE product_images (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    product_id  INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image       TEXT NOT NULL,
    sort_order  INT DEFAULT 0,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CUSTOMERS
CREATE TABLE customers (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    fullname    VARCHAR(255) NOT NULL,
    phone       VARCHAR(20),
    email       VARCHAR(255),
    password    VARCHAR(255),       -- for e-commerce login
    address     TEXT,
    province    VARCHAR(100),
    district    VARCHAR(100),
    village     VARCHAR(100),
    latitude    DECIMAL(10,7),
    longitude   DECIMAL(10,7),
    status      ENUM('active','inactive') DEFAULT 'active',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE customer_addresses (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    customer_id     INT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    label           VARCHAR(50),
    recipient_name  VARCHAR(255),
    phone           VARCHAR(20),
    address         TEXT NOT NULL,
    is_default      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bid_customers (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    contact_person  VARCHAR(255),
    phone           VARCHAR(20),
    tax_percent     DECIMAL(5,2) DEFAULT 0,
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- POS SALES
CREATE TABLE sales (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number      VARCHAR(50) UNIQUE NOT NULL,
    customer_id         INT REFERENCES customers(id) ON DELETE SET NULL,
    bid_customer_id     INT REFERENCES bid_customers(id) ON DELETE SET NULL,
    subtotal            DECIMAL(15,2) NOT NULL DEFAULT 0,
    discount            DECIMAL(15,2) DEFAULT 0,
    tax_percent         DECIMAL(5,2) DEFAULT 0,
    grand_total         DECIMAL(15,2) NOT NULL DEFAULT 0,
    payment_method      VARCHAR(50),
    status              ENUM('Completed','Refunded','Cancelled') DEFAULT 'Completed',
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE sale_items (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    sale_id     INT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id  INT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_name VARCHAR(255) NOT NULL,
    quantity    INT NOT NULL DEFAULT 1,
    unit_price  DECIMAL(15,2) NOT NULL,
    subtotal    DECIMAL(15,2) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- E-COMMERCE ORDERS
CREATE TABLE orders (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    order_number        VARCHAR(50) UNIQUE NOT NULL,
    customer_id         INT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    shipping_address    TEXT,
    shipping_province   VARCHAR(100),
    shipping_district   VARCHAR(100),
    shipping_village    VARCHAR(100),
    shipping_fee        DECIMAL(15,2) DEFAULT 0,
    grand_total         DECIMAL(15,2) NOT NULL DEFAULT 0,
    payment_status      ENUM('Pending','Paid','Failed','Refunded') DEFAULT 'Pending',
    order_status        ENUM('Pending','Confirmed','Processing','Shipped','Delivered','Cancelled') DEFAULT 'Pending',
    notes               TEXT,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    order_id    INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id  INT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_name VARCHAR(255) NOT NULL,
    quantity    INT NOT NULL DEFAULT 1,
    unit_price  DECIMAL(15,2) NOT NULL,
    subtotal    DECIMAL(15,2) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cart_items (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    session_id  VARCHAR(100),
    customer_id INT REFERENCES customers(id) ON DELETE CASCADE,
    product_id  INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity    INT NOT NULL DEFAULT 1,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- QUOTATIONS
CREATE TABLE quotations (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    quotation_number    VARCHAR(50) UNIQUE NOT NULL,
    company_template    TEXT,
    bid_customer_id     INT REFERENCES bid_customers(id) ON DELETE SET NULL,
    customer_id         INT REFERENCES customers(id) ON DELETE SET NULL,
    ref_no              VARCHAR(100),
    date                DATE NOT NULL,
    expiry_date         DATE,
    subtotal            DECIMAL(15,2) DEFAULT 0,
    discount            DECIMAL(15,2) DEFAULT 0,
    tax_percent         DECIMAL(5,2) DEFAULT 0,
    grand_total         DECIMAL(15,2) DEFAULT 0,
    status              ENUM('Draft','Sent','Approved','Rejected') DEFAULT 'Draft',
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE quotation_items (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    quotation_id    INT NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    product_id      INT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_name    VARCHAR(255) NOT NULL,
    quantity        INT NOT NULL DEFAULT 1,
    unit            VARCHAR(20) DEFAULT 'pcs',
    unit_price      DECIMAL(15,2) NOT NULL,
    amount          DECIMAL(15,2) NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quotation_history (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    quotation_id    INT NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    action          VARCHAR(100) NOT NULL,
    old_status      VARCHAR(20),
    new_status      VARCHAR(20),
    performed_by    INT REFERENCES users(id) ON DELETE SET NULL,
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- EXPENSES
CREATE TABLE expense_categories (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE expenses (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    category_id     INT REFERENCES expense_categories(id) ON DELETE SET NULL,
    user_id         INT REFERENCES users(id) ON DELETE SET NULL,
    expense_date    DATE NOT NULL DEFAULT (CURRENT_DATE),
    amount          DECIMAL(15,2) NOT NULL,
    description     TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CONFIG
CREATE TABLE payment_methods (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    details     TEXT,
    is_active   BOOLEAN DEFAULT TRUE
);

CREATE TABLE settings (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    setting_key     VARCHAR(100) UNIQUE NOT NULL,
    setting_value   TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- E-COMMERCE EXTRAS
CREATE TABLE banners (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(255),
    subtitle    VARCHAR(255),
    image       TEXT NOT NULL,
    link        TEXT,
    sort_order  INT DEFAULT 0,
    status      ENUM('active','inactive') DEFAULT 'active',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE promotions (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    image       TEXT,
    link        TEXT,
    sort_order  INT DEFAULT 0,
    status      ENUM('active','inactive') DEFAULT 'active',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### Project: rent-miss-clean-dev (Rental POS System)

**Database**: `if0_41710498_rent` | **Charset**: `utf8mb4_general_ci`

```sql
CREATE TABLE users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(100) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,  -- bcrypt
    full_name   VARCHAR(255) NOT NULL,
    role        ENUM('admin','staff') DEFAULT 'staff',
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    fullname        VARCHAR(255) NOT NULL,
    phone           VARCHAR(20),
    id_card_no      VARCHAR(50),
    gender          ENUM('Male','Female','Other'),
    customer_type   VARCHAR(100),
    status          ENUM('Active','Inactive','Blacklisted') DEFAULT 'Active',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customer_types (
    id   INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE categories (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT
);

CREATE TABLE products (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(50) UNIQUE NOT NULL,
    name            VARCHAR(255) NOT NULL,
    category_id     INT REFERENCES categories(id) ON DELETE SET NULL,
    size            VARCHAR(50),
    color           VARCHAR(50),
    rental_price    DECIMAL(15,2) NOT NULL,
    stock           INT DEFAULT 0,
    status          ENUM('Available','Rented','Cleaning','Repairing','Inactive') DEFAULT 'Available',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rentals (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number      VARCHAR(50) UNIQUE NOT NULL,
    customer_id         INT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    pickup_date         DATE NOT NULL,
    return_date         DATE,
    total_rental_fee    DECIMAL(15,2) DEFAULT 0,
    total_deposit       DECIMAL(15,2) DEFAULT 0,
    discount            DECIMAL(15,2) DEFAULT 0,
    grand_total         DECIMAL(15,2) DEFAULT 0,
    paid_amount         DECIMAL(15,2) DEFAULT 0,
    payment_status      VARCHAR(20) DEFAULT 'Unpaid',
    status              ENUM('Pending','Active','Returned','Overdue','Cancelled') DEFAULT 'Pending',
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rental_items (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    rental_id   INT NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
    product_id  INT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    rental_price DECIMAL(15,2) NOT NULL,
    qty         INT NOT NULL DEFAULT 1,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE expenses (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    expense_date    DATE NOT NULL DEFAULT (CURRENT_DATE),
    category_id     INT,
    amount          DECIMAL(15,2) NOT NULL,
    description     TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE expense_categories (
    id   INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE payment_methods (
    id   INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE settings (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    store_name      VARCHAR(255),
    store_phone     VARCHAR(50),
    store_logo      TEXT,
    currency        VARCHAR(10) DEFAULT 'LAK',
    tax_percent     DECIMAL(5,2) DEFAULT 0,
    paper_size      VARCHAR(20) DEFAULT 'A4',
    rental_terms    TEXT,
    receipt_footer  TEXT,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

### Project: pos-miss-clean (Legacy CodeIgniter POS)

**Databases**: `if0_41710498_phonhong` / `if0_41710498_viengchalern`
**Charset**: `utf8_general_ci` | **Framework**: CodeIgniter 3

> Key tables: `owner`, `user_owner`, `wh_product_list`, `sale_list_header/detail`,
> `purchase_buy_header/detail`, `customer_center`, `stock`, `employee_list`,
> `quotation_list_header/detail`, `barcode_ds`, `branch`, `pawn`

> Legacy pattern: No foreign keys, `adddate varchar(255)` instead of timestamps,
> `pic/` local file storage, InfinityFree hosting

---

## Key Patterns Comparison

| Pattern | PostgreSQL (Full-Stack) | MySQL (PHP Projects) |
|---|---|---|
| **ID Strategy** | UUID (`uuid_generate_v4()`) | UUID (land-houses) / INT AUTO_INCREMENT (others) |
| **Timestamps** | `TIMESTAMPTZ DEFAULT NOW()` | `DATETIME DEFAULT CURRENT_TIMESTAMP` / `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` |
| **Soft Delete** | `deleted_at TIMESTAMPTZ` | `deleted_at DATETIME` (land-houses only) |
| **JSON Columns** | `JSONB` (indexed) | `JSON` |
| **Enum Check** | `CHECK (col IN (...))` | `ENUM('...')` |
| **FK Constraints** | All tables with `ON DELETE CASCADE/SET NULL` | Modern: yes / Legacy: none |
| **Timezone** | UTC (server converts) | `+07:00` (Indochina) set in connection |
| **Encoding** | UTF-8 (native) | `utf8mb4_unicode_ci` |
| **Pagination** | `LIMIT/OFFSET` or cursor | `LIMIT/OFFSET` |

---

## Code Standards

### TypeScript/React
- Use TypeScript strict mode
- Prefer functional components with hooks
- Use TanStack Query for server state management
- Use TanStack Router for navigation with file-based routing
- Follow React 19 patterns (Server Components where applicable)
- Use Zod for runtime validation and type inference

### Go
- Follow effective Go patterns
- Use context for request-scoped values
- Implement proper error handling with error wrapping
- Use interfaces for abstraction

### Python
- Use type hints everywhere
- Follow PEP 8 and PEP 484
- Use async/await for I/O-bound operations
- Prefer FastAPI dependency injection

### Rust
- Use rustfmt for formatting
- Follow Rust API guidelines
- Use Result<T, E> for error handling
- Prefer iterators and combinators

### Flutter/Dart
- Follow Dart style guide
- Use null safety
- Implement proper state management (Riverpod/Bloc)
- Write widget tests

### PHP (Custom MVC)
- Use PDO Singleton via `Database::pdo()`
- UUID for public-facing tables, INT for internal
- Always use prepared statements
- bcrypt for password hashing (`password_hash()`)
- Environment-based config (`.env` / `.env.production`)
- Tailwind CSS + Alpine.js for frontend
- PWA support where applicable

---

## Commands

### Web (User + Admin)
```bash
cd apps/web
bun run dev          # Start dev server (port 3000)
bun run build        # Build for production
bun test             # Run tests
bun run lint         # Run linter
bun run typecheck    # Type check
```

- User routes: `/`, `/products`, `/cart`, `/login`
- Admin routes: `/admin`, `/admin/products`, `/admin/orders`, `/admin/customers`, `/admin/settings`
- Admin login: `/admin/login` (admin@template.com / admin123)
```

### Mobile Flutter
```bash
cd apps/mobile-flutter
flutter run        # Run on connected device
flutter test       # Run tests
flutter analyze    # Analyze code
dart format .      # Format code
```

### Mobile React Native
```bash
cd apps/mobile-rn
bun start           # Start Metro bundler
bun run android     # Run on Android
bun run ios         # Run on iOS
bun test            # Run tests
```

### Backend Services
```bash
# Go API Gateway
cd services/api-gateway
go run ./cmd/...    # Run service
go test ./...       # Run tests
go vet ./...        # Vet code

# Python Auth Service
cd services/auth-service
poetry run uvicorn app.main:app --reload
poetry run pytest

# Rust Data Service
cd services/data-service
cargo run           # Run service
cargo test          # Run tests
cargo clippy        # Lint
```

### Database
```bash
# PostgreSQL (full-stack)
psql -U app_user -d app_main -f database/schema.sql

# MySQL (PHP projects - XAMPP)
/Applications/XAMPP/xamppfiles/bin/mysql -u root -p < database/mysql/land-houses/schema.sql
```

---

## PHP Reference Projects (XAMPP Location)

| Project | Path | Purpose | DB Name | Pattern |
|---|---|---|---|---|
| **land-houses-dev** | `/htdocs/land-houses-dev/` | Real estate listing (Laos) | `if0_41833855_landhouse` | Custom MVC, UUID PKs, JSON, i18n |
| **thiengtham-dev** | `/htdocs/thiengtham-dev/` | POS + E-commerce | `if0_42353445_thiengtham` | Custom MVC, INT PKs, full POS+ecom |
| **rent-miss-clean-dev** | `/htdocs/pos-miss-clean/rent-miss-clean-dev/` | Rental POS | `if0_41710498_rent` | Custom MVC, INT PKs, rental workflow |
| **phonhong-dev** | `/htdocs/pos-miss-clean/phonhong-dev/` | POS (CodeIgniter) | `if0_41710498_phonhong` | CodeIgniter 3, 80+ tables, legacy |
| **viengchalern-dev** | `/htdocs/pos-miss-clean/viengchalern-dev/` | POS (CodeIgniter) | `if0_41710498_viengchalern` | CodeIgniter 3, 80+ tables, legacy |
| **buddhaword** | `/htdocs/buddhaword/` | Buddhist scripture search | MySQL + SQLite | Custom MVC, Google Sheets API |
| **logistics** | `/htdocs/logistics/` | Shipping cost estimator | None | React SPA + Express.js |

---

## Conventions

- Use conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`
- Create feature branches from `main`
- Require PR reviews before merging
- Write tests for new features
- Update documentation for API changes
- Use environment variables for configuration
- Never commit secrets or API keys
- PostgreSQL for new full-stack features, MySQL preserved for PHP legacy
- UUID primary keys for all new PostgreSQL tables
- Always use transactions for multi-table operations
- Add indexes for frequently queried columns
