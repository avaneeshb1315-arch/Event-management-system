import styles from "./SeatMap.module.css";

const entries = [
  ["available", "Available"], ["selected", "Selected"], ["locked", "Locked"],
  ["reserved", "Reserved"], ["booked", "Booked"], ["disabled", "Disabled"],
] as const;

export default function SeatLegend() {
  return <ul className={styles.legend} aria-label="Seat status legend">
    {entries.map(([key, label]) => <li key={key}><span className={`${styles.swatch} ${styles[key]}`} aria-hidden="true" />{label}</li>)}
  </ul>;
}
