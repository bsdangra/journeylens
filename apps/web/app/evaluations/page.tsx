import type { Metadata } from "next";
import { EvaluationsScreen } from "@/components/evaluations/evaluations-screen";

export const metadata: Metadata = {
  title: "Evaluations | JourneyLens",
};

export default function EvaluationsPage() {
  return <EvaluationsScreen />;
}
