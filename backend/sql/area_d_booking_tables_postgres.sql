-- Area D: Booking, Payments and Check-in tables (PostgreSQL)
-- Owner: Rishvanth R
-- Foreign keys and indexes are added after the Area A and B tables exist.

CREATE TABLE IF NOT EXISTS bookings (
  id            UUID          PRIMARY KEY,
  booking_ref   VARCHAR(30)   NOT NULL UNIQUE,
  show_id       UUID          NOT NULL,
  user_id       UUID          NOT NULL,
  status        VARCHAR(12)   NOT NULL DEFAULT 'PENDING'
                CHECK (status IN ('PENDING','CONFIRMED','CHECKED_IN','CANCELLED','FAILED')),
  total_amount  NUMERIC(10,2) NOT NULL,
  qr_token      TEXT,
  expires_at    TIMESTAMP     NOT NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  confirmed_at  TIMESTAMP,
  checked_in_at TIMESTAMP,
  cancelled_at  TIMESTAMP
);

CREATE TABLE IF NOT EXISTS booking_seats (
  booking_id        UUID          NOT NULL,
  show_seat_id      UUID          NOT NULL,
  price_at_booking  NUMERIC(10,2) NOT NULL,
  PRIMARY KEY (booking_id, show_seat_id)
);

CREATE TABLE IF NOT EXISTS payments (
  id                  UUID          PRIMARY KEY,
  booking_id          UUID          NOT NULL,
  gateway_ref         VARCHAR(64)   NOT NULL UNIQUE,
  gateway_payment_id  VARCHAR(64),
  status              VARCHAR(10)   NOT NULL DEFAULT 'PENDING'
                      CHECK (status IN ('PENDING','SUCCESS','FAILED','REFUNDED')),
  amount              NUMERIC(10,2) NOT NULL,
  refunded_amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
  gateway_refund_id   VARCHAR(64),
  created_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);