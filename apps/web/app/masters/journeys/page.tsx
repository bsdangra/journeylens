import type { Metadata } from "next";
import { JourneysScreen } from "@/components/masters/journeys-screen";

export const metadata: Metadata = {
  title: "Journeys",
};

export default function JourneysPage() {
  return <JourneysScreen />;
}
