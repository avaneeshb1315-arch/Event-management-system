# Booking Tables (Rishvanth R)

Draft for review with Avaneesh B. Field names follow the Team Plan data model.
Database: PostgreSQL assumed (confirm with Avaneesh).

## Booking
| Column | Type | Notes |
|---|---|---|
| id | UUID, PK | |
| booking_ref | VARCHAR(30), unique | e.g. BK-20261214-A7X9 |
| show_id | UUID, FK to Show | |
| user_id | UUID, FK to User | |
| status | VARCHAR(20) | PENDING, CONFIRMED, CHECKED_IN, CANCELLED, FAILED |
| total_amount | NUMERIC(10,2) | Calculated on the server |
| qr_code | TEXT, nullable | Signed token, set after payment |
| expires_at | TIMESTAMP | Booking hold deadline |
| created_at | TIMESTAMP | |
| confirmed_at | TIMESTAMP, nullable | |
| checked_in_at | TIMESTAMP, nullable | |
| cancelled_at | TIMESTAMP, nullable | |

## BookingSeat
| Column | Type | Notes |
|---|---|---|
| booking_id | UUID, FK to Booking | |
| show_seat_id | UUID, FK to ShowSeat | |
| price_at_booking | NUMERIC(10,2) | Copy of ShowSeat.price at booking time |

Primary key: (booking_id, show_seat_id).

## Payment
| Column | Type | Notes |
|---|---|---|
| id | UUID, PK | |
| booking_id | UUID, FK to Booking | |
| gateway_ref | VARCHAR(60), unique | Razorpay order id |
| gateway_payment_id | VARCHAR(60), nullable | Razorpay payment id |
| status | VARCHAR(20) | PENDING, SUCCESS, FAILED, REFUNDED |
| amount | NUMERIC(10,2) | |
| refunded_amount | NUMERIC(10,2), default 0 | |
| gateway_refund_id | VARCHAR(60), nullable | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

## Relationships
- User 1 -> N Booking
- Show 1 -> N Booking
- Booking 1 -> N BookingSeat
- ShowSeat 1 -> N BookingSeat (only one active booking per seat)
- Booking 1 -> N Payment

## SQL (PostgreSQL)
```sql
CREATE TABLE booking (
    id             UUID PRIMARY KEY,
    booking_ref    VARCHAR(30) NOT NULL UNIQUE,
    show_id        UUID NOT NULL REFERENCES show(id),
    user_id        UUID NOT NULL REFERENCES users(id),
    status         VARCHAR(20) NOT NULL,
    total_amount   NUMERIC(10,2) NOT NULL,
    qr_code        TEXT,
    expires_at     TIMESTAMP NOT NULL,
    created_at     TIMESTAMP NOT NULL DEFAULT now(),
    confirmed_at   TIMESTAMP,
    checked_in_at  TIMESTAMP,
    cancelled_at   TIMESTAMP
);

CREATE TABLE booking_seat (
    booking_id        UUID NOT NULL REFERENCES booking(id),
    show_seat_id      UUID NOT NULL REFERENCES show_seat(id),
    price_at_booking  NUMERIC(10,2) NOT NULL,
    PRIMARY KEY (booking_id, show_seat_id)
);

CREATE TABLE payment (
    id                  UUID PRIMARY KEY,
    booking_id          UUID NOT NULL REFERENCES booking(id),
    gateway_ref         VARCHAR(60) NOT NULL UNIQUE,
    gateway_payment_id  VARCHAR(60),
    status              VARCHAR(20) NOT NULL,
    amount              NUMERIC(10,2) NOT NULL,
    refunded_amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
    gateway_refund_id   VARCHAR(60),
    created_at          TIMESTAMP NOT NULL DEFAULT now(),
    updated_at          TIMESTAMP NOT NULL DEFAULT now()
);
```

## Questions for Avaneesh
1. Which database (PostgreSQL or MySQL)?
2. Are IDs UUIDs or auto-increment numbers?
3. Table names: `users` and `show` fine, or different?
4. Is FAILED an allowed booking status?
5. Do you use Flyway or Liquibase for migrations?