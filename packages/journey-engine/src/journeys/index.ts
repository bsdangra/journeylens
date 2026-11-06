import type { Journey } from "@journeylens/contracts";
import { purchaseJourney } from "./purchase.journey";

export const availableJourneys: Journey[] = [purchaseJourney];

export function getJourneyById(id: string): Journey | undefined {
  return availableJourneys.find((journey) => journey.id === id);
}

export { purchaseJourney };

