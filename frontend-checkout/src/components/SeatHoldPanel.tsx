"use client";

import { useEffect, useState } from "react";

type Props = {
  showId: string;
  seatIds: string[];
  onHeld: () => void;
};

export default function SeatHoldPanel({
  showId, seatIds, onHeld
}: Props) {
  const [register, setRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [expiry, setExpiry] = useState(0);
  const [now, setNow] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const remaining = expiry
    ? Math.max(0, Math.ceil((expiry - now) / 1000))
    : 0;

  async function authenticate() {
    setBusy(true);
    setError("");

    try {
      const res = await fetch(
        register ? "/api/auth/register" : "/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(register
            ? { name, email, password }
            : { email, password })
        }
      );

      if (res.status === 409)
        throw new Error("Email already registered. Please login.");

      if (res.status === 401)
        throw new Error("Invalid email or password.");

      if (!res.ok)
        throw new Error(`Authentication failed: HTTP ${res.status}`);

      const data = await res.json();

      if (!data.token)
        throw new Error("Authentication token missing.");

      setToken(data.token);
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  async function hold() {
    setBusy(true);
    setError("");

    try {
      const res = await fetch(`/api/shows/${showId}/lock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ seatIds })
      });

      if (!res.ok)
        throw new Error(`Seat hold failed: HTTP ${res.status}`);

      const data = await res.json();
      const end = Date.parse(data.expiresAt);

      if (!Number.isFinite(end))
        throw new Error("Invalid reservation expiry.");

      sessionStorage.setItem("tb2_payment", JSON.stringify({
        showId,
        seatIds: data.locked,
        expiresAt: data.expiresAt
      }));
      onHeld();
      window.location.assign("/payment");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Seat hold failed");
    } finally {
      setBusy(false);
    }
  }

  const field = {
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "8px",
    background: "#202439",
    color: "white",
    border: "1px solid #454963"
  };

  const button = {
    width: "100%",
    padding: "12px",
    background: "#6945ed",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  };

  return (
    <section style={{
      padding: 20,
      marginTop: 20,
      background: "#15192b",
      borderRadius: 16,
      color: "white"
    }}>
      {!token ? (
        <form onSubmit={e => {
          e.preventDefault();
          void authenticate();
        }}>
          <h2>{register ? "Create Account" : "Welcome Back"}</h2>

          {register && (
            <input style={field}
              placeholder="Full Name"
              value={name}
              required
              onChange={e => setName(e.target.value)} />
          )}

          <input style={field}
            type="email"
            placeholder="Email Address"
            value={email}
            required
            onChange={e => setEmail(e.target.value)} />

          <input style={field}
            type="password"
            placeholder="Password"
            value={password}
            minLength={register ? 6 : undefined}
            required
            onChange={e => setPassword(e.target.value)} />

          <button style={button} disabled={busy}>
            {busy ? "Please wait..." :
              register ? "Create Account" : "Login"}
          </button>

          <p style={{ textAlign: "center" }}>
            {register ? "Already registered?" : "New user?"}
          </p>

          <button type="button"
            style={button}
            disabled={busy}
            onClick={() => {
              setRegister(!register);
              setPassword("");
              setError("");
            }}>
            {register ? "Login" : "Create Account"}
          </button>
        </form>
      ) : (
        <>
          <h3>Logged in successfully</h3>

          <button style={button}
            disabled={busy || remaining > 0 || !seatIds.length}
            onClick={hold}>
            {remaining > 0 ? "Seats Held" : "Proceed to Payment"}
          </button>

          {expiry > 0 && (
            <div style={{
              textAlign: "center",
              color: "#fbbf24",
              padding: 20
            }}>
              <h3>Reservation Countdown</h3>
              <h1 style={{ fontSize: 40 }}>
                {String(Math.floor(remaining / 60)).padStart(2,"0")}:
                {String(remaining % 60).padStart(2,"0")}
              </h1>
              {remaining === 0 && <p>Reservation expired</p>}
            </div>
          )}
        </>
      )}

      {error && <p role="alert" style={{ color: "#ff7777" }}>{error}</p>}
    </section>
  );
}

