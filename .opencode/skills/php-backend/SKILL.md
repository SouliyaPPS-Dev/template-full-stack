---
name: php-backend
description: PHP backend development using custom MVC patterns learned from your existing projects. Creates controllers, models, routes, and API endpoints matching your coding style. Use when building PHP backends, APIs, or server-side applications. Triggers on: php, backend, api, controller, model, mvc.
---

# PHP Backend - Custom MVC Framework

PHP backend development matching your existing code patterns from htdocs.

## Learned Patterns

From scanning your projects (land-houses-dev, thiengtham-dev, buddhaword, etc.):

### Directory Structure

```
project/
├── index.php                 # Entry point
├── .env                      # Environment config
├── routes/
│   └── web.php              # Route definitions
├── app/
│   ├── Core/
│   │   ├── Router.php       # URL dispatcher
│   │   ├── Database.php     # PDO singleton
│   │   └── Env.php          # Environment loader
│   ├── Controllers/
│   │   ├── BaseController.php
│   │   └── *Controller.php
│   ├── Models/
│   │   └── *Model.php
│   ├── Services/
│   │   └── *Service.php
│   └── Helpers/
│       └── view.php         # view(), url(), asset()
├── views/
│   ├── layouts/
│   │   └── main.php
│   ├── pages/
│   └── components/
└── public/
    └── index.php            # Front controller
```

### Database Connection (Your Style)

```php
<?php
declare(strict_types=1);

namespace App\Core;

final class Database
{
    private static ?\PDO $pdo = null;

    public static function pdo(): \PDO
    {
        if (self::$pdo instanceof \PDO) {
            return self::$pdo;
        }

        $host = Env::get('DB_HOST', 'localhost');
        $name = Env::get('DB_NAME', 'my_database');
        $user = Env::get('DB_USER', 'root');
        $pass = Env::get('DB_PASS', '');
        $port = Env::get('DB_PORT', '3306');

        $dsn = "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";

        self::$pdo = new \PDO($dsn, $user, $pass, [
            \PDO::ATTR_ERRMODE            => \PDO::ERRMODE_EXCEPTION,
            \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
        ]);

        return self::$pdo;
    }
}
```

### Router (Your Method-Chain Style)

```php
<?php
// routes/web.php

$router->get('/', 'HomeController@index');
$router->get('/products', 'ProductController@index');
$router->get('/products/{slug}', 'ProductController@show');
$router->post('/products', 'ProductController@store');
$router->put('/products/{id}', 'ProductController@update');
$router->delete('/products/{id}', 'ProductController@destroy');

// API routes
$router->post('/api/chat', 'ApiController@chat');
$router->get('/api/search', 'ApiController@search');
```

### Controller Pattern

```php
<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Database;

class ProductController extends BaseController
{
    public function index(): void
    {
        $pdo = Database::pdo();
        $products = $pdo->query("SELECT * FROM products ORDER BY created_at DESC")->fetchAll();

        view('pages.products.index', compact('products'));
    }

    public function show(string $slug): void
    {
        $pdo = Database::pdo();
        $stmt = $pdo->prepare("SELECT * FROM products WHERE slug = ?");
        $stmt->execute([$slug]);
        $product = $stmt->fetch();

        if (!$product) {
            http_response_code(404);
            view('pages.errors.404');
            return;
        }

        view('pages.products.show', compact('product'));
    }

    public function store(): void
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);

        // Validate
        $errors = [];
        if (empty($input['name'])) $errors[] = 'Name is required';
        if (empty($input['price'])) $errors[] = 'Price is required';

        if (!empty($errors)) {
            http_response_code(422);
            echo json_encode(['errors' => $errors]);
            return;
        }

        $pdo = Database::pdo();
        $id = 'prod-' . bin2hex(random_bytes(16));

        $stmt = $pdo->prepare("
            INSERT INTO products (id, name, slug, price, description, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())
        ");

        $stmt->execute([
            $id,
            $input['name'],
            $this->slugify($input['name']),
            $input['price'],
            $input['description'] ?? ''
        ]);

        header('Content-Type: application/json');
        http_response_code(201);
        echo json_encode(['success' => true, 'id' => $id]);
    }

    private function slugify(string $text): string
    {
        $text = strtolower(trim($text));
        $text = preg_replace('/[^a-z0-9-]/', '-', $text);
        $text = preg_replace('/-+/', '-', $text);
        return trim($text, '-');
    }
}
```

### Model Pattern (Static Methods - Your Style)

```php
<?php
declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

final class Product
{
    public static function all(): array
    {
        return Database::pdo()
            ->query("SELECT * FROM products ORDER BY created_at DESC")
            ->fetchAll();
    }

    public static function find(string $id): ?array
    {
        $stmt = Database::pdo()->prepare("SELECT * FROM products WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public static function findBySlug(string $slug): ?array
    {
        $stmt = Database::pdo()->prepare("SELECT * FROM products WHERE slug = ?");
        $stmt->execute([$slug]);
        return $stmt->fetch() ?: null;
    }

    public static function create(array $data): string
    {
        $id = 'prod-' . bin2hex(random_bytes(16));

        $stmt = Database::pdo()->prepare("
            INSERT INTO products (id, name, slug, price, description, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())
        ");

        $stmt->execute([
            $id,
            $data['name'],
            self::slugify($data['name']),
            $data['price'],
            $data['description'] ?? ''
        ]);

        return $id;
    }

    public static function update(string $id, array $data): bool
    {
        $fields = [];
        $values = [];

        foreach ($data as $key => $value) {
            $fields[] = "{$key} = ?";
            $values[] = $value;
        }
        $values[] = $id;

        $stmt = Database::pdo()->prepare("
            UPDATE products SET " . implode(', ', $fields) . " WHERE id = ?
        ");

        return $stmt->execute($values);
    }

    public static function delete(string $id): bool
    {
        $stmt = Database::pdo()->prepare("DELETE FROM products WHERE id = ?");
        return $stmt->execute([$id]);
    }

    public static function search(string $query): array
    {
        $stmt = Database::pdo()->prepare("
            SELECT * FROM products 
            WHERE name LIKE ? OR description LIKE ?
            ORDER BY created_at DESC
        ");
        $stmt->execute(["%{$query}%", "%{$query}%"]);
        return $stmt->fetchAll();
    }

    private static function slugify(string $text): string
    {
        $text = strtolower(trim($text));
        $text = preg_replace('/[^a-z0-9-]/', '-', $text);
        $text = preg_replace('/-+/', '-', $text);
        return trim($text, '-');
    }
}
```

### API Pattern (Your JSON Style)

```php
<?php
declare(strict_types=1);

namespace App\Controllers;

class ApiController extends BaseController
{
    public function chat(): void
    {
        header('Content-Type: application/json');

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $message = $input['message'] ?? '';

        // Your AI model fallback chain pattern
        $models = ['deepseek-v4-flash-free', 'big-pickle', 'glm-5-free'];
        
        foreach ($models as $model) {
            $result = $this->callAI($model, $message);
            if ($result !== null) {
                echo json_encode(['success' => true, 'data' => $result]);
                return;
            }
        }

        http_response_code(500);
        echo json_encode(['error' => 'All AI models failed']);
    }

    private function callAI(string $model, string $message): ?array
    {
        // Implementation depends on your AI provider
        return null;
    }
}
```

### Transaction Pattern (Your Style)

```php
<?php
// From rent-miss-clean-dev pattern

public function checkout(array $data): array
{
    $pdo = Database::pdo();
    $pdo->beginTransaction();

    try {
        // 1. Create rental record
        $rentalId = 'rnt-' . bin2hex(random_bytes(16));
        $stmt = $pdo->prepare("
            INSERT INTO rentals (id, customer_id, total, status, created_at)
            VALUES (?, ?, ?, 'pending', NOW())
        ");
        $stmt->execute([$rentalId, $data['customer_id'], $data['total']]);

        // 2. Insert rental items
        $stmt = $pdo->prepare("
            INSERT INTO rental_items (rental_id, product_id, quantity, price)
            VALUES (?, ?, ?, ?)
        ");
        foreach ($data['items'] as $item) {
            $stmt->execute([$rentalId, $item['product_id'], $item['quantity'], $item['price']]);
        }

        // 3. Update stock
        foreach ($data['items'] as $item) {
            $stmt = $pdo->prepare("
                UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?
            ");
            $stmt->execute([$item['quantity'], $item['product_id'], $item['quantity']]);
        }

        $pdo->commit();
        return ['success' => true, 'rental_id' => $rentalId];

    } catch (\Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
}
```

### View Helper (Your Style)

```php
<?php
// app/Helpers/view.php

function view(string $path, array $data = []): void
{
    extract($data);
    ob_start();
    require __DIR__ . "/../../views/" . str_replace('.', '/', $path) . ".php";
    $content = ob_get_clean();
    require __DIR__ . "/../../views/layouts/main.php";
}

function url(string $path = ''): string
{
    $base = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/');
    return $base . $path;
}

function asset(string $path): string
{
    return url('/assets/' . ltrim($path, '/'));
}

function e(mixed $value): string
{
    return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
}
```

## Commands

```
/php-backend init <project>     # Initialize new PHP project
/php-backend controller <name> # Create controller
/php-backend model <name>      # Create model
/php-backend route <path>      # Add route
/php-backend api <endpoint>    # Create API endpoint
/php-backend migrate           # Run migrations
/php-backend seed              # Seed database
```

## Integration

- **mysql-database**: Database design and queries
- **full-stack-flow**: Connect with frontend and mobile
- **self-improve**: Learn from your existing patterns
- **function-memory**: Cache API responses

## Notes

- Uses your custom MVC pattern (not Laravel/CI)
- PDO with MySQL (your standard)
- Tailwind + Alpine.js for frontend
- Session-based authentication
- JSON API endpoints
