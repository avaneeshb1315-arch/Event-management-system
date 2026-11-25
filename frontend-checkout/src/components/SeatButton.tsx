import type { Seat } from "../types/seat";
import { formatPrice } from "../types/seat";
import styles from "./SeatMap.module.css";

type Props = { seat: Seat; selected: boolean; onToggle: (id: string) => void };

export default function SeatButton({ seat, selected, onToggle }: Props) {
  const label = `${seat.label}, ${formatPrice(seat.price)}, ${selected ? "selected" : seat.status.toLowerCase()}`;
  return (
    <button
      type="button"
      className={`${styles.seat} ${styles[seat.category.toLowerCase()]} ${styles[seat.status.toLowerCase()]} ${selected ? styles.selected : ""}`}
      aria-label={label}
      aria-pressed={selected}
      title={label}
      disabled={seat.status !== "AVAILABLE"}
      onClick={() => onToggle(seat.id)}
    >
      {seat.category === "MAIN" ? seat.number : <><span>{seat.category}</span><span>{seat.number}</span></>}
    </button>
  );
}
