# Seat Booking Module - TB-2

Developed by Avaneesh B
Ticket Booking Team

## Technology Stack

- Node.js and Express.js
- PostgreSQL
- Socket.IO
- HTML, CSS and JavaScript
- Spring Boot Authentication
- JWT Authentication

## Implemented Features

- Dynamic seat availability
- Temporary seat reservation
- Five-minute countdown timer
- Countdown persistence after page refresh
- Automatic expired seat release
- Double booking prevention
- Real-time seat status synchronization
- Booking confirmation
- User-specific booking history
- Responsive frontend
- User registration and login
- JWT authentication middleware
- UUID-based authenticated booking
- Logout functionality

## Installation

1. Install Node.js 18 or newer, PostgreSQL and JDK 21.
2. Open the seat-booking-module folder.
3. Run npm ci.
4. Create the seat_booking PostgreSQL database.
5. Import sql/schema.sql for a fresh database.
6. Apply sql/auth_integration.sql.
7. Copy .env.example to .env.
8. Configure your PostgreSQL credentials.
9. Start the team Spring Boot authentication server on port 8080.
10. Run node server.js.

## Application URLs

- Login: /booking/login.html
- Seat Booking: /booking/
- My Bookings: /booking/my-bookings.html

Default configured port: 5002.
Authentication testing port: 5003.

## API Endpoints

| Method | Endpoint | Authentication |
|--------|----------|----------------|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/seats | Public |
| POST | /api/seats/lock | JWT |
| POST | /api/bookings/confirm | JWT |
| GET | /api/bookings/me | JWT |

## Booking Workflow

Login -> Select Seat -> Hold Seat ->
Countdown -> Confirm Booking -> My Bookings

## Security Features

- Server-side JWT verification
- Authenticated user UUID
- Reservation ownership validation
- Database transaction-based booking
- Expiry validation
- Duplicate booking prevention

## Development Status

Authentication integration code implemented.
Final runtime verification pending.

## Remaining Verification

- Authenticated booking end-to-end testing
- Two-user booking privacy testing
- Countdown persistence verification
- Automatic seat release verification
- Real-time synchronization testing
- Team module integration

## Security Notes

Never commit .env files, database passwords,
JWT tokens or secret keys.

Do not merge the authentication development branch
until integration tests pass.
