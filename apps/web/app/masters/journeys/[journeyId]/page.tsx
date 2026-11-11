import type { Metadata } from "next";
import { Suspense } from "react";
import { JourneyStepsScreen } from "@/components/masters/journey-steps-screen";

export const metadata: Metadata = {
  title: "Journey steps",
};

export default function JourneyStepsPage() {
  return (
    <Suspense fallback={null}>
      <JourneyStepsScreen />
    </Suspense>
  );
}
