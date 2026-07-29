import json, os, uuid, sqlite3, time
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import Any

import gradio as gr
import spaces
from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import bcrypt
from jose import jwt, JWTError

DB_PATH = "/data/db.sqlite"
JWT_SECRET = os.environ.get("JWT_SECRET", "change-me-in-production")
JWT_ALGORITHM = "HS256"

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
        hashed = bcrypt.hashpw(b"admin123", bcrypt.gensalt()).decode()
        conn.execute("INSERT INTO users (id,email,password_hash,full_name,role) VALUES (?,?,?,?,?)",
                     (str(uuid.uuid4()), "admin@template.com", hashed, "Admin", "admin"))
    if conn.execute("SELECT COUNT(*) FROM orders").fetchone()[0] == 0:
        row = conn.execute("SELECT id FROM users LIMIT 1").fetchone()
        uid = row["id"]
        for i in range(5):
            statuses = ["pending","confirmed","processing","shipped","delivered"]
            conn.execute(
                "INSERT INTO orders (id,order_number,user_id,status,payment_status,grand_total) VALUES (?,?,?,?,?,?)",
                (str(uuid.uuid4()), f"ORD-{int(time.time()*1000)}-{i}", uid,
                 statuses[i], "paid" if i%2==0 else "unpaid", round(50+i*30.5,2)))
    conn.commit(); conn.close()

# ── Auth helpers ──
def create_token(user_id: str, role: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(hours=168)
    return jwt.encode({"sub": user_id, "role": role, "exp": exp}, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict | None:
    try: return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError: return None

def require_auth(authorization: str = "") -> dict:
    token = authorization.replace("Bearer ", "") if authorization else ""
    if not token: raise HTTPException(401, "unauthorized")
    payload = decode_token(token)
    if not payload: raise HTTPException(401, "invalid token")
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE id=?", (payload["sub"],)).fetchone()
    conn.close()
    if not user: raise HTTPException(401, "user not found")
    return dict(user)

# ── Gradio functions ──
_event_results: dict[str, Any] = {}

def _make_sse(result: Any) -> str:
    inner = json.dumps(result, default=str)
    outer = json.dumps([inner])
    return f"event: complete\ndata: {outer}\n\n"

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
    if not user or not bcrypt.checkpw(password.encode(), user["password_hash"].encode()):
        return {"error": "invalid credentials"}
    token = create_token(user["id"], user["role"])
    return {"access_token": token, "token_type": "bearer", "user": {"id": user["id"], "email": user["email"], "full_name": user["full_name"], "phone": user.get("phone",""), "role": user["role"], "is_active": bool(user["is_active"])}}

def gr_register(email: str, password: str, full_name: str, phone: str = ""):
    conn = get_db()
    if conn.execute("SELECT 1 FROM users WHERE email=?", (email.lower(),)).fetchone():
        conn.close()
        return {"error": "email already registered"}
    uid = str(uuid.uuid4())
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    conn.execute("INSERT INTO users (id,email,password_hash,full_name,phone,role) VALUES (?,?,?,?,?,?)",
                 (uid, email.lower(), hashed, full_name, phone, "user"))
    conn.commit(); conn.close()
    token = create_token(uid, "user")
    return {"access_token": token, "token_type": "bearer", "user": {"id": uid, "email": email.lower(), "full_name": full_name, "role": "user", "is_active": True}}

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

# ── Gradio interface (for HF detection + manual testing) ──
with gr.Blocks(title="Template", theme=gr.themes.Soft()) as demo:
    gr.Markdown("# Template Full Stack\n**SPA:** `/` • **REST API:** `/api/v1/*` • **Gradio API:** `/gradio_api/call/*`")
    with gr.Tabs():
        with gr.Tab("Health"):
            btn = gr.Button("Check")
            out = gr.JSON(label="Result")
            btn.click(fn=gr_health, outputs=out)
        with gr.Tab("Login"):
            e = gr.Textbox(label="Email", placeholder="admin@template.com")
            p = gr.Textbox(label="Password", type="password")
            btn2 = gr.Button("Login", variant="primary")
            out2 = gr.JSON(label="Result")
            btn2.click(fn=gr_login, inputs=[e, p], outputs=out2)
        with gr.Tab("Products"):
            btn3 = gr.Button("Load Products")
            out3 = gr.JSON(label="Products")
            btn3.click(fn=gr_products, outputs=out3)
        with gr.Tab("Orders"):
            btn4 = gr.Button("Load Orders")
            out4 = gr.JSON(label="Orders")
            btn4.click(fn=gr_orders, outputs=out4)

# ── FastAPI app ──
app = FastAPI(title="Template")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# Mount Gradio at subpath
app = gr.mount_gradio_app(app, demo, path="/gradio")

# ── Manual Gradio protocol (replicates Gradio's API structure) ──
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
    return _make_json(gr_health())

def _make_json(data):
    return data

@app.post("/api/v1/auth/login")
def rest_login(data: LoginReq): return gr_login(data.email, data.password)
@app.post("/api/v1/admin/login")
def rest_admin_login(data: LoginReq):
    result = gr_login(data.email, data.password)
    if "access_token" not in result: raise HTTPException(401, "invalid credentials")
    return result
@app.post("/api/v1/auth/register")
def rest_register(data: RegisterReq): return gr_register(data.email, data.password, data.full_name, data.phone)
@app.get("/api/v1/auth/me")
def rest_me(authorization: str = ""):
    user = require_auth(authorization)
    return {"id": user["id"], "email": user["email"], "full_name": user["full_name"], "phone": user.get("phone",""), "role": user["role"], "is_active": bool(user["is_active"])}
@app.put("/api/v1/auth/me")
async def rest_update_me(request: Request, authorization: str = ""):
    user = require_auth(authorization)
    body = await request.json()
    fn = body.get("full_name", user["full_name"])
    ph = body.get("phone", user.get("phone",""))
    conn = get_db()
    conn.execute("UPDATE users SET full_name=?, phone=?, updated_at=datetime('now') WHERE id=?", (fn, ph, user["id"]))
    conn.commit()
    updated = conn.execute("SELECT * FROM users WHERE id=?", (user["id"],)).fetchone()
    conn.close()
    return dict(updated)
@app.get("/api/v1/products")
def rest_list_products(): return gr_products()
@app.post("/api/v1/products")
def rest_create_product(data: ProductReq, authorization: str = ""):
    user = require_auth(authorization)
    pid = str(uuid.uuid4())
    conn = get_db()
    conn.execute("INSERT INTO products (id,name,slug,sku,category_id,selling_price,cost_price,stock,images) VALUES (?,?,?,?,?,?,?,?,?)",
                 (pid, data.name, data.slug, data.sku, data.category_id, data.selling_price, data.cost_price, data.stock, json.dumps(data.images)))
    conn.commit(); conn.close()
    return {"id": pid, "name": data.name, "slug": data.slug, "selling_price": data.selling_price, "stock": data.stock}
@app.get("/api/v1/orders")
def rest_list_orders(authorization: str = ""):
    user = require_auth(authorization)
    return gr_orders()
@app.get("/api/v1/users")
def rest_list_users(authorization: str = ""):
    user = require_auth(authorization)
    conn = get_db()
    rows = conn.execute("SELECT id,email,full_name,phone,role,is_active,created_at FROM users ORDER BY created_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]
@app.get("/api/v1/dashboard/stats")
def rest_stats(authorization: str = ""):
    user = require_auth(authorization)
    return _make_json(gr_health())
@app.get("/api/v1/settings")
def rest_settings():
    return {"store_name": "Template", "currency": "LAK", "tax_percent": 7}
@app.post("/api/v1/auth/logout")
@app.post("/api/v1/admin/logout")
def rest_logout():
    return {"message": "logged out"}

# ── Serve SPA (must be last) ──
dist = Path("dist")
if dist.is_dir():
    app.mount("/", StaticFiles(directory="dist", html=True), name="spa")

if __name__ == "__main__":
    init_db()
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860, log_level="info")
