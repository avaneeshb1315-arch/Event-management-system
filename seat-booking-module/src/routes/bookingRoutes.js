const express = require("express");
const router = express.Router();
const db = require("../../db");

router.post("/confirm", async (req, res) => {
    const { seat_id, user_id, lock_id } = req.body || {};

    if (![seat_id, user_id, lock_id].every(
        n => Number.isSafeInteger(n) && n > 0
    )) {
        return res.status(400).json({
            message: "Invalid booking details"
        });
    }

    let client;

    try {
        client = await db.connect();
        await client.query("BEGIN");

        const seat = await client.query(
            "SELECT * FROM seats WHERE id = $1 FOR UPDATE",
            [seat_id]
        );

        if (!seat.rows.length ||
            seat.rows[0].status !== "LOCKED") {
            await client.query("ROLLBACK");
            return res.status(409).json({
                message: "Seat is not reserved"
            });
        }

        const lock = await client.query(
            `SELECT * FROM seat_locks
             WHERE seat_id = $1
             AND user_id = $2
             AND id = $3
             AND expires_at > clock_timestamp()`,
            [seat_id, user_id, lock_id]
        );

        if (!lock.rows.length) {
            await client.query("ROLLBACK");
            return res.status(409).json({
                message: "Reservation expired or invalid"
            });
        }

        const booking = await client.query(
            `INSERT INTO bookings
             (user_id, event_id, total_amount, status)
             VALUES ($1, $2, $3, 'CONFIRMED')
             RETURNING *`,
            [
                user_id,
                seat.rows[0].event_id,
                seat.rows[0].price
            ]
        );

        const bookingId = booking.rows[0].id;

        await client.query(
            `INSERT INTO booking_seats
             (booking_id, seat_id)
             VALUES ($1, $2)`,
            [bookingId, seat_id]
        );

        await client.query(
            "UPDATE seats SET status = 'BOOKED' WHERE id = $1",
            [seat_id]
        );

        await client.query(
            "DELETE FROM seat_locks WHERE seat_id = $1",
            [seat_id]
        );

        await client.query("COMMIT");

        res.status(201).json({
            message: "Booking confirmed successfully",
            booking: booking.rows[0]
        });

    } catch (error) {
        if (client) {
            await client.query("ROLLBACK").catch(console.error);
        }

        console.error(error.message);

        res.status(500).json({
            message: "Booking failed"
        });
    } finally {
        if (client) client.release();
    }
});

router.get("/user/:userId", async (req, res) => {
    const userId = Number(req.params.userId);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
        return res.status(400).json({
            message: "Invalid user ID"
        });
    }

    try {
        const result = await db.query(`
            SELECT
                b.id AS booking_id,
                e.event_name,
                e.venue,
                e.event_date,
                s.seat_number,
                s.category,
                b.total_amount,
                b.status,
                b.created_at
            FROM bookings b
            JOIN events e ON e.id = b.event_id
            JOIN booking_seats bs ON bs.booking_id = b.id
            JOIN seats s ON s.id = bs.seat_id
            WHERE b.user_id = $1
            ORDER BY b.created_at DESC
        `, [userId]);

        res.json(result.rows);

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: "Failed to fetch bookings"
        });
    }
});

module.exports = router;

