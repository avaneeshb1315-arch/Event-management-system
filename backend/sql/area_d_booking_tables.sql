-- Area D: Booking, Payments and Check-in tables
-- Owner: Rishvanth R
-- Foreign keys and indexes are added in Round 2 (after Area A and B tables exist).

USE event_booking;

CREATE TABLE IF NOT EXISTS bookings (
  id            CHAR(36)      NOT NULL PRIMARY KEY,
  booking_ref   VARCHAR(30)   NOT NULL UNIQUE,
  show_id       CHAR(36)      NOT NULL,
  user_id       CHAR(36)      NOT NULL,
  status        ENUM('PENDING','CONFIRMED','CHECKED_IN','CANCELLED','FAILED')
                              NOT NULL DEFAULT 'PENDING',
  total_amount  DECIMAL(10,2) NOT NULL,
  qr_token      TEXT          NULL,
  expires_at    DATETIME      NOT NULL,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  confirmed_at  DATETIME      NULL,
  checked_in_at DATETIME      NULL,
  cancelled_at  DATETIME      NULL
);

CREATE TABLE IF NOT EXISTS booking_seats (
  booking_id         CHAR(36)      NOT NULL,
  show_seat_id       CHAR(36)      NOT NULL,
  price_at_booking   DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (booking_id, show_seat_id)
);

CREATE TABLE IF NOT EXISTS payments (
  id                  CHAR(36)      NOT NULL PRIMARY KEY,
  booking_id          CHAR(36)      NOT NULL,
  gateway_ref         VARCHAR(64)   NOT NULL UNIQUE,
  gateway_payment_id  VARCHAR(64)   NULL,
  status              ENUM('PENDING','SUCCESS','FAILED','REFUNDED')
                                    NOT NULL DEFAULT 'PENDING',
  amount              DECIMAL(10,2) NOT NULL,
  refunded_amount     DECIMAL(10,2) NOT NULL DEFAULT 0,
  gateway_refund_id   VARCHAR(64)   NULL,
  created_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                    ON UPDATE CURRENT_TIMESTAMP
);