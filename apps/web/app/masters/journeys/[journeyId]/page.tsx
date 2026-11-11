import type { Metadata } from "next";
import { Suspense } from "react";
import { JourneyStepsScreen } from "@/components/masters/journey-steps-screen";

export const metadata: Metadata = {
  title: "Journey Steps | JourneyLens",
};

export default function JourneyStepsPage() {
  return (
    <Suspense fallback={<section className="main-content" />}>
      <JourneyStepsScreen />
    </Suspense>
  );
}
