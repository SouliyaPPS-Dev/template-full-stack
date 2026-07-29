import json, os, uuid, sqlite3, time
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import Any

import gradio as gr
import spaces
from starlette.middleware import Middleware
from starlette.types import ASGIApp, Scope, Receive, Send
from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import Response
import bcrypt
from jose import jwt
from pydantic import BaseModel

# ── Config ──
DB_PATH = "/data/app.db"
JWT_SECRET = os.environ.get("JWT_SECRET", "super-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 24 * 7
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
            full_name TEXT NOT NULL, phone TEXT DEFAULT '', role TEXT DEFAULT 'user',
            is_active INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
            sku TEXT DEFAULT '', category_id TEXT DEFAULT '', selling_price REAL DEFAULT 0,
            cost_price REAL DEFAULT 0, stock INTEGER DEFAULT 0, images TEXT DEFAULT '[]',
            is_active INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now')), deleted_at TEXT
        );
        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY, order_number TEXT UNIQUE NOT NULL,
            user_id TEXT NOT NULL, status TEXT DEFAULT 'pending',
            payment_status TEXT DEFAULT 'unpaid', grand_total REAL DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
        );
    """)
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
    return [dict(r) for r in rows]

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

    @app.post("/api/v1/auth/logout")
    @app.post("/api/v1/admin/logout")
    def api_logout():
        return {"message": "logged out"}

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
        return {"id": pid, "name": data.name, "slug": data.slug, "selling_price": data.selling_price, "stock": data.stock}

    @app.get("/api/v1/categories")
    def api_categories(): return []

    @app.get("/api/v1/orders")
    def api_orders(request: Request):
        get_current_user(_bearer_token(request))
        conn = get_db(); rows = conn.execute("SELECT * FROM orders ORDER BY created_at DESC").fetchall(); conn.close()
        return [dict(r) for r in rows]

    @app.get("/api/v1/users")
    def api_users(request: Request):
        user = get_current_user(_bearer_token(request))
        if user["role"] not in ("admin", "superadmin"): raise HTTPException(403, "admin required")
        conn = get_db()
        rows = conn.execute("SELECT id,email,full_name,phone,role,is_active,created_at FROM users ORDER BY created_at DESC").fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @app.get("/api/v1/dashboard/stats")
    def api_stats(request: Request):
        user = get_current_user(_bearer_token(request))
        if user["role"] not in ("admin", "superadmin"): raise HTTPException(403, "admin required")
        conn = get_db()
        result = {"users": conn.execute("SELECT COUNT(*) FROM users").fetchone()[0],
                  "products": conn.execute("SELECT COUNT(*) FROM products WHERE deleted_at IS NULL").fetchone()[0],
                  "orders": conn.execute("SELECT COUNT(*) FROM orders").fetchone()[0]}
        conn.close()
        return result

    @app.get("/api/v1/settings")
    def api_settings():
        return {"store_name": "Template", "currency": "LAK", "tax_percent": 0}

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
