-- ============================================================
-- CHIZZYCHOPS FRESH MIGRATION
-- Drop all existing tables + types, then recreate clean.
-- Run this on a fresh or existing database.
-- ============================================================

DROP TABLE IF EXISTS "catering_submissions" CASCADE;
DROP TABLE IF EXISTS "review_submissions"   CASCADE;
DROP TABLE IF EXISTS "contact_submissions"  CASCADE;
DROP TABLE IF EXISTS "orders"               CASCADE;
DROP TABLE IF EXISTS "menu_items"           CASCADE;
DROP TYPE  IF EXISTS "OrderStatus"          CASCADE;
DROP SEQUENCE IF EXISTS orders_id_seq;
DROP SEQUENCE IF EXISTS contact_id_seq;
DROP SEQUENCE IF EXISTS review_id_seq;
DROP SEQUENCE IF EXISTS catering_id_seq;

-- ── MENU ITEMS ────────────────────────────────────────────
CREATE TABLE "menu_items" (
    "id"          TEXT              NOT NULL,
    "name"        TEXT              NOT NULL,
    "price"       DOUBLE PRECISION  NOT NULL,
    "category"    TEXT              NOT NULL,
    "subcat"      TEXT,
    "description" TEXT              NOT NULL DEFAULT '',
    "badge"       TEXT,
    "badge_color" TEXT,
    "note"        TEXT,
    "img_url"     TEXT              NOT NULL DEFAULT '',
    "img2_url"    TEXT,
    "sort_order"  INTEGER           NOT NULL DEFAULT 99,
    "updated_at"  TIMESTAMPTZ(6)    NOT NULL DEFAULT NOW(),
    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- ── ORDERS ────────────────────────────────────────────────
CREATE SEQUENCE orders_id_seq START 1000;

CREATE TABLE "orders" (
    "id"               TEXT           NOT NULL DEFAULT ('ORD-' || LPAD(nextval('orders_id_seq')::TEXT, 6, '0')),
    "reference"        TEXT           NOT NULL DEFAULT ('REF-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 10))),
    "customer_name"    TEXT           NOT NULL DEFAULT '',
    "customer_email"   TEXT           NOT NULL DEFAULT '',
    "customer_phone"   TEXT           NOT NULL DEFAULT '',
    "delivery_address" TEXT           NOT NULL DEFAULT '',
    "items"            JSONB          NOT NULL DEFAULT '[]',
    "subtotal"         INTEGER        NOT NULL DEFAULT 0,
    "delivery_fee"     INTEGER        NOT NULL DEFAULT 0,
    "total"            INTEGER        NOT NULL DEFAULT 0,
    "status"           TEXT           NOT NULL DEFAULT 'pending',
    "paystack_data"    JSONB,
    "whatsapp_sent"    BOOLEAN        NOT NULL DEFAULT false,
    "note"             TEXT,
    "created_at"       TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    "updated_at"       TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "orders_reference_key" ON "orders"("reference");
CREATE INDEX        "orders_reference_idx" ON "orders"("reference");
CREATE INDEX        "orders_status_idx"    ON "orders"("status");
CREATE INDEX        "orders_created_idx"   ON "orders"("created_at" DESC);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER orders_updated_at
    BEFORE UPDATE ON "orders"
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER menu_items_updated_at
    BEFORE UPDATE ON "menu_items"
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── CONTACT SUBMISSIONS ───────────────────────────────────
CREATE SEQUENCE contact_id_seq START 1;

CREATE TABLE "contact_submissions" (
    "id"         TEXT           NOT NULL DEFAULT ('MSG-' || LPAD(nextval('contact_id_seq')::TEXT, 5, '0')),
    "name"       TEXT           NOT NULL,
    "phone"      TEXT           NOT NULL,
    "email"      TEXT,
    "message"    TEXT           NOT NULL,
    "type"       TEXT           NOT NULL DEFAULT 'contact',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    CONSTRAINT "contact_submissions_pkey" PRIMARY KEY ("id")
);

-- ── REVIEW SUBMISSIONS ────────────────────────────────────
CREATE SEQUENCE review_id_seq START 1;

CREATE TABLE "review_submissions" (
    "id"          TEXT           NOT NULL DEFAULT ('REV-' || LPAD(nextval('review_id_seq')::TEXT, 5, '0')),
    "name"        TEXT           NOT NULL,
    "dish"        TEXT           NOT NULL,
    "overall"     INTEGER        NOT NULL,
    "taste"       INTEGER        NOT NULL DEFAULT 0,
    "portion"     INTEGER        NOT NULL DEFAULT 0,
    "delivery"    INTEGER        NOT NULL DEFAULT 0,
    "packaging"   INTEGER        NOT NULL DEFAULT 0,
    "value"       INTEGER        NOT NULL DEFAULT 0,
    "recommend"   BOOLEAN        NOT NULL DEFAULT true,
    "review_text" TEXT           NOT NULL,
    "type"        TEXT           NOT NULL DEFAULT 'review',
    "created_at"  TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    CONSTRAINT "review_submissions_pkey" PRIMARY KEY ("id")
);

-- ── CATERING SUBMISSIONS ──────────────────────────────────
CREATE SEQUENCE catering_id_seq START 1;

CREATE TABLE "catering_submissions" (
    "id"         TEXT           NOT NULL DEFAULT ('CAT-' || LPAD(nextval('catering_id_seq')::TEXT, 5, '0')),
    "name"       TEXT           NOT NULL,
    "phone"      TEXT           NOT NULL,
    "event_date" TEXT           NOT NULL,
    "guests"     TEXT           NOT NULL,
    "event_type" TEXT           NOT NULL DEFAULT '',
    "notes"      TEXT           NOT NULL DEFAULT '',
    "type"       TEXT           NOT NULL DEFAULT 'catering',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    CONSTRAINT "catering_submissions_pkey" PRIMARY KEY ("id")
);