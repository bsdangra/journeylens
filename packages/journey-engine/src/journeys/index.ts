import type { Journey } from "@journeylens/contracts";
import { purchaseJourney } from "./purchase.journey";

/** Every journey the engine can run. Add new journeys here. */
export const journeys: Journey[] = [purchaseJourney];
