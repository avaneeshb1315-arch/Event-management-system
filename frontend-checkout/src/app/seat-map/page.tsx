import type { Metadata } from "next";
import SeatMap from "../../components/SeatMap";

export const metadata: Metadata = {
  title: "Choose your seats | Community 360",
  description: "Interactive venue seat selection preview.",
};

export default function SeatMapPage() {
  return <SeatMap />;
}
