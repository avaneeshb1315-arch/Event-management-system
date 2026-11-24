CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    role          VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER'
                  CHECK (role IN ('CUSTOMER','ADMIN')),
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);