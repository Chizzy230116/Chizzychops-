-- ════════════════════════════════════════════════════════════════
-- CHIZZYCHOPS — FULL DATABASE RESET + FRESH SEED
-- Run this on your VPS database (myappdb @ 192.3.236.42)
-- This wipes EVERYTHING and rebuilds clean from scratch.
-- ════════════════════════════════════════════════════════════════

-- ── STEP 1: DROP EVERYTHING ──────────────────────────────────────
DROP TABLE IF EXISTS "catering_submissions" CASCADE;
DROP TABLE IF EXISTS "review_submissions"   CASCADE;
DROP TABLE IF EXISTS "contact_submissions"  CASCADE;
DROP TABLE IF EXISTS "orders"               CASCADE;
DROP TABLE IF EXISTS "menu_items"           CASCADE;
DROP TYPE  IF EXISTS "OrderStatus"          CASCADE;
DROP SEQUENCE IF EXISTS orders_id_seq;

-- ── STEP 2: RECREATE TABLES ───────────────────────────────────────

CREATE TABLE "menu_items" (
    "id"          SERIAL            NOT NULL,
    "name"        TEXT              NOT NULL,
    "price"       DOUBLE PRECISION  NOT NULL,
    "category"    TEXT              NOT NULL,
    "subcat"      TEXT,
    "description" TEXT              NOT NULL DEFAULT '',
    "badge"       TEXT,
    "badge_color" TEXT,
    "note"        TEXT,
    "img_url"     TEXT,
    "img2_url"    TEXT,
    "sort_order"  INTEGER           NOT NULL DEFAULT 99,
    "updated_at"  TIMESTAMPTZ(6)    NOT NULL DEFAULT NOW(),
    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

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

CREATE TABLE "contact_submissions" (
    "id"         SERIAL         NOT NULL,
    "name"       TEXT           NOT NULL,
    "phone"      TEXT           NOT NULL,
    "email"      TEXT,
    "message"    TEXT           NOT NULL,
    "type"       TEXT           NOT NULL DEFAULT 'contact',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    CONSTRAINT "contact_submissions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "review_submissions" (
    "id"          SERIAL         NOT NULL,
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

CREATE TABLE "catering_submissions" (
    "id"         SERIAL         NOT NULL,
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

-- ── STEP 3: SEED ALL 42 MENU ITEMS ───────────────────────────────
-- id is SERIAL — auto-generated, do not insert manually
-- NULL img_url = no image yet, add later via admin panel

INSERT INTO "menu_items"
  ("name","price","category","subcat","description","badge","badge_color","note","img_url","img2_url","sort_order")
VALUES

-- ── SOUPS ──────────────────────────────────────────────────────────────────
('Egusi Soup',         35000, 'Soups', NULL,
 'Rich ground melon seed soup with assorted meats & stockfish. Served in a generous 2L bowl.',
 '2L Bowl', NULL, NULL, '/soup/egusi.jpg', NULL, 1),

('Oha Soup',           35000, 'Soups', NULL,
 'Delicate Igbo soup made with fresh oha leaves, cocoyam, and assorted proteins.',
 '2L Bowl', NULL, NULL, '/soup/oha-1.jpg', '/soup/oha-2.jpg', 2),

('Bitterleaf Soup',    35000, 'Soups', NULL,
 'Classic wrung bitterleaf soup with cocoyam, palm oil and assorted meat.',
 '2L Bowl', NULL, NULL, '/soup/bitterleaf.jpg', NULL, 3),

('Ogbono Soup',        35000, 'Soups', NULL,
 'Sticky, flavourful draw soup made from ground ogbono seeds with leafy vegetables.',
 '2L Bowl', NULL, NULL, '/soup/ogbono.jpg', NULL, 4),

('Uziza Soup',         35000, 'Soups', NULL,
 'Aromatic pepper soup with uziza leaves and a blend of traditional spices.',
 '2L Bowl', NULL, NULL, '/soup/uziza.jpg', NULL, 5),

('Banga Soup',         35000, 'Soups', NULL,
 'Delta-style palm nut soup with its distinct sweet-spicy flavour profile.',
 '2L Bowl', NULL, NULL, '/soup/banga.jpg', NULL, 6),

('Eforiro',            35000, 'Soups', NULL,
 'Yoruba mixed vegetable soup with fluted pumpkin, locust beans and assorted meat.',
 '2L Bowl', NULL, NULL, '/soup/eforiro-1.jpg', '/soup/eforiro-2.jpg', 7),

('Afang Soup',         37000, 'Soups', NULL,
 'Cross River prized soup with afang leaves, waterleaf, and periwinkle.',
 '2L Bowl', '#8B5CF6', NULL, '/soup/afang.jpg', NULL, 8),

('Edikang Ikong',      37000, 'Soups', NULL,
 'Premium Nigerian vegetable soup with ugu and waterleaf. Rich, thick and deeply satisfying.',
 '2L Bowl', '#8B5CF6', NULL, '/soup/edikang-ikong.jpg', '/food/edikang-ikong-2.jpg', 9),

('Black Soup',         35000, 'Soups', NULL,
 'Unique Edo black soup made from orogbo and efinrin leaves with a bold earthy taste.',
 '2L Bowl', NULL, NULL, '/soup/black-soup.jpg', NULL, 10),

('Atama Soup',         40000, 'Soups', NULL,
 'Ibibio specialty soup with atama leaves and fresh palm nut extract.',
 '2L Bowl', '#D97706', NULL, '/soup/atama.jpg', NULL, 11),

('Nsala (White Soup)', 40000, 'Soups', NULL,
 'Light, peppery Anambra soup made without palm oil. Perfect with fufu or pounded yam.',
 '2L Bowl', '#D97706', NULL, '/soup/nsala.jpg', NULL, 12),

('Ofe Owerri',         65000, 'Soups', NULL,
 'Premium Imo State soup — a luxurious blend of oha, cocoyam and assorted meats.',
 'Premium', '#DC2626', NULL, '/soup/ofe-owerri.jpg', NULL, 13),

('Seafood Okro',       70000, 'Soups', NULL,
 'Our showstopper — loaded okro soup with prawns, crab, fish, and calamari.',
 'Signature', '#DC2626', NULL, '/soup/seafood-okro.jpg', '/soup/okra.jpg', 14),

-- ── STEWS ──────────────────────────────────────────────────────────────────
('Chicken Stew',       30000, 'Stews', NULL,
 'Rich tomato-based stew slow-cooked with succulent pieces of chicken. 2L bowl.',
 '2L Bowl', NULL, NULL, '/stew/chicken-stew-1.jpg', '/stew/chicken-stew-2.jpg', 15),

('Beef Stew',          30000, 'Stews', NULL,
 'Classic Nigerian beef stew with blended tomatoes and aromatic spices. 2L bowl.',
 '2L Bowl', NULL, NULL, '/stew/beef-stew-1.jpg', '/stew/beef-stew-2.jpg', 16),

('Fish Stew',          35000, 'Stews', NULL,
 'Tomato-based stew with fresh, well-seasoned fish pieces. 2L bowl.',
 '2L Bowl', NULL, NULL, '/stew/fish-stew-1.jpg', NULL, 17),

('Ofada Sauce',        45000, 'Stews', NULL,
 'Authentic Ofada sauce with ayamase pepper blend. Perfect with ofada rice. 2L bowl.',
 'Fan Fav', '#F97316', NULL, '/stew/ofada-sauce-1.jpg', '/stew/ofada-sauce-2.jpg', 18),

('Ofe Akwu (Banga)',   35000, 'Stews', NULL,
 'Palm nut stew Urhobo style — great with boiled rice or yam. 2L bowl.',
 '2L Bowl', NULL, NULL, '/stew/ofe-akwu-1.jpg', NULL, 19),

-- ── RICE & POTTAGE ─────────────────────────────────────────────────────────
('Smokey Jollof Rice (3L)', 22000, 'Rice & Pottage', NULL,
 'Our signature smokey party jollof — 3 litres with 5 pcs beef/chicken included.',
 'Bestseller', '#F97316', 'Includes 5pcs beef/chicken',
 '/food/smokey-jollof.jpg', '/food/jollof-rice-bowl.jpg', 20),

('Smokey Jollof Rice (5L)', 35000, 'Rice & Pottage', NULL,
 'Party size jollof rice — 5 litres with 5 pcs beef/chicken. Feeds a crowd.',
 'Party Size', '#8B5CF6', 'Includes 5pcs beef/chicken',
 '/food/jollof-rice-bowl.jpg', '/food/smokey-jollof.jpg', 21),

('Fried Rice (3L)',    28000, 'Rice & Pottage', NULL,
 'Wok-fried Nigerian fried rice loaded with vegetables and protein. 3 litres.',
 NULL, NULL, 'Includes 5pcs beef/chicken',
 '/food/fried-rice-1.jpg', '/food/fried-rice-2.jpg', 22),

('Fried Rice (5L)',    40000, 'Rice & Pottage', NULL,
 'Large portion wok-fried rice for events. 5 litres with protein.',
 'Party Size', '#8B5CF6', 'Includes 5pcs beef/chicken',
 '/food/fried-rice-2.jpg', '/food/fried-rice-1.jpg', 23),

('Eddy''s Pottage (3L)', 15000, 'Rice & Pottage', NULL,
 'Our chef''s signature yam pottage — 3 litres, slow-cooked with panla fish.',
 'Chef Special', '#D97706', 'Includes 5pcs panla fish',
 NULL, NULL, 24),

-- ── PASTA & RICE ───────────────────────────────────────────────────────────
('Creamy Chicken Pasta',       12000, 'Pasta & Rice', 'Pasta',
 'Silky cream sauce, perfectly seasoned chicken — Italian comfort with Nigerian soul.',
 'Popular', '#F97316', NULL,
 '/food/creamy-chicken-pasta-1.jpg', '/food/creamy-chicken-pasta-2.jpg', 25),

('Nigerian Jollof Spaghetti',   9000, 'Pasta & Rice', 'Pasta',
 'Smokey jollof-seasoned spaghetti with juicy chicken on the side.',
 NULL, NULL, NULL,
 '/food/jollof-spag-1.jpg', '/food/jollof-spag-2.jpg', 26),

('Shrimp Pasta',               15000, 'Pasta & Rice', 'Pasta',
 'Plump shrimp in a rich buttery sauce over perfectly cooked pasta.',
 NULL, NULL, NULL,
 '/food/shrimp-pasta-1.jpg', '/food/shrimp-pasta-2.jpg', 27),

('Asun Pasta',                 12000, 'Pasta & Rice', 'Pasta',
 'Smokey peppered goat meat tossed with pasta — bold Lagos flavours.',
 'Spicy 🌶', '#DC2626', NULL,
 '/food/asun-pasta-1.jpg', '/food/asun-pasta-2.jpg', 28),

('Basmati Jollof Rice',         9000, 'Pasta & Rice', 'Rice',
 'Aromatic long-grain basmati in signature jollof sauce with chicken.',
 NULL, NULL, NULL,
 '/food/basmati-jollof.jpg', '/food/jollof-rice-bowl.jpg', 29),

('Special Basmati Fried Rice', 12000, 'Pasta & Rice', 'Rice',
 'Wok-tossed basmati with mixed vegetables, egg and chicken.',
 NULL, NULL, NULL,
 '/food/basmati-fried-rice.jpg', '/food/seafood-fried-rice.jpg', 30),

('Basmati Coconut Rice',       12000, 'Pasta & Rice', 'Rice',
 'Creamy coconut-infused basmati with perfectly seasoned chicken.',
 NULL, NULL, NULL,
 '/food/coconut-rice.jpg', '/food/basmati-rice.jpg', 31),

('Native Nigerian Rice',        9000, 'Pasta & Rice', 'Rice',
 'Traditional ofada-style rice with rich palm oil sauce and assorted.',
 NULL, NULL, NULL,
 '/food/native-rice.jpg', NULL, 32),

('Spicy Asun Rice',             9000, 'Pasta & Rice', 'Rice',
 'Jollof rice crowned with smoky peppered asun goat meat.',
 'Spicy 🌶', '#DC2626', NULL,
 '/food/spicy-asun-rice.jpg', '/food/asun-rice.jpg', 33),

-- ── FOOD BOXES ─────────────────────────────────────────────────────────────
('Classic Box',          15000, 'Food Boxes', NULL,
 'A hearty classic box — your choice of protein with rice or swallow and a side.',
 NULL, NULL, NULL,
 NULL, NULL, 34),

('Deluxe Box',           30000, 'Food Boxes', NULL,
 'Premium proteins, extra sides and a refreshing drink included.',
 'Popular', '#F97316', NULL,
 '/package/deluxe-box-1.jpg', NULL, 35),

('Premium Box',          45000, 'Food Boxes', NULL,
 'Our finest box — large portions, premium cuts, dessert included.',
 'Best Value', '#D97706', NULL,
 NULL, NULL, 36),

('Breakfast Box',        28000, 'Food Boxes', NULL,
 'Start your morning right — eggs, bread, sausage, plantain and fresh juice.',
 'Morning ☀️', '#F59E0B', NULL,
 NULL, NULL, 37),

('Treat Box',            20000, 'Food Boxes', NULL,
 'Special curated box — perfect for gifting or treating yourself.',
 NULL, NULL, NULL,
 NULL, NULL, 38),

('Moimoi in Leaves (12pcs)', 18000, 'Food Boxes', NULL,
 '12 pieces of authentic leaf-wrapped moimoi with egg or fish inside.',
 NULL, NULL, 'With egg or fish',
 '/package/moimoi-1.jpg', NULL, 39),

('Lunch Pack – Mini',     4500, 'Food Boxes', NULL,
 'Mini lunch pack — great for office orders. Minimum 6 packs.',
 'Bulk Order', NULL, 'Min. 6 packs',
 '/package/lunch-mini-1.jpg', NULL, 40),

('Lunch Pack – Regular',  7000, 'Food Boxes', NULL,
 'Regular lunch pack with satisfying portions. Minimum 6 packs.',
 'Bulk Order', NULL, 'Min. 6 packs',
 NULL, NULL, 41),

('Small Chops Pack',      3500, 'Food Boxes', NULL,
 'Assorted small chops — puff puff, spring rolls, samosa. Min. 6 packs.',
 NULL, NULL, 'Min. 6 packs',
 NULL, NULL, 42);

-- ── STEP 4: VERIFY ───────────────────────────────────────────────
SELECT category, COUNT(*) AS count
FROM "menu_items"
GROUP BY category
ORDER BY MIN(sort_order);

SELECT COUNT(*) AS total FROM "menu_items";