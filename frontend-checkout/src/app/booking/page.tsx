"use client";

import { useState } from "react";
import styles from "./booking.module.css";

type Auth = { token: string; name: string; email: string; role: string };
type Show = { id: string; title: string; showTime: string; status: string };
type Seat = { id: string; block: string; row: string | null; number: number | null; status: string; price: number };
type Booking = { id: string; bookingRef: string; showId: string; status: string; totalAmount: number; expiresAt: string };
type Hold = { lockedSeatIds?: string[]; lockedUntil?: string; expiresAt?: string };
const money = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);

async function api<T>(path: string, token = "", method = "GET", body?: unknown): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method, cache: "no-store",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body === undefined ? {} : { "Content-Type": "application/json" }) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message ?? `Request failed (${response.status})`);
  return data as T;
}

export default function BookingPage() {
  const [auth, setAuth] = useState<Auth | null>(null);
  const [register, setRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [shows, setShows] = useState<Show[]>([]);
  const [showId, setShowId] = useState("");
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [held, setHeld] = useState(false);
  const [holdInfo, setHoldInfo] = useState("");
  const [history, setHistory] = useState<Booking[]>([]);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [checkToken, setCheckToken] = useState("");
  const [ticket, setTicket] = useState("");
  const total = seats.filter(s => selected.includes(s.id)).reduce((sum, s) => sum + Number(s.price), 0);

  async function action(fn: () => Promise<void>) {
    setBusy(true); setFailed(false); setMessage("");
    try { await fn(); } catch (err) { setFailed(true); setMessage(err instanceof Error ? err.message : "Request failed"); }
    finally { setBusy(false); }
  }
  async function loadHistory(token: string) { setHistory(await api<Booking[]>("/bookings", token)); }
  async function loadSeats(id: string, token: string) {
    setSeats(await api<Seat[]>(`/shows/${id}/seats`, token));
  }
  async function signIn() {
    const result = await api<Auth>(register ? "/auth/register" : "/auth/login", "", "POST",
      register ? { name, email, password } : { email, password });
    setAuth(result); setPassword("");
    setMessage(`Signed in as ${result.name} (${result.role})`);
    setShows(await api<Show[]>("/shows", result.token));
    await loadHistory(result.token);
  }
  async function changeShow(id: string) {
    if (!auth) return;
    setShowId(id); setSelected([]); setSeats([]); setHoldInfo("");
    if (id) await loadSeats(id, auth.token);
  }
  function toggle(id: string) {
    if (busy || held) return;
    setSelected(old => old.includes(id) ? old.filter(x => x !== id) : old.length < 6 ? [...old, id] : old);
  }
  async function holdSeats() {
    if (!auth || !showId || !selected.length) return;
    const result = await api<Hold>(`/shows/${showId}/lock`, auth.token, "POST", { seatIds: selected });
    setHeld(true);
    setHoldInfo(result.lockedUntil ?? result.expiresAt ?? "Hold active");
    setMessage("Seats held. Create the booking before the hold expires.");
    await loadSeats(showId, auth.token);
  }
  async function release() {
    if (!auth || !held) return;
    await api(`/shows/${showId}/lock`, auth.token, "DELETE", { seatIds: selected });
    setHeld(false); setSelected([]); setHoldInfo("");
    await loadSeats(showId, auth.token);
    setMessage("Seat hold released.");
  }
  async function create() {
    if (!auth || !held) return;
    const result = await api<Booking>("/bookings", auth.token, "POST", { showId, seatIds: selected });
    setHeld(false); setSelected([]); setHoldInfo("");
    setMessage(`Booking ${result.bookingRef} created — ${result.status}. Payment is not completed.`);
    await loadHistory(auth.token); await loadSeats(showId, auth.token);
  }
  async function cancel(id: string) {
    if (!auth || !window.confirm("Cancel this unpaid booking?")) return;
    const result = await api<Booking>(`/bookings/${id}/cancel`, auth.token, "POST");
    setMessage(`${result.bookingRef}: ${result.status}`);
    await loadHistory(auth.token); if (showId) await loadSeats(showId, auth.token);
  }
  async function getTicket(id: string) {
    if (!auth) return;
    const result = await api<{ bookingRef: string; qrToken: string }>(`/bookings/${id}/ticket`, auth.token);
    setTicket(`${result.bookingRef}: ${result.qrToken}`);
  }
  function signOut() {
    setAuth(null); setShowId(""); setSeats([]); setSelected([]); setHeld(false); setHistory([]); setTicket(""); setMessage(""); setHoldInfo(""); setCheckToken("");
  }
  return <main className={styles.page}>
    <header className={styles.header}><div><span>COMMUNITY 360</span><h1>Ticket booking</h1><p>Live PostgreSQL seat availability and secure booking</p></div>
      {auth && <div><p>{auth.name} · {auth.role}</p><button disabled={busy || held} onClick={signOut}>Sign out</button></div>}</header>
    {message && <p role="status" className={failed ? styles.error : styles.message}>{message}</p>}
    {!auth ? <section className={styles.card}>
      <h2>{register ? "Create an account" : "Sign in"}</h2>
      <form className={styles.form} onSubmit={e => { e.preventDefault(); void action(signIn); }}>
        {register && <label>Name<input value={name} onChange={e => setName(e.target.value)} required autoComplete="name" /></label>}
        <label>Email<input type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" /></label>
        <label>Password<input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} autoComplete={register ? "new-password" : "current-password"} /></label>
        <button disabled={busy}>{register ? "Register" : "Login"}</button>
      </form><button className={styles.secondary} disabled={busy} onClick={() => { setRegister(v => !v); setMessage(""); }}>{register ? "Already registered? Sign in" : "New user? Create account"}</button>
      <p>Use a newly registered account, not the placeholder test user.</p>
    </section> : <>
      <section className={styles.card}>
        <h2>Choose a show</h2>
        <label>Show<select value={showId} disabled={busy || held} onChange={e => void action(() => changeShow(e.target.value))}>
          <option value="">Select a show</option>{shows.map(s => <option key={s.id} value={s.id}>{s.title} · {s.showTime.replace("T", " ")}</option>)}
        </select></label>
        <button className={styles.secondary} disabled={busy || held} onClick={() => void action(async () => { setShows(await api<Show[]>("/shows", auth.token)); if (showId) await loadSeats(showId, auth.token); })}>Refresh shows and seats</button>
        {showId && <><p>{seats.filter(s => s.status === "AVAILABLE").length} available / {seats.length} seats · choose up to 6</p>
          <p className={styles.legend}>Available · selected · unavailable (grey)</p>
          {Array.from(new Set(seats.map(s => s.block))).map(block => <div key={block}><h3>{block}</h3><div className={styles.seats}>
            {seats.filter(s => s.block === block).sort((a,b) => (a.row ?? "").localeCompare(b.row ?? "") || (a.number ?? 0)-(b.number ?? 0)).map(s => <button type="button" key={s.id} disabled={busy || held || s.status !== "AVAILABLE"} className={selected.includes(s.id) ? styles.selected : s.status !== "AVAILABLE" ? styles.unavailable : styles.available} onClick={() => toggle(s.id)} title={`${s.block} ${s.row ?? ""} ${s.number ?? ""}: ${s.status}, ${money(Number(s.price))}`} aria-pressed={selected.includes(s.id)}>{s.row ?? ""}{s.number ?? ""}</button>)}
          </div></div>)}
          <div className={styles.summary}><strong>{selected.length} selected · {money(total)} estimated</strong>
          {held ? <><p>Hold deadline: {holdInfo}</p><button disabled={busy} onClick={() => void action(create)}>Create booking</button><button className={styles.secondary} disabled={busy} onClick={() => void action(release)}>Release selection</button></> : <button disabled={busy || !selected.length} onClick={() => void action(holdSeats)}>Hold selected seats</button>}
          </div></>}
      </section>
      <section className={styles.card}><h2>My bookings</h2><button className={styles.secondary} disabled={busy} onClick={() => void action(() => loadHistory(auth.token))}>Refresh history</button>
        {!history.length && <p>No bookings yet.</p>}
        {history.map(b => <article className={styles.booking} key={b.id}><strong>{b.bookingRef}</strong><span>{b.status} · {money(Number(b.totalAmount))}</span><small>Expires: {b.expiresAt}</small><div className={styles.actions}>
          <button disabled={busy} className={styles.secondary} onClick={() => void action(async () => { const updated = await api<Booking>(`/bookings/${b.id}`, auth.token); setMessage(`${updated.bookingRef}: ${updated.status}`); })}>Check status</button>
          {b.status === "PENDING" && <button disabled={busy} className={styles.danger} onClick={() => void action(() => cancel(b.id))}>Cancel</button>}
          {["CONFIRMED", "CHECKED_IN"].includes(b.status) && <button disabled={busy} onClick={() => void action(() => getTicket(b.id))}>Ticket details</button>}
        </div></article>)}
        {ticket && <p className={styles.ticket}>Issued ticket token: {ticket}</p>}
        <p>Tickets are issued only after the team's payment service confirms the booking.</p>
      </section>
      {auth.role === "ADMIN" && <section className={styles.card}><h2>Staff check-in</h2><form className={styles.form} onSubmit={e => { e.preventDefault(); void action(async () => { const r = await api<{ status: string }>("/checkin", auth.token, "POST", { qrToken: checkToken }); setMessage(r.status); setCheckToken(""); }); }}><label>Issued ticket token<input required value={checkToken} onChange={e => setCheckToken(e.target.value)} /></label><button disabled={busy}>Check in</button></form></section>}
    </>}
  </main>;
}
