import type { Evaluation, EvaluationRun } from "./types";

/** Reduces a full evaluation to one row for the Evaluations history. */
export function toEvaluationRun(
  evaluation: Evaluation,
  journeyName: string
): EvaluationRun {
  const scores = evaluation.reports
    .map((report) => report.score?.overall)
    .filter((score): score is number => typeof score === "number");
  const steps = evaluation.executions.flatMap((execution) => execution.steps);
  const status = evaluation.status === "completed" ? "completed" : "failed";

  return {
    id: evaluation.id,
    websiteUrl: evaluation.websiteUrl,
    journeyName,
    personas: evaluation.reports.map((report) => ({
      name: evaluation.personaNames[report.personaId] ?? report.personaId,
      score: report.score?.overall ?? null,
    })),
    status,
    score:
      status === "completed" && scores.length > 0
        ? Math.round(
            scores.reduce((total, score) => total + score, 0) / scores.length
          )
        : null,
    stepsPassed: steps.filter((step) => step.status === "passed").length,
    totalSteps: steps.length,
    findings: evaluation.reports.reduce(
      (total, report) => total + report.findings.length,
      0
    ),
    // Personas run one after another, so the run takes their combined time.
    durationMs: evaluation.executions.reduce(
      (total, execution) => total + (execution.durationMs ?? 0),
      0
    ),
    createdAt: evaluation.createdAt,
  };
}
