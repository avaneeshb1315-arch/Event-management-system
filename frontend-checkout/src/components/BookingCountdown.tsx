"use client";

import { useEffect, useState } from "react";

export default function BookingCountdown({
  expiresAt
}: {
  expiresAt: string;
}) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    function update() {
      setRemaining(
        Math.max(0, Math.ceil(
          (Date.parse(expiresAt) - Date.now()) / 1000
        ))
      );
    }

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <div style={{
      padding: "16px",
      borderRadius: "12px",
      background: "#fff3cd",
      color: "#664d03",
      textAlign: "center"
    }}>
      <h3>Reservation Countdown</h3>
      <h1>
        {String(minutes).padStart(2, "0")}:
        {String(seconds).padStart(2, "0")}
      </h1>
      <p>{remaining > 0
        ? "Complete your booking before expiry"
        : "Reservation expired"}</p>
    </div>
  );
}
