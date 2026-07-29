import json, os, uuid, sqlite3, time
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import Any

import gradio as gr
import spaces
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

# ── Gradio functions ──
@spaces.GPU
def gr_health():
    conn = get_db()
    u = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    p = conn.execute("SELECT COUNT(*) FROM products WHERE deleted_at IS NULL").fetchone()[0]
    o = conn.execute("SELECT COUNT(*) FROM orders").fetchone()[0]
    conn.close()
    return {"status":"ok","users":u,"products":p,"orders":o}

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
    conn = get_db()
    rows = conn.execute("SELECT * FROM products WHERE deleted_at IS NULL ORDER BY created_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

def gr_orders():
    conn = get_db()
    rows = conn.execute("SELECT * FROM orders ORDER BY created_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

# ── Gradio Blocks UI ──
with gr.Blocks(title="Template", theme=gr.themes.Soft()) as demo:
    gr.Markdown("# Template\nFull-Stack Web + API\n\nView the [Web App](/spa/)")
    with gr.Tabs():
        with gr.Tab("Health"):
            btn1 = gr.Button("Check Health")
            out1 = gr.JSON(label="Result")
            btn1.click(fn=gr_health, outputs=out1)
        with gr.Tab("Login"):
            inp_e = gr.Textbox(label="Email", placeholder="admin@template.com")
            inp_p = gr.Textbox(label="Password", type="password", placeholder="admin123")
            btn2 = gr.Button("Login", variant="primary")
            out2 = gr.JSON(label="Result")
            btn2.click(fn=gr_login, inputs=[inp_e, inp_p], outputs=out2)
        with gr.Tab("Products"):
            btn3 = gr.Button("Load Products")
            out3 = gr.JSON(label="Products")
            btn3.click(fn=gr_products, outputs=out3)
        with gr.Tab("Orders"):
            btn4 = gr.Button("Load Orders")
            out4 = gr.JSON(label="Orders")
            btn4.click(fn=gr_orders, outputs=out4)

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

    @app.post("/gradio_api/call/{fn_name}")
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

    @app.get("/gradio_api/call/{fn_name}/{event_id}")
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
        return gr_health()

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
        return gr_products()

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

    # ── Serve SPA at root / ──
    MIME = {
        ".js": "application/javascript", ".css": "text/css",
        ".svg": "image/svg+xml", ".ico": "image/x-icon",
        ".webmanifest": "application/manifest+json", ".html": "text/html",
    }

    # Remove Gradio's root route so SPA can take over
    from starlette.routing import Route
    app.router.routes = [r for r in app.router.routes if not (
        isinstance(r, Route) and r.path in ("/", "") and "GET" in r.methods
    )]

    @app.get("/{path:path}")
    async def serve_spa(path: str):
        if path.startswith(("api/", "gradio_api/", "theme.css", "static/", "file=")):
            raise HTTPException(404)
        if path == "":
            filepath = dist / "index.html"
        else:
            filepath = dist / path
        if filepath.exists() and filepath.is_file():
            return Response(content=filepath.read_bytes(), media_type=MIME.get(filepath.suffix, "application/octet-stream"))
        index = dist / "index.html"
        if index.exists():
            return Response(content=index.read_bytes(), media_type="text/html")
        raise HTTPException(404)

    demo.block_thread()
