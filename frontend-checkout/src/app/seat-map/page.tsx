import type { Metadata } from "next";
import SeatMap from "../../components/SeatMap";

export const metadata: Metadata = {
  title: "Choose your seats | Community 360",
  description: "Explore the venue and select your seats.",
};

export default async function SeatMapPage({ searchParams }: {
  searchParams: Promise<{ showId?: string | string[] }>;
}) {
  const { showId } = await searchParams;
  const validId = typeof showId === "string" && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(showId) ? showId : null;
  return <SeatMap key={validId ?? "no-show"} showId={validId} />;
}
