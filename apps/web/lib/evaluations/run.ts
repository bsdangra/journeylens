import type {
  EvaluationRequest,
  JourneySummary,
  Persona,
} from "@journeylens/contracts";
import { apiRequest } from "@/lib/api";
import type { Evaluation } from "./types";

/** Runs a journey for the chosen personas via POST /evaluations. */
export async function runEvaluation(
  journey: JourneySummary,
  personas: Persona[]
): Promise<Evaluation> {
  const request: EvaluationRequest = {
    journeyId: journey.id,
    personaIds: personas.map((persona) => persona.id),
  };

  const result = await apiRequest<Omit<Evaluation, "personaNames">>(
    "/evaluations",
    { method: "POST", body: request }
  );

  return {
    ...result,
    reports: result.reports ?? [],
    executions: result.executions ?? [],
    // Keep names as they were at run time, so history reads well later.
    personaNames: Object.fromEntries(
      personas.map((persona) => [persona.id, persona.name])
    ),
  };
}
