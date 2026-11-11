import { formatShortDate } from "@/lib/format";
import type { EvaluationRun } from "@/lib/evaluations/types";

const GRID_LINES = [100, 50, 0];

/** Single-series column chart of the most recent runs, oldest on the left. */
export function ScoreChart({ runs }: { runs: EvaluationRun[] }) {
  return (
    <div className="panel score-chart-panel">
      <div className="score-chart">
        <div className="score-chart-grid" aria-hidden="true">
          {GRID_LINES.map((line) => (
            <span key={line} style={{ bottom: `${line}%` }}>
              <small>{line}</small>
            </span>
          ))}
        </div>
        <ul className="score-chart-columns" aria-label="Score by run, oldest to newest">
          {runs.map((run, index) => {
            const summary =
              run.score !== null
                ? `Score ${run.score} of 100`
                : run.status === "failed"
                  ? "Failed, no score"
                  : "Completed, not scored yet";
            const isLatest = index === runs.length - 1;
            return (
              <li
                key={run.id}
                className="score-column"
                tabIndex={0}
                aria-label={`${formatShortDate(run.createdAt)}, ${run.journeyName}: ${summary}`}
              >
                <div className="score-column-plot">
                  {run.score === null ? (
                    <span className="score-column-failed" aria-hidden="true">
                      {run.status === "failed" ? "✕" : "–"}
                    </span>
                  ) : (
                    <span
                      className="score-column-bar"
                      style={{ height: `${run.score}%` }}
                    >
                      {isLatest && (
                        <span className="score-column-value">{run.score}</span>
                      )}
                    </span>
                  )}
                </div>
                <small className="score-column-date" aria-hidden="true">
                  {formatShortDate(run.createdAt)}
                </small>
                <span className="score-tooltip" role="presentation">
                  <strong>{summary}</strong>
                  {run.journeyName}
                  <br />
                  {formatShortDate(run.createdAt)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <p className="score-chart-note">✕ marks a failed run; – marks a completed run that has no score yet.</p>
    </div>
  );
}
