-- Drop old case-sensitive tables if they exist (run once)
DROP TABLE IF EXISTS "Account" CASCADE;
DROP TABLE IF EXISTS "Order"   CASCADE;
DROP TABLE IF EXISTS "Trade"   CASCADE;
DROP TABLE IF EXISTS "Position" CASCADE;
DROP TABLE IF EXISTS "Instrument" CASCADE;
DELETE FROM accounts 
WHERE email IN ('test123', 'Test@1234', 'RETAIL', 'QUANT', 'INSTITUTIONAL');

-- accounts
CREATE TABLE IF NOT EXISTS accounts (
    id            TEXT PRIMARY KEY,
    username      TEXT UNIQUE,
    name          TEXT,
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'TRADER',
    balance       DOUBLE PRECISION NOT NULL DEFAULT 0,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    last_login    TIMESTAMP,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE
);

-- orders
CREATE TABLE IF NOT EXISTS orders (
    id            TEXT PRIMARY KEY,
    account_id    TEXT NOT NULL REFERENCES accounts(id),
    instrument_id TEXT NOT NULL,
    type          TEXT NOT NULL,
    price         DOUBLE PRECISION NOT NULL,
    quantity      BIGINT NOT NULL,
    status        TEXT NOT NULL DEFAULT 'PENDING',
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- trades
CREATE TABLE IF NOT EXISTS trades (
    id              TEXT PRIMARY KEY,
    instrument_id   TEXT NOT NULL,
    buy_account_id  TEXT NOT NULL,
    sell_account_id TEXT NOT NULL,
    buy_order_id    TEXT NOT NULL,
    sell_order_id   TEXT NOT NULL,
    price           DECIMAL(20,8) NOT NULL,
    quantity        BIGINT NOT NULL,
    traded_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_trade_instrument_time ON trades(instrument_id, traded_at DESC);

-- positions
CREATE TABLE IF NOT EXISTS positions (
    id              TEXT PRIMARY KEY,
    account_id      TEXT NOT NULL REFERENCES accounts(id),
    instrument_id   TEXT NOT NULL,
    quantity        BIGINT NOT NULL,
    average_price   DOUBLE PRECISION NOT NULL,
    unrealized_pnl  DOUBLE PRECISION NOT NULL DEFAULT 0,
    UNIQUE(account_id, instrument_id)
);

-- instruments
CREATE TABLE IF NOT EXISTS instruments (
    id        TEXT PRIMARY KEY,
    name      TEXT NOT NULL,
    exchange  TEXT NOT NULL,
    type      TEXT NOT NULL,
    tick_size DOUBLE PRECISION NOT NULL,
    lot_size  BIGINT NOT NULL
);

ALTER TABLE accounts ALTER COLUMN created_at SET DEFAULT NOW();

DELETE FROM accounts WHERE email IN ('test123', 'Test@1234', 'RETAIL', 'QUANT', 'INSTITUTIONAL');

INSERT INTO accounts (id, username, name, email, password_hash, role, balance, created_at, is_active)
VALUES (
    'test-user-001',
    'testuser',
    'Test User',
    'testuser@example.com',
    '$2a$12$k9.9GRmDG.ZhRknvpGHiAuH6JO3ZH.qb1GiHwx.X.K6CyHEhZC6Fi',
    'QUANT',
    0.0,
    NOW(),
    TRUE
) ON CONFLICT (email) DO NOTHING;