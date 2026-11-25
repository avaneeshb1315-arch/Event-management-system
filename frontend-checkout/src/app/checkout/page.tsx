
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    CATEGORY_NAMES,
    formatPrice,
    MAX_SEATS,
    type Seat,
} from "../../types/seat";

type CheckoutSelection = {
    showId: string;
    seats: Seat[];
};

export default function CheckoutPage() {
    const router = useRouter();

    const [selection, setSelection] =
        useState<CheckoutSelection | null>(null);

    const [loading, setLoading] = useState(true);

    const [message, setMessage] = useState("");

    useEffect(() => {
        try {
            const saved = sessionStorage.getItem(
                "checkoutSelection"
            );

            if (!saved) {
                setLoading(false);
                return;
            }

            const parsed = JSON.parse(saved);

            const valid =
                typeof parsed.showId === "string" &&
                /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(
                    parsed.showId
                ) &&
                Array.isArray(parsed.seats) &&
                parsed.seats.length > 0 &&
                parsed.seats.length <= MAX_SEATS &&
                parsed.seats.every(
                    (seat: Seat) =>
                        typeof seat.id === "string" &&
                        typeof seat.label === "string" &&
                        Object.prototype.hasOwnProperty.call(
                            CATEGORY_NAMES,
                            seat.category
                        ) &&
                        typeof seat.price === "number" &&
                        Number.isFinite(seat.price) &&
                        seat.price >= 0 &&
                        seat.status === "AVAILABLE"
                ) &&
                new Set(
                    parsed.seats.map((seat: Seat) => seat.id)
                ).size === parsed.seats.length;

            if (valid) {
                setSelection(parsed);
            }
        } catch {
            setMessage("Unable to load selected seats.");
        } finally {
            setLoading(false);
        }
    }, []);

    const seats = selection?.seats ?? [];

    const total = seats.reduce(
        (sum, seat) => sum + seat.price,
        0
    );

    function backToSeats() {
        sessionStorage.removeItem("checkoutSelection");

        if (selection?.showId) {
            router.push(
                `/seat-map?showId=${encodeURIComponent(
                    selection.showId
                )}`
            );
        } else {
            router.push("/seat-map");
        }
    }

    if (loading) {
        return (
            <main className="container">
                Loading checkout...
            </main>
        );
    }

    if (!selection) {
        return (
            <div className="app-shell">
                <main className="container">
                    <section className="panel">
                        <h1>No seats selected</h1>

                        <p className="security-note">
                            Please select your seats before
                            continuing to checkout.
                        </p>

                        {message && (
                            <p className="error-message">
                                {message}
                            </p>
                        )}

                        <button
                            className="primary-button"
                            onClick={backToSeats}
                        >
                            Back to seat selection
                        </button>
                    </section>
                </main>
            </div>
        );
    }

    return (
        <div className="app-shell">

            <header className="navbar">
                <div className="brand">
                    <div className="brand-icon">C</div>

                    <div>
                        <strong>Community 360</strong>
                        <small>EVENT CREATION</small>
                    </div>
                </div>

                <span className="demo-badge">
          BOOKING REVIEW
        </span>
            </header>

            <main className="container">

                <div className="page-heading">
                    <div className="eyebrow">
                        YOUR NEXT EXPERIENCE
                    </div>

                    <h1>Complete your booking.</h1>

                    <p>
                        Review your selected seats and booking
                        details.
                    </p>
                </div>

                <div className="steps">

          <span className="step">
            01 — Select seats
          </span>

                    <span className="step-line" />

                    <span className="step active">
            02 — Checkout
          </span>

                    <span className="step-line" />

                    <span className="step">
            03 — Payment
          </span>

                </div>

                <div className="booking-grid">

                    <section className="panel">

                        <div className="panel-heading">
                            <div>
                                <h2>Checkout details</h2>

                                <p>
                                    Review your selected tickets.
                                </p>
                            </div>
                        </div>

                        <div className="timer-box">
                            <span>Seat reservation status</span>

                            <strong
                                style={{ fontSize: "18px" }}
                            >
                                Not held yet
                            </strong>
                        </div>

                        <div className="event-card">

                            <div className="event-icon">
                                C
                            </div>

                            <div>
                                <h3>Community 360</h3>

                                <p>Event Booking</p>

                                <small>
                                    Review your seat selection
                                </small>
                            </div>

                        </div>

                        <h3 className="section-title">
                            Your selected tickets
                        </h3>

                        <div className="ticket-table">

                            {seats.map((seat) => (
                                <div
                                    className="ticket-row"
                                    key={seat.id}
                                >
                                    <div>
                                        <strong>{seat.label}</strong>

                                        <p>
                                            {CATEGORY_NAMES[seat.category]}
                                        </p>
                                    </div>

                                    <strong>
                                        {formatPrice(seat.price)}
                                    </strong>
                                </div>
                            ))}

                        </div>

                        <button
                            className="secondary-button"
                            onClick={backToSeats}
                        >
                            ← Back to seat selection
                        </button>

                    </section>

                    <aside className="panel summary-panel">

                        <div className="panel-heading">
                            <div>
                                <h2>Booking summary</h2>

                                <p>
                                    {seats.length} of {MAX_SEATS}
                                    {" "}seats selected
                                </p>
                            </div>
                        </div>

                        <div className="selected-list">

                            {seats.map((seat) => (
                                <div
                                    className="selected-item"
                                    key={seat.id}
                                >
                                    <div>
                                        <strong>{seat.label}</strong>

                                        <small>
                                            {CATEGORY_NAMES[seat.category]}
                                        </small>
                                    </div>

                                    <span>
                    {formatPrice(seat.price)}
                  </span>
                                </div>
                            ))}

                        </div>

                        <div className="divider" />

                        <div className="amount-row">
                            <span>Ticket subtotal</span>

                            <strong>
                                {formatPrice(total)}
                            </strong>
                        </div>

                        <div className="divider" />

                        <div className="total-row">
                            <span>Estimated total</span>

                            <strong>
                                {formatPrice(total)}
                            </strong>
                        </div>

                        <button
                            className="primary-button"
                            disabled
                        >
                            Proceed to payment →
                        </button>

                        <p className="security-note">
                            Payment will be enabled after the
                            backend confirms your seat hold
                            and booking amount.
                        </p>

                        <div className="demo-notice">
                            Your selection is not a confirmed
                            reservation.
                        </div>

                    </aside>

                </div>

            </main>

            <footer>
                Community 360 · Event Management System
            </footer>

        </div>
    );
}
