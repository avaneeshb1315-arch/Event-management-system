"use client";

import { useEffect, useState } from "react";

type Reservation = {
  showId: string;
  expiresAt: string;
  seatIds: string[];
};

export default function PaymentPage() {
  const [reservation, setReservation] =
    useState<Reservation | null>(null);
  const [remaining, setRemaining] = useState(0);
         const [email, setEmail] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("tb2_payment");
    if (!saved) return;

    try {
      const data = JSON.parse(saved);
      const expiry = Date.parse(data.expiresAt);
      if (!Number.isFinite(expiry)) return;
      setReservation(data);

      function update() {
        setRemaining(Math.max(0,
          Math.ceil((expiry - Date.now()) / 1000)
        ));
      }

      update();
      const timer = setInterval(update, 1000);
      return () => clearInterval(timer);
    } catch {
      sessionStorage.removeItem("tb2_payment");
    }
  }, []);

  return (
    <main style={{
      minHeight: "100vh",
      background: "#101323",
      color: "white",
      padding: 40
    }}>
      <section style={{
        maxWidth: 500,
        margin: "auto",
        background: "#1b2035",
        padding: 30,
        borderRadius: 20
      }}>
        <h1>Complete Your Payment</h1>

        {!reservation ? (
          <p>No active reservation. Select seats first.</p>
        ) : (
          <>
            <div style={{
              textAlign: "center",
              background: "#382c1d",
              padding: 20,
              borderRadius: 12,
              color: "#fbbf24"
            }}>
              <p>Reservation expires in</p>
              <h1 style={{ fontSize: 48 }}>
                {String(Math.floor(remaining / 60)).padStart(2,"0")}:
                {String(remaining % 60).padStart(2,"0")}
              </h1>
            </div>

            <h2>Ticket Delivery</h2>

<label htmlFor="ticket-email">Email Address</label>

<input
  id="ticket-email"
  type="email"
  placeholder="Enter your email address"
  value={email}
  onChange={e => setEmail(e.target.value)}
  required
  style={{
    width: "100%",
    padding: 12,
    marginTop: 8,
    borderRadius: 8,
    background: "#101323",
    color: "white",
    border: "1px solid #454963"
  }}
/>

<p style={{color: "#a7b0ce", fontSize: 13}}>
  Your confirmed ticket PDF will be sent to this email.
</p>

<h2>Booking Summary</h2>
            <p>Reserved seats: {reservation.seatIds.length}</p>

            <p>{remaining > 0
              ? "Your seats are temporarily reserved."
              : "Reservation expired. Please select seats again."
            }</p>

            <button disabled style={{
              width: "100%",
              padding: 15,
              background: "#6945ed",
              color: "white",
              border: "none",
              borderRadius: 10,
              opacity: 0.6
            }}>
              {remaining > 0
                ? "Payment integration pending"
                : "Reservation Expired"}
            </button>

            <p>
              <a href={`/seat-map?showId=${reservation.showId}`}>
                Return to Seat Selection
              </a>
            </p>
          </>
        )}
      </section>
    </main>
  );
}

