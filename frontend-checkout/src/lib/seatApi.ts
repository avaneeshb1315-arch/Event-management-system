import type { Seat, SeatCategory, SeatStatus } from "../types/seat";

const statuses: SeatStatus[] = ["AVAILABLE", "LOCKED", "RESERVED", "BOOKED", "DISABLED"];
const blocks: Record<string, SeatCategory> = { vip: "VIP", pt: "PT", g: "G", "main hall": "MAIN" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeSeats(data: unknown): Seat[] {
  if (!Array.isArray(data)) throw new Error("Invalid seat response from the server.");
  if (!data.length) throw new Error("No seats are configured for this show.");
  const ids = new Set<string>(), positions = new Set<string>();
  const seats = data.map((value: unknown): Seat => {
    if (!isRecord(value)) throw new Error("Invalid seat record.");
    const { id, block, row, number, status, price } = value;
    const category = typeof block === "string" ? blocks[block.trim().toLowerCase()] : undefined;
    if (!category || !["VIP", "PT", "G", "MAIN"].includes(category) || typeof id !== "string" || !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id) || ids.has(id) || typeof number !== "number" || !Number.isInteger(number) || number < 1 || typeof status !== "string" || !statuses.includes(status as SeatStatus) || typeof price !== "number" || !Number.isFinite(price) || price < 0) {
      throw new Error("Invalid or unsupported seat details received from the server.");
    }
    const rowLabel = typeof row === "string" ? row.trim().toUpperCase() : null;
    const limit = category === "VIP" ? 12 : category === "MAIN" ? 20 : 24;
    if (number > limit || (category === "MAIN" ? !rowLabel || !/^[A-J]$/.test(rowLabel) : rowLabel !== category)) {
      throw new Error("The show layout does not match this venue.");
    }
    const label = category === "MAIN" ? `${rowLabel}${number}` : `${category}-${number}`;
    if (positions.has(label)) throw new Error("Duplicate seat position in the venue.");
    ids.add(id); positions.add(label);
    return { id, label, category, row: rowLabel, number, status: status as SeatStatus, price };
  });
  // This map is specifically for the approved 260-seat auditorium. Never draw an incomplete or different layout.
  if (seats.length !== 260) throw new Error("The venue layout is incomplete or does not match this auditorium.");
  return seats.sort((a, b) => (a.row ?? "").localeCompare(b.row ?? "") || a.number - b.number);
}

export async function fetchShowSeats(showId: string, signal: AbortSignal): Promise<Seat[]> {
  const response = await fetch(`/api/shows/${encodeURIComponent(showId)}/seats`, { cache: "no-store", signal });
  if (!response.ok) throw new Error(`Unable to retrieve seat availability (HTTP ${response.status}).`);
  return normalizeSeats(await response.json());
}
