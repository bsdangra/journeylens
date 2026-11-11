import type { Metadata } from "next";
import { EvaluationsScreen } from "@/components/evaluations/evaluations-screen";

export const metadata: Metadata = {
  title: "Evaluation history",
};

export default function EvaluationsPage() {
  return <EvaluationsScreen />;
}
