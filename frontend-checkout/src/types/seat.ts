export type SeatCategory = "VIP" | "PT" | "G" | "MAIN";
export type SeatStatus = "AVAILABLE" | "LOCKED" | "RESERVED" | "BOOKED" | "DISABLED";

export interface Seat {
  id: string;
  label: string;
  category: SeatCategory;
  row: string | null;
  number: number;
  status: SeatStatus;
  price: number;
}

export const CATEGORY_NAMES: Record<SeatCategory, string> = {
  VIP: "VIP", PT: "PT", G: "G", MAIN: "Main Hall",
};
export const MAX_SEATS = 6;
export const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
