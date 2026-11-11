import { formatShortDate } from "@/lib/format";
import type { EvaluationRun } from "@/lib/evaluations/types";

const GRID_LINES = [100, 75, 50, 25, 0];

export type ChartMetric = "score" | "passRate";

function valueOf(run: EvaluationRun, metric: ChartMetric) {
  if (metric === "score") return run.score;
  return run.totalSteps
    ? Math.round((run.stepsPassed / run.totalSteps) * 100)
    : null;
}

/** Column chart of recent runs, oldest on the left. */
export function ScoreChart({
  runs,
  metric,
}: {
  runs: EvaluationRun[];
  metric: ChartMetric;
}) {
  const unit = metric === "score" ? "Score" : "Steps passed";

  return (
    <div className="card">
      <div className="chart">
        <div className="chart-grid" aria-hidden="true">
          {GRID_LINES.map((line) => (
            <span key={line} style={{ bottom: `${line}%` }}>
              <small>
                {line}
                {metric === "passRate" ? "%" : ""}
              </small>
            </span>
          ))}
        </div>
        <ul
          className="chart-bars"
          aria-label={`${unit} by run, oldest to newest`}
        >
          {runs.map((run) => {
            const value = valueOf(run, metric);
            const summary =
              value !== null
                ? `${unit} ${value}${metric === "passRate" ? "%" : " of 100"}`
                : run.status === "failed"
                  ? "Failed run"
                  : "Not scored yet";
            return (
              <li
                key={run.id}
                className="chart-bar"
                tabIndex={0}
                aria-label={`${formatShortDate(run.createdAt)}, ${run.journeyName}: ${summary}`}
              >
                {value !== null ? (
                  <span
                    className="chart-bar-fill"
                    style={{ height: `${value}%` }}
                  />
                ) : (
                  <span
                    className={`chart-bar-empty${run.status === "failed" ? " is-failed" : ""}`}
                    aria-hidden="true"
                  >
                    {run.status === "failed" ? "✕" : "–"}
                  </span>
                )}
                <span className="chart-bar-label" aria-hidden="true">
                  {formatShortDate(run.createdAt)}
                </span>
                <span className="chart-tooltip" role="presentation">
                  <strong>{summary}</strong>
                  {run.journeyName} · {run.personas.length} persona
                  {run.personas.length === 1 ? "" : "s"}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="chart-legend">
        <span>Hover or focus a column for details.</span>
        <span>✕ failed run</span>
      </div>
    </div>
  );
}
