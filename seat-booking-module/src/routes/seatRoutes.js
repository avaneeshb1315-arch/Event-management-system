const express = require("express");
const router = express.Router();
const db = require("../../db");

router.post("/lock", async (req, res) => {
    const { seat_id, user_id } = req.body;

    if (!Number.isInteger(seat_id) || seat_id <= 0 ||
        !Number.isInteger(user_id) || user_id <= 0) {
        return res.status(400).json({
            message: "Invalid seat or user ID"
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

        if (!seat.rows.length) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                message: "Seat not found"
            });
        }

        if (seat.rows[0].status === "BOOKED") {
            await client.query("ROLLBACK");
            return res.status(409).json({
                message: "Seat already booked"
            });
        }

        await client.query(
            "DELETE FROM seat_locks WHERE seat_id = $1 AND expires_at <= NOW()",
            [seat_id]
        );

        const lock = await client.query(
            `INSERT INTO seat_locks
            (seat_id, user_id, expires_at)
            VALUES ($1, $2, NOW() + INTERVAL '5 minutes')
            ON CONFLICT (seat_id) DO NOTHING
            RETURNING *`,
            [seat_id, user_id]
        );

        if (!lock.rows.length) {
            await client.query("ROLLBACK");
            return res.status(409).json({
                message: "Seat already locked"
            });
        }

        await client.query(
            "UPDATE seats SET status = 'LOCKED' WHERE id = $1",
            [seat_id]
        );

        await client.query("COMMIT");

        res.json({
            message: "Seat locked successfully",
            lock: lock.rows[0]
        });

    } catch (error) {
        if (client) {
            await client.query("ROLLBACK").catch(console.error);
        }

        console.error(error.message);

        res.status(500).json({
            message: "Seat locking failed"
        });

    } finally {
        if (client) client.release();
    }
});

module.exports = router;
