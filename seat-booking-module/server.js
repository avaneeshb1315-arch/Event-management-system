const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const db = require("./db");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.json());
app.use("/api/bookings", require("./src/routes/bookingRoutes"));

app.use("/booking", express.static(
    path.join(__dirname, "public")
));

app.use("/api/seats",
    require("./src/routes/seatRoutes")
);

app.get("/", (req, res) => {
    res.json({
        status: "OK",
        message: "Seat Booking System Backend Running!"
    });
});

app.get("/api/seats", async (req, res) => {
    try {
        const result = await db.query(
            "SELECT * FROM seats ORDER BY id"
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: "Failed to fetch seats"
        });
    }
});

// Socket.IO connections
io.on("connection", socket => {
    console.log("User connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

let previousSeats = "";
let checking = false;

async function broadcastSeatUpdates() {
    if (checking) return;
    checking = true;

    try {
        const result = await db.query(
            "SELECT * FROM seats ORDER BY id"
        );

        const currentSeats = JSON.stringify(result.rows);

        if (currentSeats !== previousSeats) {
            previousSeats = currentSeats;
            io.emit("seats:updated", result.rows);
        }
    } catch (error) {
        console.error("Socket update error:", error.message);
    } finally {
        checking = false;
    }
}

const PORT = process.env.PORT || 5001;

server.on("error", error => {
    console.error("Server error:", error.message);
    process.exit(1);
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log("Socket.IO activated");

    require("./src/services/expireLocks")();

    setInterval(broadcastSeatUpdates, 2000);
});

