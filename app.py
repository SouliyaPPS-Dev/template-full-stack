import json, os, uuid, sqlite3, time, base64
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import Any

import gradio as gr
import spaces
from starlette.middleware import Middleware
from starlette.types import ASGIApp, Scope, Receive, Send
from fastapi import FastAPI, HTTPException, Request, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.responses import Response
import bcrypt
from jose import jwt
from pydantic import BaseModel

# ── Config ──
DB_PATH = "/data/app.db"
JWT_SECRET = os.environ.get("JWT_SECRET", "super-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
IMAGEKIT_PRIVATE_KEY = os.environ.get("IMAGEKIT_PRIVATE_KEY", "")
IMAGEKIT_URL_ENDPOINT = os.environ.get("IMAGEKIT_URL_ENDPOINT", "https://ik.imagekit.io/ceo2gbv21")
JWT_EXPIRE_HOURS = 24 * 365 * 10
dist = Path("dist")

# ── Database ──
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn

def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL, phone TEXT DEFAULT '', avatar_url TEXT DEFAULT '', role TEXT DEFAULT 'user',
            is_active INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
            sku TEXT DEFAULT '', category_id TEXT DEFAULT '', description TEXT DEFAULT '',
            selling_price REAL DEFAULT 0, cost_price REAL DEFAULT 0, compare_price REAL DEFAULT 0,
            stock INTEGER DEFAULT 0, images TEXT DEFAULT '[]', is_featured INTEGER DEFAULT 0,
            is_active INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now')), deleted_at TEXT
        );
        CREATE TABLE IF NOT EXISTS categories (
            id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
            description TEXT DEFAULT '', image_url TEXT DEFAULT '', sort_order INTEGER DEFAULT 0,
            is_active INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY, order_number TEXT UNIQUE NOT NULL,
            user_id TEXT NOT NULL, status TEXT DEFAULT 'pending',
            payment_status TEXT DEFAULT 'unpaid', grand_total REAL DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS system_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT, setting_key TEXT UNIQUE NOT NULL,
            setting_value TEXT DEFAULT '', description TEXT DEFAULT '',
            created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
        );
    """)
    try: conn.execute("ALTER TABLE users ADD COLUMN avatar_url TEXT DEFAULT ''")
    except: pass
    try: conn.execute("ALTER TABLE products ADD COLUMN description TEXT DEFAULT ''")
    except: pass
    try: conn.execute("ALTER TABLE products ADD COLUMN compare_price REAL DEFAULT 0")
    except: pass
    try: conn.execute("ALTER TABLE products ADD COLUMN is_featured INTEGER DEFAULT 0")
    except: pass
    try: conn.execute("ALTER TABLE categories ADD COLUMN image_url TEXT DEFAULT ''")
    except: pass

    if conn.execute("SELECT COUNT(*) FROM system_settings").fetchone()[0] == 0:
        conn.executemany(
            "INSERT OR IGNORE INTO system_settings (setting_key, setting_value, description) VALUES (?,?,?)",
            [("store_name", "My Store", "Store display name"),
             ("store_phone", "+856 20 00 000 000", "Store contact phone"),
             ("currency", "LAK", "Default currency"),
             ("tax_percent", "7", "Default tax rate"),
             ("store_logo", "", "Store logo URL")])

    if conn.execute("SELECT COUNT(*) FROM categories").fetchone()[0] == 0:
        conn.executemany(
            "INSERT OR IGNORE INTO categories (id,name,slug,description,sort_order,is_active) VALUES (?,?,?,?,?,1)",
            [("059d9d35-0230-44a2-b171-bfa66c41b917", "Electronics", "electronics", "Phones, tablets, and accessories", 1),
             ("7ca35ac8-fc4a-4078-8c75-5e00031b1512", "Clothing", "clothing", "Men and women fashion", 2),
             ("5c5f2981-25d3-414a-9cfe-6625d5560646", "Home & Garden", "home-garden", "Furniture and home decor", 3),
             ("bcc138c6-1b22-4cb2-9b41-08f688b2cb23", "Sports", "sports", "Sports equipment and gear", 4),
             ("5295dd27-badf-417b-a492-f9891fc0af04", "Books", "books", "Physical and digital books", 5)])

    if conn.execute("SELECT COUNT(*) FROM products").fetchone()[0] == 0:
        conn.executemany(
            """INSERT OR IGNORE INTO products
               (id,name,slug,sku,category_id,description,cost_price,selling_price,compare_price,stock,images,is_featured,is_active)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,1)""",
            _SEED_PRODUCTS)

    if conn.execute("SELECT COUNT(*) FROM users").fetchone()[0] == 0:
        conn.execute("INSERT INTO users (id,email,password_hash,full_name,role,is_active) VALUES (?,?,?,?,?,?)",
            (str(uuid.uuid4()), "admin@template.com",
             bcrypt.hashpw(b"admin123", bcrypt.gensalt()).decode(), "Admin", "admin", 1))
    if conn.execute("SELECT COUNT(*) FROM orders").fetchone()[0] == 0:
        row = conn.execute("SELECT id FROM users ORDER BY created_at ASC LIMIT 1").fetchone()
        uid = row["id"] if row else str(uuid.uuid4())
        for i in range(5):
            statuses = ["pending", "confirmed", "processing", "shipped", "delivered"]
            conn.execute(
                "INSERT INTO orders (id,order_number,user_id,status,payment_status,grand_total) VALUES (?,?,?,?,?,?)",
                (str(uuid.uuid4()), f"ORD-{int(time.time()*1000)}-{i}", uid,
                 statuses[i % len(statuses)], "paid" if i % 2 == 0 else "unpaid", round(50 + i * 30.5, 2)))
    conn.commit(); conn.close()

_SEED_PRODUCTS = [
    ("47ee8455-fb24-4923-87d7-a7e2cd955367", "Test Product", "test-product", "TP001", "", "Demo product", 50.00, 99.99, 0, 100, "[]", 0),
    ("33677a32-33ce-459e-817f-e4f9ec42821b", "iPhone 15 Pro Max", "iphone-15-pro-max", "IPH15PM", "059d9d35-0230-44a2-b171-bfa66c41b917", "Latest Apple smartphone with A17 Pro chip", 999.00, 1299.99, 0, 25, "[]", 1),
    ("ec02f33d-5ed9-42d4-8dc5-36a1dd8d114b", "Samsung Galaxy S24", "samsung-galaxy-s24", "SGS24", "059d9d35-0230-44a2-b171-bfa66c41b917", "Samsung flagship with AI features", 699.00, 899.99, 0, 30, "[]", 1),
    ("bf9cf888-cc33-4125-b855-a8184ce870f8", "MacBook Air M3", "macbook-air-m3", "MBA3", "059d9d35-0230-44a2-b171-bfa66c41b917", "Ultra-thin laptop with M3 chip", 899.00, 1099.99, 0, 15, "[]", 1),
    ("a0d2e3ef-9c30-435f-bf94-77c1d1248522", "AirPods Pro 2", "airpods-pro-2", "APP2", "059d9d35-0230-44a2-b171-bfa66c41b917", "Active noise cancelling earbuds", 179.99, 249.99, 0, 50, "[]", 0),
    ("b71f79af-c617-4dc5-be2a-6d2cfd8ea300", "USB-C Hub 7-in-1", "usb-c-hub-7in1", "USB7", "059d9d35-0230-44a2-b171-bfa66c41b917", "Multiport adapter for MacBook", 19.99, 39.99, 0, 100, "[]", 0),
    ("c78a62db-ef42-40c9-8449-c70ad101a249", "Classic Cotton T-Shirt", "classic-cotton-tshirt", "CCT01", "7ca35ac8-fc4a-4078-8c75-5e00031b1512", "100% cotton casual t-shirt", 10.00, 24.99, 0, 200, "[]", 0),
    ("7e9f5e51-87bc-42e6-9184-ce1794444a7d", "Denim Jacket", "denim-jacket", "DJ01", "7ca35ac8-fc4a-4078-8c75-5e00031b1512", "Vintage style denim jacket", 40.00, 79.99, 0, 50, "[]", 1),
    ("ef8849cb-dc14-4374-a35d-907f94e942c3", "Running Shoes Pro", "running-shoes-pro", "RSP01", "7ca35ac8-fc4a-4078-8c75-5e00031b1512", "Lightweight running shoes", 65.00, 129.99, 0, 75, "[]", 0),
    ("c5ed3df7-6b41-422d-b9f5-33548891cfcd", "Ergonomic Office Chair", "ergonomic-office-chair", "EOC01", "5c5f2981-25d3-414a-9cfe-6625d5560646", "Adjustable lumbar support chair", 180.00, 349.99, 0, 20, "[]", 1),
    ("ffac1073-feae-45c7-b526-ac0bff9e8eb1", "LED Desk Lamp", "led-desk-lamp", "LDL01", "5c5f2981-25d3-414a-9cfe-6625d5560646", "Dimmable LED desk lamp with USB port", 25.00, 49.99, 0, 60, "[]", 0),
    ("1aed088a-062b-4ae3-a909-4cd39c193f72", "Yoga Mat Premium", "yoga-mat-premium", "YMP01", "bcc138c6-1b22-4cb2-9b41-08f688b2cb23", "Non-slip exercise yoga mat", 15.00, 39.99, 0, 80, "[]", 0),
    ("68ed210a-d924-4c25-9059-025f1aa1efff", "Adjustable Dumbbells", "adjustable-dumbbells", "AD01", "bcc138c6-1b22-4cb2-9b41-08f688b2cb23", "5-25 lb adjustable dumbbell set", 100.00, 199.99, 0, 30, "[]", 1),
    ("c73518d7-8317-45d6-9fc5-14b3ae1da938", "The Art of Code", "the-art-of-code", "TAOC", "5295dd27-badf-417b-a492-f9891fc0af04", "Modern software engineering patterns", 10.00, 29.99, 0, 100, "[]", 0),
    ("11e47c7c-11ee-4bbe-bf81-45a94e02ec36", "Business Strategy 101", "business-strategy-101", "BS101", "5295dd27-badf-417b-a492-f9891fc0af04", "Essential business strategy guide", 12.00, 34.99, 0, 60, "[]", 0),
]

# ── Token helpers ──
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_token(user_id: str, role: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS)
    return jwt.encode({"sub": user_id, "role": role, "exp": exp}, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except Exception:
        return None

def decode_token_no_expire(token: str) -> dict | None:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM], options={"verify_exp": False})
    except Exception:
        return None

def get_current_user(token: str) -> dict:
    payload = decode_token(token)
    if not payload:
        raise HTTPException(401, "invalid token")
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE id=?", (payload["sub"],)).fetchone()
    conn.close()
    if not user:
        raise HTTPException(401, "user not found")
    return dict(user)

def _bearer_token(request: Request) -> str:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "unauthorized")
    return auth.split(" ", 1)[1]

# ── DB helpers (shared by both Gradio and REST, no @spaces.GPU) ──
def db_health():
    conn = get_db()
    u = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    p = conn.execute("SELECT COUNT(*) FROM products WHERE deleted_at IS NULL").fetchone()[0]
    o = conn.execute("SELECT COUNT(*) FROM orders").fetchone()[0]
    conn.close()
    return {"status":"ok","users":u,"products":p,"orders":o}

def db_products():
    conn = get_db()
    rows = conn.execute("SELECT * FROM products WHERE deleted_at IS NULL ORDER BY created_at DESC").fetchall()
    conn.close()
    out = []
    for r in rows:
        d = dict(r)
        if isinstance(d.get("images"), str):
            try: d["images"] = json.loads(d["images"])
            except: d["images"] = []
        out.append(d)
    return out

def db_orders():
    conn = get_db()
    rows = conn.execute("SELECT * FROM orders ORDER BY created_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

# ── Gradio functions ──
@spaces.GPU
def gr_health():
    return db_health()

def gr_login(email: str, password: str):
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE email=?", (email.lower(),)).fetchone()
    conn.close()
    if not user or not verify_password(password, user["password_hash"]):
        return {"error": "invalid credentials"}
    token = create_token(user["id"], user["role"])
    u = {"id": user["id"], "email": user["email"], "full_name": user["full_name"],
         "phone": user["phone"] if "phone" in user.keys() else "",
         "role": user["role"], "is_active": bool(user["is_active"])}
    return {"access_token": token, "token_type": "bearer", "user": u}

def gr_register(email: str, password: str, full_name: str, phone: str = ""):
    conn = get_db()
    if conn.execute("SELECT 1 FROM users WHERE email=?", (email.lower(),)).fetchone():
        conn.close()
        return {"error": "email already registered"}
    uid = str(uuid.uuid4())
    hashed = hash_password(password)
    conn.execute("INSERT INTO users (id,email,password_hash,full_name,phone,role) VALUES (?,?,?,?,?,?)",
                 (uid, email.lower(), hashed, full_name, phone, "user"))
    conn.commit(); conn.close()
    token = create_token(uid, "user")
    return {"access_token": token, "token_type": "bearer",
            "user": {"id": uid, "email": email.lower(), "full_name": full_name, "phone": phone, "role": "user", "is_active": True}}

def gr_products():
    return db_products()

def gr_orders():
    return db_orders()

# ── Gradio Blocks UI ──
# Embed the full SPA as the Gradio UI
with gr.Blocks(title="Template", theme=gr.themes.Soft(), css="*{margin:0;padding:0}") as demo:
    if dist.is_dir() and (dist / "index.html").exists():
        gr.HTML((dist / "index.html").read_text())
    else:
        gr.Markdown("# Template\nFull-Stack Web + API")

if __name__ == "__main__":
    init_db()
    demo.queue()
    demo.launch(server_name="0.0.0.0", server_port=7860, prevent_thread_lock=True, ssr_mode=False)
    app: FastAPI = demo.app

    # ── Manual Gradio protocol ──
    _event_results: dict[str, Any] = {}

    def _make_sse(result: Any) -> str:
        inner = json.dumps(result, default=str)
        outer = json.dumps([inner])
        return f"event: complete\ndata: {outer}\n\n"

    @app.post("/api/v1/_call/{fn_name}")
    async def gradio_call(fn_name: str, request: Request):
        event_id = str(uuid.uuid4())
        body = await request.json() if request.headers.get("content-type", "").startswith("application/json") else {"data": []}
        data = body.get("data", [])
        try:
            if fn_name == "gr_health": result = gr_health()
            elif fn_name == "gr_login": result = gr_login(data[0] if len(data)>0 else "", data[1] if len(data)>1 else "")
            elif fn_name == "gr_register": result = gr_register(data[0] if len(data)>0 else "", data[1] if len(data)>1 else "", data[2] if len(data)>2 else "", data[3] if len(data)>3 else "")
            elif fn_name == "gr_products": result = gr_products()
            elif fn_name == "gr_orders": result = gr_orders()
            else: result = {"error": f"unknown: {fn_name}"}
        except Exception as e:
            result = {"error": str(e)}
        _event_results[event_id] = result
        return {"event_id": event_id}

    @app.get("/api/v1/_call/{fn_name}/{event_id}")
    async def gradio_result(fn_name: str, event_id: str):
        result = _event_results.get(event_id)
        if result is None:
            raise HTTPException(404, "event not found or expired")
        del _event_results[event_id]
        return Response(content=_make_sse(result), media_type="text/event-stream")

    # ── REST API ──
    class LoginReq(BaseModel): email: str; password: str
    class RegisterReq(BaseModel): email: str; password: str; full_name: str; phone: str = ""
    class ProductReq(BaseModel): name: str; slug: str; sku: str = ""; category_id: str = ""; selling_price: float = 0; cost_price: float = 0; stock: int = 0; images: list[str] = []
    class CreateUserReq(BaseModel): email: str; password: str; full_name: str; phone: str = ""; role: str = "user"; avatar_url: str = ""
    class UpdateUserReq(BaseModel): full_name: str | None = None; phone: str | None = None; role: str | None = None; is_active: bool | None = None; avatar_url: str | None = None

    @app.get("/api/v1/health")
    def rest_health():
        return db_health()

    @app.post("/api/v1/auth/register")
    def api_register(data: RegisterReq):
        conn = get_db()
        if conn.execute("SELECT 1 FROM users WHERE email=?", (data.email.lower(),)).fetchone():
            conn.close(); raise HTTPException(409, "email already registered")
        uid = str(uuid.uuid4()); hashed = hash_password(data.password)
        conn.execute("INSERT INTO users (id,email,password_hash,full_name,phone,role,is_active) VALUES (?,?,?,?,?,?,?)",
            (uid, data.email.lower(), hashed, data.full_name, data.phone, "user", 1))
        conn.commit(); conn.close()
        token = create_token(uid, "user")
        return {"access_token": token, "token_type": "bearer", "user": {"id": uid, "email": data.email.lower(), "full_name": data.full_name, "phone": data.phone, "role": "user", "is_active": True}}

    @app.post("/api/v1/auth/login")
    @app.post("/api/v1/admin/login")
    def api_login(data: LoginReq):
        conn = get_db()
        user = conn.execute("SELECT * FROM users WHERE email=?", (data.email.lower(),)).fetchone()
        conn.close()
        if not user or not verify_password(data.password, user["password_hash"]):
            raise HTTPException(401, "invalid credentials")
        token = create_token(user["id"], user["role"])
        u = {"id": user["id"], "email": user["email"], "full_name": user["full_name"],
             "phone": user["phone"], "role": user["role"], "is_active": bool(user["is_active"])}
        return {"access_token": token, "token_type": "bearer", "user": u}

    @app.get("/api/v1/auth/me")
    def api_me(request: Request):
        user = get_current_user(_bearer_token(request))
        return user

    class ProfileUpdateReq(BaseModel):
        full_name: str | None = None
        phone: str | None = None
        avatar_url: str | None = None

    @app.put("/api/v1/auth/me")
    def api_update_me(data: ProfileUpdateReq, request: Request):
        user = get_current_user(_bearer_token(request))
        conn = get_db()
        updates = {}
        if data.full_name is not None: updates["full_name"] = data.full_name
        if data.phone is not None: updates["phone"] = data.phone
        if data.avatar_url is not None: updates["avatar_url"] = data.avatar_url
        if updates:
            set_clause = ", ".join(f"{k}=?" for k in updates)
            conn.execute(f"UPDATE users SET {set_clause} WHERE id=?", (*updates.values(), user["id"]))
            conn.commit()
        row = conn.execute("SELECT id,email,full_name,phone,role,is_active,created_at FROM users WHERE id=?", (user["id"],)).fetchone()
        conn.close()
        return _format_user(row)

    @app.post("/api/v1/auth/refresh")
    def api_refresh(request: Request):
        token = _bearer_token(request)
        payload = decode_token_no_expire(token)
        if not payload:
            raise HTTPException(401, "invalid token")
        conn = get_db()
        user = conn.execute("SELECT * FROM users WHERE id=?", (payload["sub"],)).fetchone()
        conn.close()
        if not user or not user["is_active"]:
            raise HTTPException(401, "user not found or inactive")
        new_token = create_token(user["id"], user["role"])
        return {"access_token": new_token, "token_type": "bearer"}

    @app.post("/api/v1/auth/logout")
    @app.post("/api/v1/admin/logout")
    def api_logout():
        return {"message": "logged out"}

    def _dump_sql() -> str:
        conn = get_db()
        lines = []
        for line in conn.iterdump():
            lines.append(line)
        conn.close()
        return "\n".join(lines)

    @app.get("/api/v1/admin/export")
    def api_admin_export(request: Request):
        user = get_current_user(_bearer_token(request))
        if user["role"] not in ("admin", "superadmin"):
            raise HTTPException(403, "admin required")
        content = _dump_sql()
        return Response(content=content, media_type="application/sql",
                        headers={"Content-Disposition": "attachment; filename=export.sql"})

    @app.post("/api/v1/admin/backup")
    def api_admin_backup(request: Request):
        user = get_current_user(_bearer_token(request))
        if user["role"] not in ("admin", "superadmin"):
            raise HTTPException(403, "admin required")
        content = _dump_sql()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        return Response(content=content, media_type="application/sql",
                        headers={"Content-Disposition": f"attachment; filename=backup_{ts}.sql"})

    @app.post("/api/v1/admin/import")
    def api_admin_import(request: Request, file: UploadFile = File(...)):
        user = get_current_user(_bearer_token(request))
        if user["role"] not in ("admin", "superadmin"):
            raise HTTPException(403, "admin required")
        content = file.file.read().decode("utf-8")
        statements = [s.strip() for s in content.split(";") if s.strip()]
        executed = 0; failed = 0
        conn = get_db()
        for stmt in statements:
            try:
                conn.execute(stmt)
                executed += 1
            except Exception:
                failed += 1
        conn.commit(); conn.close()
        return {"message": f"Import: {executed} executed, {failed} failed.", "executed": executed, "failed": failed}

    @app.get("/api/v1/products")
    def api_products():
        return db_products()

    @app.post("/api/v1/products")
    def api_create_product(data: ProductReq, request: Request):
        user = get_current_user(_bearer_token(request))
        if user["role"] not in ("admin", "superadmin"):
            raise HTTPException(403, "admin required")
        pid = str(uuid.uuid4())
        conn = get_db()
        conn.execute("INSERT INTO products (id,name,slug,sku,category_id,selling_price,cost_price,stock,images,is_active) VALUES (?,?,?,?,?,?,?,?,?,?)",
            (pid, data.name, data.slug, data.sku, data.category_id, data.selling_price, data.cost_price, data.stock, json.dumps(data.images), 1))
        conn.commit(); conn.close()
        return {"id": pid, "name": data.name, "slug": data.slug, "sku": data.sku, "selling_price": data.selling_price, "cost_price": data.cost_price, "stock": data.stock, "images": data.images, "is_active": True}

    class ProductUpdateReq(BaseModel):
        name: str | None = None; slug: str | None = None; sku: str | None = None
        category_id: str | None = None; selling_price: float | None = None
        cost_price: float | None = None; stock: int | None = None
        images: list[str] | None = None; is_active: bool | None = None

    @app.put("/api/v1/products/{pid}")
    def api_update_product(pid: str, data: ProductUpdateReq, request: Request):
        user = get_current_user(_bearer_token(request))
        if user["role"] not in ("admin", "superadmin"):
            raise HTTPException(403, "admin required")
        conn = get_db()
        existing = conn.execute("SELECT * FROM products WHERE id=? AND deleted_at IS NULL", (pid,)).fetchone()
        if not existing: conn.close(); raise HTTPException(404, "product not found")
        updates = {}
        if data.name is not None: updates["name"] = data.name
        if data.slug is not None: updates["slug"] = data.slug
        if data.sku is not None: updates["sku"] = data.sku
        if data.category_id is not None: updates["category_id"] = data.category_id
        if data.selling_price is not None: updates["selling_price"] = data.selling_price
        if data.cost_price is not None: updates["cost_price"] = data.cost_price
        if data.stock is not None: updates["stock"] = data.stock
        if data.images is not None: updates["images"] = json.dumps(data.images)
        if data.is_active is not None: updates["is_active"] = 1 if data.is_active else 0
        if updates:
            set_clause = ", ".join(f"{k}=?" for k in updates)
            conn.execute(f"UPDATE products SET {set_clause} WHERE id=?", (*updates.values(), pid))
            conn.commit()
        row = conn.execute("SELECT * FROM products WHERE id=?", (pid,)).fetchone()
        conn.close()
        d = dict(row)
        if isinstance(d.get("images"), str):
            try: d["images"] = json.loads(d["images"])
            except: d["images"] = []
        return d

    @app.delete("/api/v1/products/{pid}")
    def api_delete_product(pid: str, request: Request):
        user = get_current_user(_bearer_token(request))
        if user["role"] not in ("admin", "superadmin"):
            raise HTTPException(403, "admin required")
        conn = get_db()
        existing = conn.execute("SELECT * FROM products WHERE id=? AND deleted_at IS NULL", (pid,)).fetchone()
        if not existing: conn.close(); raise HTTPException(404, "product not found")
        conn.execute("UPDATE products SET deleted_at=datetime('now') WHERE id=?", (pid,))
        conn.commit(); conn.close()
        return {"message": "product deleted"}

    @app.post("/api/v1/upload")
    def api_upload(request: Request, file: UploadFile = File(...)):
        user = get_current_user(_bearer_token(request))
        IMAGEKIT_PRIVATE_KEY = os.environ.get("IMAGEKIT_PRIVATE_KEY", "")
        if not IMAGEKIT_PRIVATE_KEY:
            raise HTTPException(500, "ImageKit not configured")
        import requests
        auth = base64.b64encode(f"{IMAGEKIT_PRIVATE_KEY}:".encode()).decode()
        resp = requests.post(
            "https://upload.imagekit.io/api/v1/files/upload",
            headers={"Authorization": f"Basic {auth}"},
            files={"file": (file.filename, file.file, file.content_type or "application/octet-stream")},
            data={"fileName": file.filename or "upload", "folder": "/template"},
        )
        if not resp.ok:
            raise HTTPException(500, f"ImageKit upload failed: {resp.text}")
        return resp.json()

    @app.get("/api/v1/categories")
    def api_categories():
        conn = get_db()
        rows = conn.execute("SELECT * FROM categories WHERE is_active=1 ORDER BY sort_order, name").fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @app.get("/api/v1/orders")
    def api_orders(request: Request):
        get_current_user(_bearer_token(request))
        conn = get_db(); rows = conn.execute("SELECT * FROM orders ORDER BY created_at DESC").fetchall(); conn.close()
        return [dict(r) for r in rows]

    def _format_user(row: sqlite3.Row) -> dict:
        return {"id": row["id"], "email": row["email"], "full_name": row["full_name"],
                "phone": row["phone"], "avatar_url": row["avatar_url"] or "" if "avatar_url" in row.keys() else "",
                "role": row["role"], "is_active": bool(row["is_active"]),
                "email_verified": False, "created_at": row["created_at"]}

    @app.get("/api/v1/users")
    def api_users(request: Request):
        user = get_current_user(_bearer_token(request))
        if user["role"] not in ("admin", "superadmin"): raise HTTPException(403, "admin required")
        conn = get_db()
        rows = conn.execute("SELECT id,email,full_name,phone,role,is_active,created_at FROM users ORDER BY created_at DESC").fetchall()
        conn.close()
        return [_format_user(r) for r in rows]

    @app.post("/api/v1/users")
    def api_create_user(data: CreateUserReq, request: Request):
        user = get_current_user(_bearer_token(request))
        if user["role"] not in ("admin", "superadmin"): raise HTTPException(403, "admin required")
        conn = get_db()
        if conn.execute("SELECT 1 FROM users WHERE email=?", (data.email.lower(),)).fetchone():
            conn.close(); raise HTTPException(409, "email already registered")
        uid = str(uuid.uuid4())
        hashed = hash_password(data.password)
        conn.execute("INSERT INTO users (id,email,password_hash,full_name,phone,role,is_active,avatar_url) VALUES (?,?,?,?,?,?,?,?)",
            (uid, data.email.lower(), hashed, data.full_name, data.phone, data.role, 1, data.avatar_url))
        conn.commit()
        row = conn.execute("SELECT id,email,full_name,phone,role,is_active,created_at,avatar_url FROM users WHERE id=?", (uid,)).fetchone()
        conn.close()
        return _format_user(row)

    @app.put("/api/v1/users/{uid}")
    def api_update_user(uid: str, data: UpdateUserReq, request: Request):
        user = get_current_user(_bearer_token(request))
        if user["role"] not in ("admin", "superadmin"): raise HTTPException(403, "admin required")
        conn = get_db()
        existing = conn.execute("SELECT * FROM users WHERE id=?", (uid,)).fetchone()
        if not existing: conn.close(); raise HTTPException(404, "user not found")
        updates = {}
        if data.full_name is not None: updates["full_name"] = data.full_name
        if data.phone is not None: updates["phone"] = data.phone
        if data.role is not None: updates["role"] = data.role
        if data.is_active is not None: updates["is_active"] = 1 if data.is_active else 0
        if data.avatar_url is not None: updates["avatar_url"] = data.avatar_url
        if updates:
            set_clause = ", ".join(f"{k}=?" for k in updates)
            conn.execute(f"UPDATE users SET {set_clause} WHERE id=?", (*updates.values(), uid))
            conn.commit()
        row = conn.execute("SELECT id,email,full_name,phone,role,is_active,created_at,avatar_url FROM users WHERE id=?", (uid,)).fetchone()
        conn.close()
        return _format_user(row)

    @app.delete("/api/v1/users/{uid}")
    def api_delete_user(uid: str, request: Request):
        user = get_current_user(_bearer_token(request))
        if user["role"] not in ("admin", "superadmin"): raise HTTPException(403, "admin required")
        if user["id"] == uid: raise HTTPException(400, "cannot delete yourself")
        conn = get_db()
        existing = conn.execute("SELECT 1 FROM users WHERE id=?", (uid,)).fetchone()
        if not existing: conn.close(); raise HTTPException(404, "user not found")
        conn.execute("DELETE FROM users WHERE id=?", (uid,))
        conn.commit(); conn.close()
        return {"message": "user deleted"}

    @app.get("/api/v1/dashboard/stats")
    def api_stats(request: Request):
        user = get_current_user(_bearer_token(request))
        if user["role"] not in ("admin", "superadmin"): raise HTTPException(403, "admin required")
        conn = get_db()
        result = {"total_users": conn.execute("SELECT COUNT(*) FROM users").fetchone()[0],
                  "total_products": conn.execute("SELECT COUNT(*) FROM products WHERE deleted_at IS NULL").fetchone()[0],
                  "total_orders": conn.execute("SELECT COUNT(*) FROM orders").fetchone()[0],
                  "total_categories": 0, "total_revenue": 0, "pending_orders": 0}
        conn.close()
        return result

    @app.get("/api/v1/settings")
    def api_settings():
        conn = get_db()
        rows = conn.execute("SELECT setting_key, setting_value, description FROM system_settings ORDER BY id").fetchall()
        conn.close()
        if not rows:
            return [
                {"key": "store_name", "value": "Template"},
                {"key": "store_phone", "value": ""},
                {"key": "currency", "value": "LAK"},
                {"key": "tax_percent", "value": "7"},
                {"key": "store_logo", "value": ""},
            ]
        return [{"key": r["setting_key"], "value": r["setting_value"], "description": r["description"]} for r in rows]

    # ── Serve SPA assets via middleware ──
    _MIME = {
        ".js": "application/javascript", ".css": "text/css",
        ".svg": "image/svg+xml", ".ico": "image/x-icon",
        ".webmanifest": "application/manifest+json", ".html": "text/html",
    }

    _API_PREFIXES = ("/api/", "/theme.css", "/static/", "/file=")

    class _SPAMiddleware:
        def __init__(self, app: ASGIApp):
            self.app = app
        async def __call__(self, scope: Scope, receive: Receive, send: Send):
            if scope["type"] == "http" and scope.get("method") in ("GET", "HEAD"):
                path = scope.get("path", "/")
                rel = path.lstrip("/")
                fp = (dist / rel) if rel else (dist / "index.html")
                if fp.exists() and fp.is_file():
                    body = fp.read_bytes()
                    ct = _MIME.get(fp.suffix, "application/octet-stream")
                    await send({"type": "http.response.start", "status": 200, "headers": [
                        (b"content-type", ct.encode()), (b"content-length", str(len(body)).encode()),
                    ]})
                    await send({"type": "http.response.body", "body": body})
                    return
                # SPA fallback: serve index.html for non-API paths
                if not path.startswith(_API_PREFIXES):
                    index = dist / "index.html"
                    if index.exists() and index.is_file():
                        body = index.read_bytes()
                        await send({"type": "http.response.start", "status": 200, "headers": [
                            (b"content-type", b"text/html"), (b"content-length", str(len(body)).encode()),
                        ]})
                        await send({"type": "http.response.body", "body": body})
                        return
            await self.app(scope, receive, send)

    app.middleware_stack = None
    app.add_middleware(_SPAMiddleware)

    demo.block_thread()
