const db = require("../../db");

async function releaseExpiredSeats() {
    try {
        const result = await db.query(`
            WITH candidates AS (
                SELECT s.id
                FROM seats s
                JOIN seat_locks l ON l.seat_id = s.id
                WHERE s.status = 'LOCKED'
                AND l.expires_at <= NOW()
                FOR UPDATE OF s SKIP LOCKED
            ),
            expired AS (
                DELETE FROM seat_locks l
                USING candidates c
                WHERE l.seat_id = c.id
                AND l.expires_at <= NOW()
                RETURNING l.seat_id
            )
            UPDATE seats s
            SET status = 'AVAILABLE'
            FROM expired e
            WHERE s.id = e.seat_id
            AND s.status = 'LOCKED'
            RETURNING s.id
        `);

        if (result.rowCount > 0) {
            console.log("Expired seats released:", result.rowCount);
        }
    } catch (error) {
        console.error("Seat release error:", error.message);
    }
}

module.exports = function () {
    releaseExpiredSeats();
    setInterval(releaseExpiredSeats, 5000);
};
