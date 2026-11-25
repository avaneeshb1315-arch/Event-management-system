import { CATEGORY_NAMES, formatPrice, MAX_SEATS, type Seat } from "../types/seat";
import styles from "./SeatMap.module.css";

type Props = { seats: Seat[]; onRemove: (id: string) => void; onClear: () => void };

export default function BookingSummary({ seats, onRemove, onClear }: Props) {
  const total = seats.reduce((sum, seat) => sum + seat.price, 0);
  return <aside className={styles.summary} aria-label="Booking summary">
    <div className={styles.eyebrow}>YOUR SELECTION</div>
    <h2>Booking summary</h2>
    <div className={styles.summaryCount}><strong>{seats.length} / {MAX_SEATS}</strong><span>seats selected</span></div>
    <div className={styles.progress} aria-hidden="true"><div style={{ width: `${seats.length / MAX_SEATS * 100}%` }} /></div>
    {seats.length === 0 ? <p className={styles.empty}>Select an available seat from the map to begin.</p> :
      <ul className={styles.selectedList}>{seats.map(seat => <li key={seat.id}>
        <div><strong>{seat.label}</strong><small>{CATEGORY_NAMES[seat.category]}</small></div>
        <span>{formatPrice(seat.price)}</span>
        <button type="button" onClick={() => onRemove(seat.id)} aria-label={`Remove ${seat.label}`} title={`Remove ${seat.label}`}>×</button>
      </li>)}</ul>}
    <div className={styles.total} aria-live="polite"><span>Estimated total</span><strong>{formatPrice(total)}</strong></div>
    <button type="button" className={styles.clear} disabled={seats.length === 0} onClick={onClear}>Clear selection</button>
    <p className={styles.note}>Seats are not reserved until a hold is confirmed. Your selection does not create a booking.</p>
  </aside>;
}
