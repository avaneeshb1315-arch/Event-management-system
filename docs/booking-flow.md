# Booking Flow (Rishvanth R)

## Status flow

```
                 ┌─ payment fails / lock expires ─▶ FAILED
                 │
PENDING ─────────┤
                 │
                 └─ payment success (webhook) ────▶ CONFIRMED ─ QR scanned ─▶ CHECKED_IN
                                                        │
                                                        └─ user/admin cancels ─▶ CANCELLED
```

A Pending booking can also be cancelled before payment (CANCELLED, no refund).

## What happens at each change

| Event | Booking | Payment | ShowSeat | Other action |
|---|---|---|---|---|
| POST /bookings | PENDING | none | Locked | Calculate total on server |
| POST /payments/create | PENDING | Pending | Locked | Create Razorpay order |
| Payment success (webhook) | CONFIRMED | Success | Booked | Generate QR, send confirmation |
| Payment fails | FAILED | Failed | Available | Release seats |
| Lock expires before payment | FAILED | Pending | Available | Release job closes booking |
| QR scanned at the door | CHECKED_IN | Success | Booked | Save scan time and staff user |
| Second scan of same QR | unchanged | Success | Booked | Reject as duplicate |
| Cancel after payment | CANCELLED | Refunded | Available | Call Razorpay refund |
| Cancel before payment | CANCELLED | Pending | Available | No refund |

## Rules
- The webhook is the source of truth for payment success.
- Booked, Payment and Booking updates happen in one database transaction.
- The webhook is idempotent: a repeated call changes nothing.
- Totals are calculated on the server from ShowSeat.price, never from the client.
- Maximum 6 seats per booking.

## APIs
- POST /bookings
- POST /payments/create
- POST /payments/webhook
- GET /bookings/{id}/ticket
- POST /bookings/{id}/cancel
- POST /checkin

## Open questions
1. Is FAILED an official Booking status?
2. What if a payment is captured after the lock expired? (Suggested: automatic refund.)
3. What are the cancellation window and refund percentages?
4. Which role can call /checkin?
5. Who writes the confirmation email or SMS?