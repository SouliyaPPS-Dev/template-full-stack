---
name: mysql-database
description: MySQL database design, migrations, and query optimization. Creates schemas, relationships, indexes, and seed data. Use when designing databases, writing SQL, optimizing queries, or managing migrations. Triggers on: mysql, database, schema, migration, sql, query, table.
---

# MySQL Database - Schema & Query Manager

Complete MySQL database management with your patterns.

## Connection (Your PDO Pattern)

```php
<?php
final class Database
{
    private static ?\PDO $pdo = null;

    public static function pdo(): \PDO
    {
        if (self::$pdo instanceof \PDO) {
            return self::$pdo;
        }

        $dsn = "mysql:host={$_ENV['DB_HOST']};port={$_ENV['DB_PORT']};dbname={$_ENV['DB_NAME']};charset=utf8mb4";

        self::$pdo = new \PDO($dsn, $_ENV['DB_USER'], $_ENV['DB_PASS'], [
            \PDO::ATTR_ERRMODE            => \PDO::ERRMODE_EXCEPTION,
            \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
        ]);

        return self::$pdo;
    }
}
```

## Schema Patterns

### Users Table

```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fullname VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar VARCHAR(500),
    role ENUM('admin', 'user') DEFAULT 'user',
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    email_verified_at TIMESTAMP NULL,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Products Table

```sql
CREATE TABLE products (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    stock INT DEFAULT 0,
    images JSON,
    category_id VARCHAR(36),
    status ENUM('active', 'inactive', 'draft') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_slug (slug),
    INDEX idx_category (category_id),
    INDEX idx_status (status),
    INDEX idx_price (price),
    FULLTEXT INDEX idx_search (name, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Orders Table (Transaction Pattern)

```sql
CREATE TABLE orders (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid',
    payment_method VARCHAR(50),
    shipping_address JSON,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_payment (payment_status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Order Items (Multi-Table Transaction)

```sql
CREATE TABLE order_items (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_order (order_id),
    INDEX idx_product (product_id),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Query Patterns

### Named Parameters (Your Style)

```php
<?php
$stmt = $pdo->prepare("
    SELECT * FROM products 
    WHERE status = :status 
    AND category_id = :category
    AND price BETWEEN :min_price AND :max_price
");

$stmt->execute([
    ':status'    => 'active',
    ':category'  => $categoryId,
    ':min_price' => $minPrice,
    ':max_price' => $maxPrice
]);

$products = $stmt->fetchAll();
```

### Dynamic WHERE Clause

```php
<?php
$where = 'WHERE 1=1';
$params = [];

if (!empty($search)) {
    $where .= " AND (name LIKE :search OR description LIKE :search)";
    $params[':search'] = "%{$search}%";
}

if (!empty($status)) {
    $where .= " AND status = :status";
    $params[':status'] = $status;
}

if (!empty($category)) {
    $where .= " AND category_id = :category";
    $params[':category'] = $category;
}

$stmt = $pdo->prepare("SELECT * FROM products {$where} ORDER BY created_at DESC");
$stmt->execute($params);
$products = $stmt->fetchAll();
```

### Pagination

```php
<?php
$page = max(1, (int)($_GET['page'] ?? 1));
$perPage = 20;
$offset = ($page - 1) * $perPage;

// Get total count
$countStmt = $pdo->query("SELECT COUNT(*) FROM products WHERE status = 'active'");
$total = $countStmt->fetchColumn();
$totalPages = ceil($total / $perPage);

// Get paginated results
$stmt = $pdo->prepare("
    SELECT * FROM products 
    WHERE status = 'active'
    ORDER BY created_at DESC 
    LIMIT :limit OFFSET :offset
");
$stmt->bindValue(':limit', $perPage, \PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
$stmt->execute();
$products = $stmt->fetchAll();
```

### Transaction (Your Pattern)

```php
<?php
$pdo->beginTransaction();

try {
    // 1. Create order
    $orderId = 'ord-' . bin2hex(random_bytes(16));
    $stmt = $pdo->prepare("
        INSERT INTO orders (id, user_id, total, status, created_at)
        VALUES (?, ?, ?, 'pending', NOW())
    ");
    $stmt->execute([$orderId, $userId, $total]);

    // 2. Insert items
    $stmt = $pdo->prepare("
        INSERT INTO order_items (id, order_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?, ?)
    ");
    foreach ($items as $item) {
        $itemId = 'item-' . bin2hex(random_bytes(16));
        $stmt->execute([$itemId, $orderId, $item['product_id'], $item['quantity'], $item['price']]);
    }

    // 3. Update stock
    foreach ($items as $item) {
        $stmt = $pdo->prepare("
            UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?
        ");
        $stmt->execute([$item['quantity'], $item['product_id'], $item['quantity']]);
        
        if ($stmt->rowCount() === 0) {
            throw new \Exception("Insufficient stock for product: {$item['product_id']}");
        }
    }

    $pdo->commit();
    return ['success' => true, 'order_id' => $orderId];

} catch (\Exception $e) {
    $pdo->rollBack();
    throw $e;
}
```

### JSON Column Operations

```php
<?php
// Store JSON
$stmt = $pdo->prepare("
    UPDATE products SET images = ? WHERE id = ?
");
$stmt->execute([json_encode($imageUrls), $productId]);

// Query JSON
$stmt = $pdo->prepare("
    SELECT * FROM products 
    WHERE JSON_CONTAINS(images, ?)
");
$stmt->execute([json_encode($imageUrl)]);

// Decode at runtime
$product = $stmt->fetch();
$images = json_decode($product['images'], true);
```

### Aggregate Queries

```php
<?php
// Count by category
$stmt = $pdo->query("
    SELECT category_id, COUNT(*) as count 
    FROM products 
    WHERE status = 'active'
    GROUP BY category_id
");
$categoryCounts = $stmt->fetchAll(\PDO::FETCH_KEY_PAIR);

// Price statistics
$stmt = $pdo->query("
    SELECT 
        MIN(price) as min_price,
        MAX(price) as max_price,
        AVG(price) as avg_price,
        COUNT(*) as total
    FROM products 
    WHERE status = 'active'
");
$stats = $stmt->fetch();
```

## Migration Pattern

```php
<?php
// database/migrate.php

$migrations = [
    '001_create_users' => "
        CREATE TABLE users (
            id VARCHAR(36) PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ",
    '002_create_products' => "
        CREATE TABLE products (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ",
];

$pdo = Database::pdo();

foreach ($migrations as $name => $sql) {
    $check = $pdo->query("SELECT COUNT(*) FROM migrations WHERE name = '{$name}'")->fetchColumn();
    
    if ($check == 0) {
        $pdo->exec($sql);
        $pdo->exec("INSERT INTO migrations (name, created_at) VALUES ('{$name}', NOW())");
        echo "✓ Migrated: {$name}\n";
    }
}
```

## Seed Pattern

```php
<?php
<?php
// database/seed.php

$users = [
    ['id' => 'usr-' . bin2hex(random_bytes(16)), 'email' => 'admin@example.com', 'fullname' => 'Admin'],
    ['id' => 'usr-' . bin2hex(random_bytes(16)), 'email' => 'user@example.com', 'fullname' => 'User'],
];

$pdo = Database::pdo();

$stmt = $pdo->prepare("
    INSERT INTO users (id, email, fullname, password, created_at)
    VALUES (?, ?, ?, ?, NOW())
");

foreach ($users as $user) {
    $stmt->execute([
        $user['id'],
        $user['email'],
        $user['fullname'],
        password_hash('password', PASSWORD_DEFAULT)
    ]);
}

echo "✓ Seeded " . count($users) . " users\n";
```

## Commands

```
/mysql-database init           # Initialize database schema
/mysql-database migrate        # Run migrations
/mysql-database seed           # Seed database
/mysql-database backup         # Create backup
/mysql-database optimize       # Optimize tables
/mysql-database query <sql>    # Execute query
/mysql-database explain <sql>  # Explain query plan
```

## Integration

- **php-backend**: Uses these patterns in controllers/models
- **full-stack-flow**: Database design for full-stack apps
- **self-improve**: Learn from your query patterns
- **function-memory**: Cache query results

## Notes

- Always use transactions for multi-table operations
- Use VARCHAR(36) for IDs (UUID/ULID style)
- Use JSON columns for flexible data
- Add indexes for frequently queried columns
- Use FULLTEXT for search functionality
- Follow your naming conventions (snake_case)
