
"use client";

import { useEffect, useState } from "react";

type Status =
    | "AVAILABLE"
    | "LOCKED"
    | "BOOKED"
    | "RESERVED"
    | "DISABLED";

type Seat = {
    id: string;
    row: string;
    number: number;
    price: number;
    tier: string;
    status: Status;
};

const rows = [
    { name: "VIP", count: 12, price: 1500, tier: "VIP" },
    { name: "PT1", count: 24, price: 1000, tier: "Premium" },
    { name: "PT2", count: 24, price: 1000, tier: "Premium" },
    ...Array.from({ length: 10 }, (_, i) => ({
        name: String.fromCharCode(65 + i),
        count: 20,
        price: 500,
        tier: "Standard",
    })),
];

const seats: Seat[] = rows.flatMap((row, r) =>
    Array.from({ length: row.count }, (_, i) => {
        const number = i + 1;
        const index = r * 24 + number;

        let status: Status = "AVAILABLE";

        if (index % 19 === 0) status = "BOOKED";
        else if (index % 31 === 0) status = "LOCKED";
        else if (index % 43 === 0) status = "RESERVED";
        else if (index % 59 === 0) status = "DISABLED";

        return {
            id: `${row.name}-${number}`,
            row: row.name,
            number,
            price: row.price,
            tier: row.tier,
            status,
        };
    })
);

const money = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);

export default function Home() {
    const [selected, setSelected] = useState<Seat[]>([]);
    const [message, setMessage] = useState("");
    const [checkout, setCheckout] = useState(false);
    const [remaining, setRemaining] = useState(600);
    const [expiresAt, setExpiresAt] = useState<number | null>(
        null
    );

    const total = selected.reduce(
        (sum, seat) => sum + seat.price,
        0
    );

    const expired = checkout && remaining === 0;

    useEffect(() => {
        if (!checkout || expiresAt === null) return;

        const timer = window.setInterval(() => {
            const secondsLeft = Math.max(
                0,
                Math.ceil((expiresAt - Date.now()) / 1000)
            );

            setRemaining(secondsLeft);

            if (secondsLeft === 0) {
                window.clearInterval(timer);
            }
        }, 1000);

        return () => window.clearInterval(timer);
    }, [checkout, expiresAt]);

    function toggleSeat(seat: Seat) {
        if (checkout || seat.status !== "AVAILABLE") return;

        setMessage("");

        if (selected.some((item) => item.id === seat.id)) {
            setSelected((current) =>
                current.filter((item) => item.id !== seat.id)
            );
            return;
        }

        if (selected.length >= 6) {
            setMessage("You can select a maximum of 6 seats.");
            return;
        }

        setSelected((current) => [...current, seat]);
    }

    function startCheckout() {
        if (selected.length === 0) {
            setMessage("Please select at least one seat.");
            return;
        }

        setMessage("");
        setRemaining(600);
        setExpiresAt(Date.now() + 600000);
        setCheckout(true);
    }

    function backToSeats() {
        if (expired) setSelected([]);

        setCheckout(false);
        setExpiresAt(null);
        setRemaining(600);
        setMessage("");
    }

    function clearSelection() {
        setSelected([]);
        setMessage("");
    }

    const minutes = String(
        Math.floor(remaining / 60)
    ).padStart(2, "0");

    const seconds = String(remaining % 60).padStart(2, "0");

    return (
        <div className="app-shell">
            <header className="navbar">
                <div className="brand">
                    <div className="brand-icon">E</div>

                    <div>
                        <strong>EventBook</strong>
                        <small>Event Management System</small>
                    </div>
                </div>

                <span className="demo-badge">DEMO MODE</span>
            </header>

            <main className="container">
                <div className="page-heading">
                    <div className="eyebrow">EVENT BOOKING</div>

                    <h1>
                        {checkout
                            ? "Review your booking"
                            : "Choose your seats"}
                    </h1>

                    <p>
                        {checkout
                            ? "Review your selected seats and booking total."
                            : "Find your perfect spot and enjoy the experience."}
                    </p>
                </div>

                <div className="demo-notice">
                    Preview mode — seat availability and prices are
                    sample data. No real seats are reserved.
                </div>

                <div className="steps">
          <span
              className={!checkout ? "step active" : "step"}
          >
            01 — Select seats
          </span>

                    <span className="step-line" />

                    <span
                        className={checkout ? "step active" : "step"}
                    >
            02 — Checkout
          </span>

                    <span className="step-line" />

                    <span className="step">03 — Payment</span>
                </div>

                <div className="booking-grid">
                    <section className="panel seat-panel">
                        {!checkout ? (
                            <>
                                <div className="panel-heading">
                                    <div>
                                        <h2>Auditorium layout</h2>
                                        <p>260 seats • 3 seating categories</p>
                                    </div>

                                    <span className="live-label">
                    Interactive preview
                  </span>
                                </div>

                                <div className="legend">
                                    {[
                                        ["available", "Available"],
                                        ["selected", "Selected"],
                                        ["booked", "Booked"],
                                        ["locked", "Locked"],
                                        ["reserved", "Reserved"],
                                        ["disabled", "Disabled"],
                                    ].map(([color, label]) => (
                                        <div className="legend-item" key={label}>
                                            <span className={`dot ${color}`} />
                                            {label}
                                        </div>
                                    ))}
                                </div>

                                <div className="seat-scroll">
                                    <div className="auditorium">
                                        <div className="stage">STAGE</div>

                                        <div className="stage-caption">
                                            FRONT OF AUDITORIUM
                                        </div>

                                        {rows.map((row) => (
                                            <div
                                                className="seat-row"
                                                key={row.name}
                                            >
                        <span className="row-label">
                          {row.name}
                        </span>

                                                <div className="row-seats">
                                                    {seats
                                                        .filter((s) => s.row === row.name)
                                                        .map((seat, index) => {
                                                            const isSelected = selected.some(
                                                                (s) => s.id === seat.id
                                                            );

                                                            return (
                                                                <button
                                                                    type="button"
                                                                    key={seat.id}
                                                                    disabled={
                                                                        seat.status !== "AVAILABLE"
                                                                    }
                                                                    aria-pressed={isSelected}
                                                                    aria-label={`${seat.id}, ${seat.tier}, ${money(seat.price)}, ${seat.status}`}
                                                                    title={`${seat.id} | ${seat.tier} | ${money(seat.price)} | ${seat.status}`}
                                                                    className={[
                                                                        "seat",
                                                                        isSelected
                                                                            ? "selected"
                                                                            : seat.status.toLowerCase(),
                                                                        row.tier.toLowerCase(),
                                                                        index === row.count / 2
                                                                            ? "aisle"
                                                                            : "",
                                                                    ].join(" ")}
                                                                    onClick={() => toggleSeat(seat)}
                                                                >
                                                                    {seat.number}
                                                                </button>
                                                            );
                                                        })}
                                                </div>

                                                <span className="row-label">
                          {row.name}
                        </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="price-guide">
                                    <span>VIP — {money(1500)}</span>
                                    <span>Premium — {money(1000)}</span>
                                    <span>Standard — {money(500)}</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="panel-heading">
                                    <div>
                                        <h2>Checkout details</h2>
                                        <p>Review your selection before payment.</p>
                                    </div>
                                </div>

                                <div
                                    className={`timer-box ${
                                        remaining < 60 ? "timer-danger" : ""
                                    }`}
                                >
                  <span>
                    {expired
                        ? "Demo session expired"
                        : "Demo checkout time remaining"}
                  </span>

                                    <strong>
                                        {minutes}:{seconds}
                                    </strong>
                                </div>

                                <div className="event-card">
                                    <div className="event-icon">E</div>

                                    <div>
                                        <h3>Sample Live Event</h3>
                                        <p>Main Civic Auditorium</p>
                                        <small>Demonstration booking</small>
                                    </div>
                                </div>

                                <h3 className="section-title">
                                    Your selected tickets
                                </h3>

                                <div className="ticket-table">
                                    {selected.map((seat) => (
                                        <div className="ticket-row" key={seat.id}>
                                            <div>
                                                <strong>{seat.id}</strong>
                                                <p>{seat.tier}</p>
                                            </div>

                                            <strong>{money(seat.price)}</strong>
                                        </div>
                                    ))}
                                </div>

                                {expired && (
                                    <p className="error-message" role="alert">
                                        Your demo session has expired. Return to
                                        seat selection.
                                    </p>
                                )}

                                <button
                                    className="secondary-button"
                                    onClick={backToSeats}
                                >
                                    ← Back to seat selection
                                </button>
                            </>
                        )}
                    </section>

                    <aside className="panel summary-panel">
                        <div className="panel-heading">
                            <div>
                                <h2>Booking summary</h2>
                                <p>{selected.length} of 6 seats selected</p>
                            </div>
                        </div>

                        {!checkout && (
                            <button
                                className="text-button"
                                onClick={clearSelection}
                                disabled={selected.length === 0}
                            >
                                Clear selection
                            </button>
                        )}

                        {selected.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">+</div>

                                <strong>No seats selected</strong>

                                <p>Choose available seats from the map.</p>
                            </div>
                        ) : (
                            <div className="selected-list">
                                {selected.map((seat) => (
                                    <div
                                        className="selected-item"
                                        key={seat.id}
                                    >
                                        <div>
                                            <strong>{seat.id}</strong>
                                            <small>{seat.tier}</small>
                                        </div>

                                        <span>{money(seat.price)}</span>

                                        {!checkout && (
                                            <button
                                                className="remove-button"
                                                aria-label={`Remove ${seat.id}`}
                                                onClick={() => toggleSeat(seat)}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="divider" />

                        <div className="amount-row">
                            <span>Ticket subtotal</span>
                            <strong>{money(total)}</strong>
                        </div>

                        <div className="amount-row">
                            <span>Booking fee (demo)</span>
                            <strong>₹0</strong>
                        </div>

                        <div className="divider" />

                        <div className="total-row">
                            <span>Total amount</span>
                            <strong>{money(total)}</strong>
                        </div>

                        {message && (
                            <p className="error-message" role="alert">
                                {message}
                            </p>
                        )}

                        {!checkout ? (
                            <button
                                className="primary-button"
                                onClick={startCheckout}
                                disabled={selected.length === 0}
                            >
                                Continue to checkout →
                            </button>
                        ) : (
                            <button
                                className="primary-button"
                                disabled={expired}
                                onClick={() =>
                                    setMessage(
                                        "Demo only. Payment requires backend integration."
                                    )
                                }
                            >
                                {expired
                                    ? "Session expired"
                                    : "Proceed to payment"}
                            </button>
                        )}

                        <p className="security-note">
                            {checkout
                                ? "No payment will be processed in demo mode."
                                : "Maximum 6 tickets per booking."}
                        </p>
                    </aside>
                </div>
            </main>

            <footer>
                EventBook · Event Management System · Demo
            </footer>
        </div>
    );
}
