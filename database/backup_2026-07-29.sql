--
-- PostgreSQL database dump
--

\restrict NOcB0Eg0dmWCPmRk9anQQ5RbrJmXm3LKlqZb9knD9kDgfdTK0nathouhy3gObWf

-- Dumped from database version 17.9 (Homebrew)
-- Dumped by pg_dump version 17.9 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.user_sessions DROP CONSTRAINT IF EXISTS user_sessions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_roles DROP CONSTRAINT IF EXISTS user_roles_granted_by_fkey;
ALTER TABLE IF EXISTS ONLY public.system_settings DROP CONSTRAINT IF EXISTS system_settings_updated_by_fkey;
ALTER TABLE IF EXISTS ONLY public.quotations DROP CONSTRAINT IF EXISTS quotations_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.quotation_items DROP CONSTRAINT IF EXISTS quotation_items_quotation_id_fkey;
ALTER TABLE IF EXISTS ONLY public.quotation_items DROP CONSTRAINT IF EXISTS quotation_items_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.quotation_history DROP CONSTRAINT IF EXISTS quotation_history_quotation_id_fkey;
ALTER TABLE IF EXISTS ONLY public.quotation_history DROP CONSTRAINT IF EXISTS quotation_history_performed_by_fkey;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_category_id_fkey;
ALTER TABLE IF EXISTS ONLY public.product_images DROP CONSTRAINT IF EXISTS product_images_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.inquiry_messages DROP CONSTRAINT IF EXISTS inquiry_messages_sender_id_fkey;
ALTER TABLE IF EXISTS ONLY public.inquiry_messages DROP CONSTRAINT IF EXISTS inquiry_messages_inquiry_id_fkey;
ALTER TABLE IF EXISTS ONLY public.favorites DROP CONSTRAINT IF EXISTS favorites_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.favorites DROP CONSTRAINT IF EXISTS favorites_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.expenses DROP CONSTRAINT IF EXISTS expenses_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.expenses DROP CONSTRAINT IF EXISTS expenses_category_id_fkey;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_parent_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cart_items DROP CONSTRAINT IF EXISTS cart_items_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cart_items DROP CONSTRAINT IF EXISTS cart_items_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
DROP INDEX IF EXISTS public.idx_users_role;
DROP INDEX IF EXISTS public.idx_users_phone;
DROP INDEX IF EXISTS public.idx_users_email;
DROP INDEX IF EXISTS public.idx_sessions_user;
DROP INDEX IF EXISTS public.idx_sessions_token;
DROP INDEX IF EXISTS public.idx_quotation_items_quotation;
DROP INDEX IF EXISTS public.idx_products_slug;
DROP INDEX IF EXISTS public.idx_products_sku;
DROP INDEX IF EXISTS public.idx_products_featured;
DROP INDEX IF EXISTS public.idx_products_category;
DROP INDEX IF EXISTS public.idx_product_images_product;
DROP INDEX IF EXISTS public.idx_orders_user;
DROP INDEX IF EXISTS public.idx_orders_status;
DROP INDEX IF EXISTS public.idx_orders_number;
DROP INDEX IF EXISTS public.idx_orders_created;
DROP INDEX IF EXISTS public.idx_order_items_product;
DROP INDEX IF EXISTS public.idx_order_items_order;
DROP INDEX IF EXISTS public.idx_notifications_user;
DROP INDEX IF EXISTS public.idx_notifications_unread;
DROP INDEX IF EXISTS public.idx_inquiry_messages_inquiry;
DROP INDEX IF EXISTS public.idx_favorites_user;
DROP INDEX IF EXISTS public.idx_expenses_date;
DROP INDEX IF EXISTS public.idx_expenses_category;
DROP INDEX IF EXISTS public.idx_categories_slug;
DROP INDEX IF EXISTS public.idx_categories_parent;
DROP INDEX IF EXISTS public.idx_cart_user;
DROP INDEX IF EXISTS public.idx_cart_session;
DROP INDEX IF EXISTS public.idx_audit_user;
DROP INDEX IF EXISTS public.idx_audit_target;
DROP INDEX IF EXISTS public.idx_audit_created;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_phone_key;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.user_sessions DROP CONSTRAINT IF EXISTS user_sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;
ALTER TABLE IF EXISTS ONLY public.user_roles DROP CONSTRAINT IF EXISTS user_roles_pkey;
ALTER TABLE IF EXISTS ONLY public.system_settings DROP CONSTRAINT IF EXISTS system_settings_setting_key_key;
ALTER TABLE IF EXISTS ONLY public.system_settings DROP CONSTRAINT IF EXISTS system_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.quotations DROP CONSTRAINT IF EXISTS quotations_quotation_number_key;
ALTER TABLE IF EXISTS ONLY public.quotations DROP CONSTRAINT IF EXISTS quotations_pkey;
ALTER TABLE IF EXISTS ONLY public.quotation_items DROP CONSTRAINT IF EXISTS quotation_items_pkey;
ALTER TABLE IF EXISTS ONLY public.quotation_history DROP CONSTRAINT IF EXISTS quotation_history_pkey;
ALTER TABLE IF EXISTS ONLY public.promotions DROP CONSTRAINT IF EXISTS promotions_pkey;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_slug_key;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_sku_key;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_pkey;
ALTER TABLE IF EXISTS ONLY public.product_images DROP CONSTRAINT IF EXISTS product_images_pkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_pkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_order_number_key;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_pkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.inquiry_messages DROP CONSTRAINT IF EXISTS inquiry_messages_pkey;
ALTER TABLE IF EXISTS ONLY public.inquiries DROP CONSTRAINT IF EXISTS inquiries_pkey;
ALTER TABLE IF EXISTS ONLY public.favorites DROP CONSTRAINT IF EXISTS favorites_user_id_product_id_key;
ALTER TABLE IF EXISTS ONLY public.favorites DROP CONSTRAINT IF EXISTS favorites_pkey;
ALTER TABLE IF EXISTS ONLY public.expenses DROP CONSTRAINT IF EXISTS expenses_pkey;
ALTER TABLE IF EXISTS ONLY public.expense_categories DROP CONSTRAINT IF EXISTS expense_categories_pkey;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_slug_key;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_pkey;
ALTER TABLE IF EXISTS ONLY public.cart_items DROP CONSTRAINT IF EXISTS cart_items_pkey;
ALTER TABLE IF EXISTS ONLY public.banners DROP CONSTRAINT IF EXISTS banners_pkey;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_pkey;
ALTER TABLE IF EXISTS public.user_roles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.system_settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.quotation_history ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.notifications ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.inquiry_messages ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.favorites ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.audit_logs ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.user_sessions;
DROP SEQUENCE IF EXISTS public.user_roles_id_seq;
DROP TABLE IF EXISTS public.user_roles;
DROP SEQUENCE IF EXISTS public.system_settings_id_seq;
DROP TABLE IF EXISTS public.system_settings;
DROP TABLE IF EXISTS public.quotations;
DROP TABLE IF EXISTS public.quotation_items;
DROP SEQUENCE IF EXISTS public.quotation_history_id_seq;
DROP TABLE IF EXISTS public.quotation_history;
DROP TABLE IF EXISTS public.promotions;
DROP TABLE IF EXISTS public.products;
DROP TABLE IF EXISTS public.product_images;
DROP TABLE IF EXISTS public.orders;
DROP TABLE IF EXISTS public.order_items;
DROP SEQUENCE IF EXISTS public.notifications_id_seq;
DROP TABLE IF EXISTS public.notifications;
DROP SEQUENCE IF EXISTS public.inquiry_messages_id_seq;
DROP TABLE IF EXISTS public.inquiry_messages;
DROP TABLE IF EXISTS public.inquiries;
DROP SEQUENCE IF EXISTS public.favorites_id_seq;
DROP TABLE IF EXISTS public.favorites;
DROP TABLE IF EXISTS public.expenses;
DROP TABLE IF EXISTS public.expense_categories;
DROP TABLE IF EXISTS public.categories;
DROP TABLE IF EXISTS public.cart_items;
DROP TABLE IF EXISTS public.banners;
DROP SEQUENCE IF EXISTS public.audit_logs_id_seq;
DROP TABLE IF EXISTS public.audit_logs;
DROP EXTENSION IF EXISTS "uuid-ossp";
DROP EXTENSION IF EXISTS pgcrypto;
--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id bigint NOT NULL,
    user_id uuid,
    action character varying(100) NOT NULL,
    target_table character varying(100),
    target_id character varying(100),
    old_values jsonb,
    new_values jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: banners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.banners (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying(255),
    subtitle character varying(255),
    image_url text NOT NULL,
    link text,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    session_id character varying(100),
    product_id uuid NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT cart_owner CHECK (((user_id IS NOT NULL) OR (session_id IS NOT NULL)))
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    parent_id uuid,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    description text,
    image_url text,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: expense_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expense_categories (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: expenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expenses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    category_id uuid,
    user_id uuid,
    expense_date date DEFAULT CURRENT_DATE NOT NULL,
    amount numeric(12,2) NOT NULL,
    description text,
    receipt_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: favorites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.favorites (
    id bigint NOT NULL,
    user_id uuid NOT NULL,
    product_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: favorites_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.favorites_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: favorites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.favorites_id_seq OWNED BY public.favorites.id;


--
-- Name: inquiries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inquiries (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    subject character varying(255),
    status character varying(20) DEFAULT 'open'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT inquiries_status_check CHECK (((status)::text = ANY (ARRAY[('open'::character varying)::text, ('in_progress'::character varying)::text, ('resolved'::character varying)::text, ('closed'::character varying)::text])))
);


--
-- Name: inquiry_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inquiry_messages (
    id bigint NOT NULL,
    inquiry_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: inquiry_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.inquiry_messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: inquiry_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.inquiry_messages_id_seq OWNED BY public.inquiry_messages.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id bigint NOT NULL,
    user_id uuid NOT NULL,
    type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    message text,
    data jsonb DEFAULT '{}'::jsonb,
    is_read boolean DEFAULT false,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_id uuid NOT NULL,
    product_id uuid NOT NULL,
    product_name character varying(255) NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_number character varying(50) NOT NULL,
    user_id uuid NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    payment_status character varying(20) DEFAULT 'unpaid'::character varying NOT NULL,
    payment_method character varying(50),
    subtotal numeric(12,2) DEFAULT 0 NOT NULL,
    discount numeric(12,2) DEFAULT 0,
    tax_percent numeric(5,2) DEFAULT 0,
    tax_amount numeric(12,2) DEFAULT 0,
    shipping_fee numeric(12,2) DEFAULT 0,
    grand_total numeric(12,2) DEFAULT 0 NOT NULL,
    currency character varying(3) DEFAULT 'LAK'::character varying,
    shipping_address jsonb,
    billing_address jsonb,
    notes text,
    paid_at timestamp with time zone,
    shipped_at timestamp with time zone,
    delivered_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone,
    CONSTRAINT orders_payment_status_check CHECK (((payment_status)::text = ANY (ARRAY[('unpaid'::character varying)::text, ('paid'::character varying)::text, ('partial'::character varying)::text, ('refunded'::character varying)::text, ('failed'::character varying)::text]))),
    CONSTRAINT orders_status_check CHECK (((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('confirmed'::character varying)::text, ('processing'::character varying)::text, ('shipped'::character varying)::text, ('delivered'::character varying)::text, ('cancelled'::character varying)::text, ('refunded'::character varying)::text])))
);


--
-- Name: product_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_images (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    product_id uuid NOT NULL,
    image_url text NOT NULL,
    alt_text character varying(255),
    sort_order integer DEFAULT 0,
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    category_id uuid,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    sku character varying(100),
    barcode character varying(100),
    description text,
    cost_price numeric(12,2) DEFAULT 0,
    selling_price numeric(12,2) NOT NULL,
    compare_price numeric(12,2) DEFAULT 0,
    stock integer DEFAULT 0,
    min_stock integer DEFAULT 0,
    unit character varying(20) DEFAULT 'pcs'::character varying,
    weight numeric(8,2),
    images jsonb DEFAULT '[]'::jsonb,
    features jsonb DEFAULT '{}'::jsonb,
    is_featured boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone
);


--
-- Name: promotions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.promotions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    image_url text,
    link text,
    discount_type character varying(20),
    discount_value numeric(12,2),
    min_purchase numeric(12,2) DEFAULT 0,
    max_uses integer,
    current_uses integer DEFAULT 0,
    is_active boolean DEFAULT true,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT promotions_discount_type_check CHECK (((discount_type)::text = ANY (ARRAY[('percent'::character varying)::text, ('fixed'::character varying)::text])))
);


--
-- Name: quotation_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quotation_history (
    id bigint NOT NULL,
    quotation_id uuid NOT NULL,
    action character varying(100) NOT NULL,
    old_status character varying(20),
    new_status character varying(20),
    performed_by uuid,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: quotation_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.quotation_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: quotation_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.quotation_history_id_seq OWNED BY public.quotation_history.id;


--
-- Name: quotation_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quotation_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    quotation_id uuid NOT NULL,
    product_id uuid NOT NULL,
    product_name character varying(255) NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    unit character varying(20) DEFAULT 'pcs'::character varying,
    unit_price numeric(12,2) NOT NULL,
    amount numeric(12,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: quotations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quotations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    quotation_number character varying(50) NOT NULL,
    user_id uuid,
    ref_no character varying(100),
    date date DEFAULT CURRENT_DATE NOT NULL,
    expiry_date date,
    subtotal numeric(12,2) DEFAULT 0,
    discount numeric(12,2) DEFAULT 0,
    tax_percent numeric(5,2) DEFAULT 0,
    grand_total numeric(12,2) DEFAULT 0,
    status character varying(20) DEFAULT 'draft'::character varying NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT quotations_status_check CHECK (((status)::text = ANY (ARRAY[('draft'::character varying)::text, ('sent'::character varying)::text, ('approved'::character varying)::text, ('rejected'::character varying)::text, ('expired'::character varying)::text])))
);


--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_settings (
    id bigint NOT NULL,
    setting_key character varying(100) NOT NULL,
    setting_value jsonb NOT NULL,
    description text,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: system_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.system_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: system_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.system_settings_id_seq OWNED BY public.system_settings.id;


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id bigint NOT NULL,
    user_id uuid NOT NULL,
    role character varying(50) NOT NULL,
    granted_by uuid,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_roles_id_seq OWNED BY public.user_roles.id;


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_sessions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    token_hash character varying(255) NOT NULL,
    device_info jsonb,
    ip_address inet,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(20),
    password_hash character varying(255) NOT NULL,
    full_name character varying(255) NOT NULL,
    avatar_url text,
    role character varying(20) DEFAULT 'user'::character varying NOT NULL,
    email_verified boolean DEFAULT false,
    is_active boolean DEFAULT true,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY (ARRAY[('user'::character varying)::text, ('staff'::character varying)::text, ('admin'::character varying)::text, ('superadmin'::character varying)::text])))
);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: favorites id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites ALTER COLUMN id SET DEFAULT nextval('public.favorites_id_seq'::regclass);


--
-- Name: inquiry_messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiry_messages ALTER COLUMN id SET DEFAULT nextval('public.inquiry_messages_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: quotation_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotation_history ALTER COLUMN id SET DEFAULT nextval('public.quotation_history_id_seq'::regclass);


--
-- Name: system_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings ALTER COLUMN id SET DEFAULT nextval('public.system_settings_id_seq'::regclass);


--
-- Name: user_roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles ALTER COLUMN id SET DEFAULT nextval('public.user_roles_id_seq'::regclass);


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, user_id, action, target_table, target_id, old_values, new_values, ip_address, user_agent, created_at) FROM stdin;
1	53276888-2e16-44f5-bdb0-f310c6ba5b62	login	users	53276888-2e16-44f5-bdb0-f310c6ba5b62	\N	\N	\N	\N	2026-07-23 17:45:03+07
2	53276888-2e16-44f5-bdb0-f310c6ba5b62	login	users	53276888-2e16-44f5-bdb0-f310c6ba5b62	\N	\N	\N	\N	2026-07-23 17:47:58+07
3	53276888-2e16-44f5-bdb0-f310c6ba5b62	login	users	53276888-2e16-44f5-bdb0-f310c6ba5b62	\N	\N	\N	\N	2026-07-23 17:54:46+07
4	53276888-2e16-44f5-bdb0-f310c6ba5b62	login	users	53276888-2e16-44f5-bdb0-f310c6ba5b62	\N	\N	\N	\N	2026-07-23 17:55:23+07
5	26604887-450f-4ad3-81f5-56d25d5b6247	login	users	26604887-450f-4ad3-81f5-56d25d5b6247	\N	\N	\N	\N	2026-07-23 17:56:33+07
6	53276888-2e16-44f5-bdb0-f310c6ba5b62	login	users	53276888-2e16-44f5-bdb0-f310c6ba5b62	\N	\N	\N	\N	2026-07-23 21:54:42+07
7	53276888-2e16-44f5-bdb0-f310c6ba5b62	login	users	53276888-2e16-44f5-bdb0-f310c6ba5b62	\N	\N	\N	\N	2026-07-23 22:03:54+07
8	53276888-2e16-44f5-bdb0-f310c6ba5b62	login	users	53276888-2e16-44f5-bdb0-f310c6ba5b62	\N	\N	\N	\N	2026-07-23 22:35:41+07
9	26604887-450f-4ad3-81f5-56d25d5b6247	login	users	26604887-450f-4ad3-81f5-56d25d5b6247	\N	\N	\N	\N	2026-07-24 12:44:57+07
10	26604887-450f-4ad3-81f5-56d25d5b6247	login	users	26604887-450f-4ad3-81f5-56d25d5b6247	\N	\N	\N	\N	2026-07-24 12:48:07+07
11	53276888-2e16-44f5-bdb0-f310c6ba5b62	login	users	53276888-2e16-44f5-bdb0-f310c6ba5b62	\N	\N	\N	\N	2026-07-24 12:50:21+07
12	53276888-2e16-44f5-bdb0-f310c6ba5b62	login	users	53276888-2e16-44f5-bdb0-f310c6ba5b62	\N	\N	\N	\N	2026-07-24 13:08:56+07
13	26604887-450f-4ad3-81f5-56d25d5b6247	login	users	26604887-450f-4ad3-81f5-56d25d5b6247	\N	\N	\N	\N	2026-07-24 13:09:08+07
14	26604887-450f-4ad3-81f5-56d25d5b6247	update_user	users	53276888-2e16-44f5-bdb0-f310c6ba5b62	\N	\N	\N	\N	2026-07-24 13:09:25+07
15	26604887-450f-4ad3-81f5-56d25d5b6247	login	users	26604887-450f-4ad3-81f5-56d25d5b6247	\N	\N	\N	\N	2026-07-24 13:12:17+07
16	26604887-450f-4ad3-81f5-56d25d5b6247	login	users	26604887-450f-4ad3-81f5-56d25d5b6247	\N	\N	\N	\N	2026-07-24 13:19:16+07
17	53276888-2e16-44f5-bdb0-f310c6ba5b62	login	users	53276888-2e16-44f5-bdb0-f310c6ba5b62	\N	\N	\N	\N	2026-07-24 13:22:03+07
18	53276888-2e16-44f5-bdb0-f310c6ba5b62	login	users	53276888-2e16-44f5-bdb0-f310c6ba5b62	\N	\N	\N	\N	2026-07-24 13:22:22+07
19	26604887-450f-4ad3-81f5-56d25d5b6247	login	users	26604887-450f-4ad3-81f5-56d25d5b6247	\N	\N	\N	\N	2026-07-24 13:23:37+07
20	26604887-450f-4ad3-81f5-56d25d5b6247	login	users	26604887-450f-4ad3-81f5-56d25d5b6247	\N	\N	\N	\N	2026-07-24 13:23:54+07
21	26604887-450f-4ad3-81f5-56d25d5b6247	login	users	26604887-450f-4ad3-81f5-56d25d5b6247	\N	\N	\N	\N	2026-07-24 13:24:05+07
22	26604887-450f-4ad3-81f5-56d25d5b6247	login	users	26604887-450f-4ad3-81f5-56d25d5b6247	\N	\N	\N	\N	2026-07-24 13:25:13+07
23	26604887-450f-4ad3-81f5-56d25d5b6247	admin_login	users	26604887-450f-4ad3-81f5-56d25d5b6247	\N	\N	\N	\N	2026-07-24 14:05:41.412209+07
24	26604887-450f-4ad3-81f5-56d25d5b6247	admin_login	users	26604887-450f-4ad3-81f5-56d25d5b6247	\N	\N	\N	\N	2026-07-24 14:05:52.633435+07
25	26604887-450f-4ad3-81f5-56d25d5b6247	admin_login	users	26604887-450f-4ad3-81f5-56d25d5b6247	\N	\N	\N	\N	2026-07-24 14:05:55.859761+07
26	26604887-450f-4ad3-81f5-56d25d5b6247	admin_login	users	26604887-450f-4ad3-81f5-56d25d5b6247	\N	\N	\N	\N	2026-07-24 14:06:34.918452+07
27	26604887-450f-4ad3-81f5-56d25d5b6247	admin_login	users	26604887-450f-4ad3-81f5-56d25d5b6247	\N	\N	\N	\N	2026-07-24 14:06:55.544347+07
28	26604887-450f-4ad3-81f5-56d25d5b6247	admin_login	users	26604887-450f-4ad3-81f5-56d25d5b6247	\N	\N	\N	\N	2026-07-24 14:07:48.876263+07
29	26604887-450f-4ad3-81f5-56d25d5b6247	admin_login	users	26604887-450f-4ad3-81f5-56d25d5b6247	\N	\N	\N	\N	2026-07-24 14:08:18.417798+07
30	26604887-450f-4ad3-81f5-56d25d5b6247	login	users	26604887-450f-4ad3-81f5-56d25d5b6247	\N	\N	\N	\N	2026-07-24 14:11:22.432418+07
31	26604887-450f-4ad3-81f5-56d25d5b6247	admin_login	users	26604887-450f-4ad3-81f5-56d25d5b6247	\N	\N	\N	\N	2026-07-24 14:11:22.52509+07
32	26604887-450f-4ad3-81f5-56d25d5b6247	admin_login	users	26604887-450f-4ad3-81f5-56d25d5b6247	\N	\N	\N	\N	2026-07-24 14:11:34.580621+07
33	26604887-450f-4ad3-81f5-56d25d5b6247	login	users	26604887-450f-4ad3-81f5-56d25d5b6247	\N	\N	\N	\N	2026-07-24 14:11:57.421122+07
34	26604887-450f-4ad3-81f5-56d25d5b6247	admin_login	users	26604887-450f-4ad3-81f5-56d25d5b6247	\N	\N	\N	\N	2026-07-24 14:11:57.512565+07
35	26604887-450f-4ad3-81f5-56d25d5b6247	admin_login	users	26604887-450f-4ad3-81f5-56d25d5b6247	\N	\N	\N	\N	2026-07-24 14:14:36.329142+07
36	53276888-2e16-44f5-bdb0-f310c6ba5b62	login	users	53276888-2e16-44f5-bdb0-f310c6ba5b62	\N	\N	\N	\N	2026-07-27 11:07:55.961164+07
37	26604887-450f-4ad3-81f5-56d25d5b6247	admin_login	users	26604887-450f-4ad3-81f5-56d25d5b6247	\N	\N	\N	\N	2026-07-27 11:08:53.549916+07
38	26604887-450f-4ad3-81f5-56d25d5b6247	admin_login	users	26604887-450f-4ad3-81f5-56d25d5b6247	\N	\N	\N	\N	2026-07-27 11:11:39.820396+07
39	53276888-2e16-44f5-bdb0-f310c6ba5b62	login	users	53276888-2e16-44f5-bdb0-f310c6ba5b62	\N	\N	\N	\N	2026-07-27 11:41:16.389344+07
40	53276888-2e16-44f5-bdb0-f310c6ba5b62	login	users	53276888-2e16-44f5-bdb0-f310c6ba5b62	\N	\N	\N	\N	2026-07-27 11:42:34.787209+07
41	53276888-2e16-44f5-bdb0-f310c6ba5b62	login	users	53276888-2e16-44f5-bdb0-f310c6ba5b62	\N	\N	\N	\N	2026-07-27 12:33:54.803305+07
42	53276888-2e16-44f5-bdb0-f310c6ba5b62	login	users	53276888-2e16-44f5-bdb0-f310c6ba5b62	\N	\N	\N	\N	2026-07-27 12:34:08.886603+07
43	53276888-2e16-44f5-bdb0-f310c6ba5b62	login	users	53276888-2e16-44f5-bdb0-f310c6ba5b62	\N	\N	\N	\N	2026-07-27 13:18:50.612785+07
44	26604887-450f-4ad3-81f5-56d25d5b6247	admin_login	users	26604887-450f-4ad3-81f5-56d25d5b6247	\N	\N	\N	\N	2026-07-29 09:28:31.204131+07
45	53276888-2e16-44f5-bdb0-f310c6ba5b62	login	users	53276888-2e16-44f5-bdb0-f310c6ba5b62	\N	\N	\N	\N	2026-07-29 10:12:03.337628+07
46	26604887-450f-4ad3-81f5-56d25d5b6247	admin_login	users	26604887-450f-4ad3-81f5-56d25d5b6247	\N	\N	\N	\N	2026-07-29 10:25:10.750512+07
47	26604887-450f-4ad3-81f5-56d25d5b6247	admin_login	users	26604887-450f-4ad3-81f5-56d25d5b6247	\N	\N	\N	\N	2026-07-29 10:32:43.616729+07
48	26604887-450f-4ad3-81f5-56d25d5b6247	admin_login	users	26604887-450f-4ad3-81f5-56d25d5b6247	\N	\N	\N	\N	2026-07-29 10:32:47.262424+07
49	26604887-450f-4ad3-81f5-56d25d5b6247	admin_login	users	26604887-450f-4ad3-81f5-56d25d5b6247	\N	\N	\N	\N	2026-07-29 10:32:50.606733+07
50	26604887-450f-4ad3-81f5-56d25d5b6247	admin_login	users	26604887-450f-4ad3-81f5-56d25d5b6247	\N	\N	\N	\N	2026-07-29 16:05:05.94819+07
51	53276888-2e16-44f5-bdb0-f310c6ba5b62	login	users	53276888-2e16-44f5-bdb0-f310c6ba5b62	\N	\N	\N	\N	2026-07-29 16:05:24.22489+07
52	26604887-450f-4ad3-81f5-56d25d5b6247	admin_login	users	26604887-450f-4ad3-81f5-56d25d5b6247	\N	\N	\N	\N	2026-07-29 16:15:18.238575+07
53	26604887-450f-4ad3-81f5-56d25d5b6247	admin_login	users	26604887-450f-4ad3-81f5-56d25d5b6247	\N	\N	\N	\N	2026-07-29 16:24:52.175601+07
54	26604887-450f-4ad3-81f5-56d25d5b6247	admin_login	users	26604887-450f-4ad3-81f5-56d25d5b6247	\N	\N	\N	\N	2026-07-29 16:25:08.458248+07
55	26604887-450f-4ad3-81f5-56d25d5b6247	admin_login	users	26604887-450f-4ad3-81f5-56d25d5b6247	\N	\N	\N	\N	2026-07-29 16:41:18.116153+07
\.


--
-- Data for Name: banners; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.banners (id, title, subtitle, image_url, link, sort_order, is_active, start_date, end_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cart_items (id, user_id, session_id, product_id, quantity, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, parent_id, name, slug, description, image_url, sort_order, is_active, created_at, updated_at) FROM stdin;
059d9d35-0230-44a2-b171-bfa66c41b917	\N	Electronics	electronics	Phones, tablets, and accessories	\N	0	t	2026-07-22 12:23:41+07	2026-07-22 12:23:41+07
7ca35ac8-fc4a-4078-8c75-5e00031b1512	\N	Clothing	clothing	Men and women fashion	\N	0	t	2026-07-22 12:23:41+07	2026-07-22 12:23:41+07
5c5f2981-25d3-414a-9cfe-6625d5560646	\N	Home & Garden	home-garden	Furniture and home decor	\N	0	t	2026-07-22 12:23:41+07	2026-07-22 12:23:41+07
bcc138c6-1b22-4cb2-9b41-08f688b2cb23	\N	Sports	sports	Sports equipment and gear	\N	0	t	2026-07-22 12:23:41+07	2026-07-22 12:23:41+07
5295dd27-badf-417b-a492-f9891fc0af04	\N	Books	books	Physical and digital books	\N	0	t	2026-07-22 12:23:41+07	2026-07-22 12:23:41+07
\.


--
-- Data for Name: expense_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.expense_categories (id, name, description, created_at) FROM stdin;
ab62e5b7-112b-46e1-b06b-0670cf678293	Rent	Monthly rent	2026-07-21 21:44:35+07
ceb81ca0-d3d1-4442-b8ea-c3579111e098	Utilities	Electricity, water, internet	2026-07-21 21:44:35+07
44e7a0cd-e6ba-40a9-ab86-537c219b3303	Supplies	Office and store supplies	2026-07-21 21:44:35+07
e6dbf605-52cd-4d0d-b11a-6daa2d6cb8fd	Marketing	Advertising and promotions	2026-07-21 21:44:35+07
893a1b6e-15a4-45ca-b934-d7e4b4d45304	Transport	Delivery and logistics	2026-07-21 21:44:35+07
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.expenses (id, category_id, user_id, expense_date, amount, description, receipt_url, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.favorites (id, user_id, product_id, created_at) FROM stdin;
\.


--
-- Data for Name: inquiries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inquiries (id, subject, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: inquiry_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inquiry_messages (id, inquiry_id, sender_id, message, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, user_id, type, title, message, data, is_read, read_at, created_at) FROM stdin;
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_items (id, order_id, product_id, product_name, quantity, unit_price, subtotal, created_at) FROM stdin;
0b9b160f-6af6-4701-b5f3-12b9b30971e4	93d6c88a-112e-4cb2-9977-afdf08943f55	11e47c7c-11ee-4bbe-bf81-45a94e02ec36	Business Strategy 101	2	34.99	69.98	2026-07-22 12:29:37+07
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, order_number, user_id, status, payment_status, payment_method, subtotal, discount, tax_percent, tax_amount, shipping_fee, grand_total, currency, shipping_address, billing_address, notes, paid_at, shipped_at, delivered_at, created_at, updated_at, deleted_at) FROM stdin;
93d6c88a-112e-4cb2-9977-afdf08943f55	ORD-1784698177131	26604887-450f-4ad3-81f5-56d25d5b6247	pending	unpaid	\N	0.00	0.00	0.00	0.00	0.00	69.98	LAK	\N	\N	\N	\N	\N	\N	2026-07-22 12:29:37+07	2026-07-22 12:29:37+07	\N
\.


--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_images (id, product_id, image_url, alt_text, sort_order, is_primary, created_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, category_id, name, slug, sku, barcode, description, cost_price, selling_price, compare_price, stock, min_stock, unit, weight, images, features, is_featured, is_active, created_at, updated_at, deleted_at) FROM stdin;
47ee8455-fb24-4923-87d7-a7e2cd955367	\N	Test Product	test-product	TP001	\N	\N	50.00	99.99	0.00	100	0	pcs	\N	[]	{}	f	t	2026-07-22 12:23:16+07	2026-07-22 12:23:16+07	\N
33677a32-33ce-459e-817f-e4f9ec42821b	059d9d35-0230-44a2-b171-bfa66c41b917	iPhone 15 Pro Max	iphone-15-pro-max	IPH15PM	\N	Latest Apple smartphone with A17 Pro chip	999.00	1299.99	0.00	25	0	pcs	\N	[]	{}	t	t	2026-07-22 12:23:41+07	2026-07-22 12:23:41+07	\N
ec02f33d-5ed9-42d4-8dc5-36a1dd8d114b	059d9d35-0230-44a2-b171-bfa66c41b917	Samsung Galaxy S24	samsung-galaxy-s24	SGS24	\N	Samsung flagship with AI features	699.00	899.99	0.00	30	0	pcs	\N	[]	{}	t	t	2026-07-22 12:23:41+07	2026-07-22 12:23:41+07	\N
bf9cf888-cc33-4125-b855-a8184ce870f8	059d9d35-0230-44a2-b171-bfa66c41b917	MacBook Air M3	macbook-air-m3	MBA3	\N	Ultra-thin laptop with M3 chip	899.00	1099.99	0.00	15	0	pcs	\N	[]	{}	t	t	2026-07-22 12:23:41+07	2026-07-22 12:23:41+07	\N
a0d2e3ef-9c30-435f-bf94-77c1d1248522	059d9d35-0230-44a2-b171-bfa66c41b917	AirPods Pro 2	airpods-pro-2	APP2	\N	Active noise cancelling earbuds	179.99	249.99	0.00	50	0	pcs	\N	[]	{}	f	t	2026-07-22 12:23:41+07	2026-07-22 12:23:41+07	\N
b71f79af-c617-4dc5-be2a-6d2cfd8ea300	059d9d35-0230-44a2-b171-bfa66c41b917	USB-C Hub 7-in-1	usb-c-hub-7in1	USB7	\N	Multiport adapter for MacBook	19.99	39.99	0.00	100	0	pcs	\N	[]	{}	f	t	2026-07-22 12:23:41+07	2026-07-22 12:23:41+07	\N
c78a62db-ef42-40c9-8449-c70ad101a249	7ca35ac8-fc4a-4078-8c75-5e00031b1512	Classic Cotton T-Shirt	classic-cotton-tshirt	CCT01	\N	100% cotton casual t-shirt	10.00	24.99	0.00	200	0	pcs	\N	[]	{}	f	t	2026-07-22 12:23:41+07	2026-07-22 12:23:41+07	\N
7e9f5e51-87bc-42e6-9184-ce1794444a7d	7ca35ac8-fc4a-4078-8c75-5e00031b1512	Denim Jacket	denim-jacket	DJ01	\N	Vintage style denim jacket	40.00	79.99	0.00	50	0	pcs	\N	[]	{}	t	t	2026-07-22 12:23:41+07	2026-07-22 12:23:41+07	\N
ef8849cb-dc14-4374-a35d-907f94e942c3	7ca35ac8-fc4a-4078-8c75-5e00031b1512	Running Shoes Pro	running-shoes-pro	RSP01	\N	Lightweight running shoes	65.00	129.99	0.00	75	0	pcs	\N	[]	{}	f	t	2026-07-22 12:23:41+07	2026-07-22 12:23:41+07	\N
c5ed3df7-6b41-422d-b9f5-33548891cfcd	5c5f2981-25d3-414a-9cfe-6625d5560646	Ergonomic Office Chair	ergonomic-office-chair	EOC01	\N	Adjustable lumbar support chair	180.00	349.99	0.00	20	0	pcs	\N	[]	{}	t	t	2026-07-22 12:23:41+07	2026-07-22 12:23:41+07	\N
ffac1073-feae-45c7-b526-ac0bff9e8eb1	5c5f2981-25d3-414a-9cfe-6625d5560646	LED Desk Lamp	led-desk-lamp	LDL01	\N	Dimmable LED desk lamp with USB port	25.00	49.99	0.00	60	0	pcs	\N	[]	{}	f	t	2026-07-22 12:23:41+07	2026-07-22 12:23:41+07	\N
1aed088a-062b-4ae3-a909-4cd39c193f72	bcc138c6-1b22-4cb2-9b41-08f688b2cb23	Yoga Mat Premium	yoga-mat-premium	YMP01	\N	Non-slip exercise yoga mat	15.00	39.99	0.00	80	0	pcs	\N	[]	{}	f	t	2026-07-22 12:23:41+07	2026-07-22 12:23:41+07	\N
68ed210a-d924-4c25-9059-025f1aa1efff	bcc138c6-1b22-4cb2-9b41-08f688b2cb23	Adjustable Dumbbells	adjustable-dumbbells	AD01	\N	5-25 lb adjustable dumbbell set	100.00	199.99	0.00	30	0	pcs	\N	[]	{}	t	t	2026-07-22 12:23:41+07	2026-07-22 12:23:41+07	\N
c73518d7-8317-45d6-9fc5-14b3ae1da938	5295dd27-badf-417b-a492-f9891fc0af04	The Art of Code	the-art-of-code	TAOC	\N	Modern software engineering patterns	10.00	29.99	0.00	100	0	pcs	\N	[]	{}	f	t	2026-07-22 12:23:41+07	2026-07-22 12:23:41+07	\N
11e47c7c-11ee-4bbe-bf81-45a94e02ec36	5295dd27-badf-417b-a492-f9891fc0af04	Business Strategy 101	business-strategy-101	BS101	\N	Essential business strategy guide	12.00	34.99	0.00	60	0	pcs	\N	[]	{}	f	t	2026-07-22 12:23:41+07	2026-07-22 12:23:41+07	\N
\.


--
-- Data for Name: promotions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.promotions (id, title, description, image_url, link, discount_type, discount_value, min_purchase, max_uses, current_uses, is_active, start_date, end_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: quotation_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quotation_history (id, quotation_id, action, old_status, new_status, performed_by, notes, created_at) FROM stdin;
\.


--
-- Data for Name: quotation_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quotation_items (id, quotation_id, product_id, product_name, quantity, unit, unit_price, amount, created_at) FROM stdin;
\.


--
-- Data for Name: quotations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quotations (id, quotation_number, user_id, ref_no, date, expiry_date, subtotal, discount, tax_percent, grand_total, status, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.system_settings (id, setting_key, setting_value, description, updated_by, created_at, updated_at) FROM stdin;
1	store_name	"My Store"	Store display name	\N	2026-07-21 21:44:35+07	2026-07-21 21:44:35+07
2	store_phone	"+856 20 00 000 000"	Store contact phone	\N	2026-07-21 21:44:35+07	2026-07-21 21:44:35+07
3	currency	"LAK"	Default currency	\N	2026-07-21 21:44:35+07	2026-07-21 21:44:35+07
4	tax_percent	7	Default tax rate	\N	2026-07-21 21:44:35+07	2026-07-21 21:44:35+07
5	store_logo	""	Store logo URL	\N	2026-07-21 21:44:35+07	2026-07-21 21:44:35+07
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_roles (id, user_id, role, granted_by, created_at) FROM stdin;
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_sessions (id, user_id, token_hash, device_info, ip_address, expires_at, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, phone, password_hash, full_name, avatar_url, role, email_verified, is_active, last_login_at, created_at, updated_at, deleted_at) FROM stdin;
74b0cd37-4c14-49fc-b02b-967125c912ce	test@example.com	12345	$2a$10$2tgW58n8o7v09fZ5CGcdT.7NXb9177e5r9jPlJwSWNdhAw4KUb4Da	Test User	\N	user	f	t	\N	2026-07-22 12:29:36+07	2026-07-22 12:29:36+07	\N
26604887-450f-4ad3-81f5-56d25d5b6247	admin@template.com	\N	$2a$10$Kyyc.xHcYDoD1A8O//VsY.fHH7/TtsScyi4v6129G7hw5LFe8PAQu	Admin User	\N	superadmin	t	t	\N	2026-07-22 12:08:43+07	2026-07-22 12:08:43+07	\N
53276888-2e16-44f5-bdb0-f310c6ba5b62	souliyapps@gmail.com	+8562078287500	$2a$10$pexz1XbE0gNdPOctNJ7K4Osg2uEC7239UPWlw7BUvPlB3A2z50y0y	souliya pps	\N	user	f	t	\N	2026-07-22 12:16:34+07	2026-07-28 18:00:36.022197+07	\N
\.


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 55, true);


--
-- Name: favorites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.favorites_id_seq', 1, false);


--
-- Name: inquiry_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.inquiry_messages_id_seq', 1, false);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: quotation_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quotation_history_id_seq', 1, false);


--
-- Name: system_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.system_settings_id_seq', 5, true);


--
-- Name: user_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_roles_id_seq', 1, false);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: banners banners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banners
    ADD CONSTRAINT banners_pkey PRIMARY KEY (id);


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- Name: expense_categories expense_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_categories
    ADD CONSTRAINT expense_categories_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_user_id_product_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_product_id_key UNIQUE (user_id, product_id);


--
-- Name: inquiries inquiries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiries
    ADD CONSTRAINT inquiries_pkey PRIMARY KEY (id);


--
-- Name: inquiry_messages inquiry_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiry_messages
    ADD CONSTRAINT inquiry_messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_sku_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key UNIQUE (sku);


--
-- Name: products products_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key UNIQUE (slug);


--
-- Name: promotions promotions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_pkey PRIMARY KEY (id);


--
-- Name: quotation_history quotation_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotation_history
    ADD CONSTRAINT quotation_history_pkey PRIMARY KEY (id);


--
-- Name: quotation_items quotation_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotation_items
    ADD CONSTRAINT quotation_items_pkey PRIMARY KEY (id);


--
-- Name: quotations quotations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_pkey PRIMARY KEY (id);


--
-- Name: quotations quotations_quotation_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_quotation_number_key UNIQUE (quotation_number);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_setting_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_setting_key_key UNIQUE (setting_key);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_audit_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_created ON public.audit_logs USING btree (created_at DESC);


--
-- Name: idx_audit_target; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_target ON public.audit_logs USING btree (target_table, target_id);


--
-- Name: idx_audit_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_user ON public.audit_logs USING btree (user_id);


--
-- Name: idx_cart_session; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cart_session ON public.cart_items USING btree (session_id);


--
-- Name: idx_cart_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cart_user ON public.cart_items USING btree (user_id);


--
-- Name: idx_categories_parent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_categories_parent ON public.categories USING btree (parent_id);


--
-- Name: idx_categories_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_categories_slug ON public.categories USING btree (slug);


--
-- Name: idx_expenses_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_expenses_category ON public.expenses USING btree (category_id);


--
-- Name: idx_expenses_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_expenses_date ON public.expenses USING btree (expense_date);


--
-- Name: idx_favorites_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_favorites_user ON public.favorites USING btree (user_id);


--
-- Name: idx_inquiry_messages_inquiry; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inquiry_messages_inquiry ON public.inquiry_messages USING btree (inquiry_id);


--
-- Name: idx_notifications_unread; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_unread ON public.notifications USING btree (user_id, is_read) WHERE (is_read = false);


--
-- Name: idx_notifications_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id);


--
-- Name: idx_order_items_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_items_order ON public.order_items USING btree (order_id);


--
-- Name: idx_order_items_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_items_product ON public.order_items USING btree (product_id);


--
-- Name: idx_orders_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_created ON public.orders USING btree (created_at DESC);


--
-- Name: idx_orders_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_number ON public.orders USING btree (order_number);


--
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- Name: idx_orders_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_user ON public.orders USING btree (user_id);


--
-- Name: idx_product_images_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_images_product ON public.product_images USING btree (product_id);


--
-- Name: idx_products_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_category ON public.products USING btree (category_id);


--
-- Name: idx_products_featured; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_featured ON public.products USING btree (is_featured) WHERE (is_featured = true);


--
-- Name: idx_products_sku; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_sku ON public.products USING btree (sku);


--
-- Name: idx_products_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_slug ON public.products USING btree (slug);


--
-- Name: idx_quotation_items_quotation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quotation_items_quotation ON public.quotation_items USING btree (quotation_id);


--
-- Name: idx_sessions_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessions_token ON public.user_sessions USING btree (token_hash);


--
-- Name: idx_sessions_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessions_user ON public.user_sessions USING btree (user_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_phone ON public.users USING btree (phone);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: cart_items cart_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: cart_items cart_items_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: expenses expenses_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.expense_categories(id) ON DELETE SET NULL;


--
-- Name: expenses expenses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: favorites favorites_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: favorites favorites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: inquiry_messages inquiry_messages_inquiry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiry_messages
    ADD CONSTRAINT inquiry_messages_inquiry_id_fkey FOREIGN KEY (inquiry_id) REFERENCES public.inquiries(id) ON DELETE CASCADE;


--
-- Name: inquiry_messages inquiry_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiry_messages
    ADD CONSTRAINT inquiry_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: quotation_history quotation_history_performed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotation_history
    ADD CONSTRAINT quotation_history_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: quotation_history quotation_history_quotation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotation_history
    ADD CONSTRAINT quotation_history_quotation_id_fkey FOREIGN KEY (quotation_id) REFERENCES public.quotations(id) ON DELETE CASCADE;


--
-- Name: quotation_items quotation_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotation_items
    ADD CONSTRAINT quotation_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- Name: quotation_items quotation_items_quotation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotation_items
    ADD CONSTRAINT quotation_items_quotation_id_fkey FOREIGN KEY (quotation_id) REFERENCES public.quotations(id) ON DELETE CASCADE;


--
-- Name: quotations quotations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: system_settings system_settings_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_roles user_roles_granted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_sessions user_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict NOcB0Eg0dmWCPmRk9anQQ5RbrJmXm3LKlqZb9knD9kDgfdTK0nathouhy3gObWf

