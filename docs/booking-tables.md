# Booking Tables (Rishvanth R)

Draft for review with Avaneesh B. Field names follow the Team Plan data model.
Database: MySQL (confirmed by Avaneesh B).

## Booking
| Column | Type | Notes |
|---|---|---|
| id | CHAR(36), PK | UUID as text |
| booking_ref | VARCHAR(30), unique | e.g. BK-20261214-A7X9 |
| show_id | CHAR(36), FK to shows | |
| user_id | CHAR(36), FK to users | |
| status | VARCHAR(20) | PENDING, CONFIRMED, CHECKED_IN, CANCELLED, FAILED |
| total_amount | DECIMAL(10,2) | Calculated on the server |
| qr_code | TEXT, nullable | Signed token, set after payment |
| expires_at | DATETIME | Booking hold deadline |
| created_at | DATETIME | Defaults to now |
| confirmed_at | DATETIME, nullable | |
| checked_in_at | DATETIME, nullable | |
| cancelled_at | DATETIME, nullable | |

## BookingSeat
| Column | Type | Notes |
|---|---|---|
| booking_id | CHAR(36), FK to booking | |
| show_seat_id | CHAR(36), FK to show_seat | |
| price_at_booking | DECIMAL(10,2) | Copy of ShowSeat.price at booking time |

Primary key: (booking_id, show_seat_id).

## Payment
| Column | Type | Notes |
|---|---|---|
| id | CHAR(36), PK | |
| booking_id | CHAR(36), FK to booking | |
| gateway_ref | VARCHAR(60), unique | Razorpay order id |
| gateway_payment_id | VARCHAR(60), nullable | Razorpay payment id |
| status | VARCHAR(20) | PENDING, SUCCESS, FAILED, REFUNDED |
| amount | DECIMAL(10,2) | |
| refunded_amount | DECIMAL(10,2), default 0 | |
| gateway_refund_id | VARCHAR(60), nullable | |
| created_at | DATETIME | Defaults to now |
| updated_at | DATETIME | Updates automatically |

## Relationships
- User 1 -> N Booking
- Show 1 -> N Booking
- Booking 1 -> N BookingSeat
- ShowSeat 1 -> N BookingSeat (only one active booking per seat)
- Booking 1 -> N Payment

## SQL (MySQL)
```sql
CREATE TABLE booking (
    id             CHAR(36) NOT NULL PRIMARY KEY,
    booking_ref    VARCHAR(30) NOT NULL UNIQUE,
    show_id        CHAR(36) NOT NULL,
    user_id        CHAR(36) NOT NULL,
    status         VARCHAR(20) NOT NULL,
    total_amount   DECIMAL(10,2) NOT NULL,
    qr_code        TEXT NULL,
    expires_at     DATETIME NOT NULL,
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    confirmed_at