"use client";

import Link from "next/link";
import { useState } from "react";
import { ContentPage } from "@/components/shell/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Metric } from "@/components/ui/metric";
import { Modal } from "@/components/ui/modal";
import { SearchInput } from "@/components/ui/search-input";
import { StatusBadge } from "@/components/ui/status-badge";
import { useEvaluationHistory } from "@/lib/evaluations/history-store";
import type { EvaluationRun } from "@/lib/evaluations/types";
import {
  formatDateTime,
  formatDuration,
  formatShortDate,
  hostnameOf,
} from "@/lib/format";
import { ScoreChart } from "./score-chart";

const CHART_RUN_COUNT = 10;

export function EvaluationsScreen() {
  const { runs, clearHistory } = useEvaluationHistory();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewingId, setViewingId] = useState<string | null>(null);

  const normalizedQuery = query.trim().toLowerCase();
  const visible = runs.filter(
    (run) =>
      (statusFilter === "all" || run.status === statusFilter) &&
      [run.journeyName, run.websiteUrl].some((value) =>
        value.toLowerCase().includes(normalizedQuery)
      )
  );
  const viewing = runs.find((run) => run.id === viewingId);

  const completed = runs.filter((run) => run.status === "completed");
  const scores = completed
    .map((run) => run.score)
    .filter((score): score is number => score !== null);
  const averageScore = scores.length
    ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length)
    : null;
  const totalFindings = runs.reduce((total, run) => total + run.findings, 0);

  const columns: Column<EvaluationRun>[] = [
    {
      header: "Journey",
      cell: (run) => (
        <div className="table-primary">
          <strong>{run.journeyName}</strong>
          <span>{hostnameOf(run.websiteUrl)}</span>
        </div>
      ),
    },
    { header: "Date", cell: (run) => formatShortDate(run.createdAt) },
    { header: "Personas", cell: (run) => run.personas.length },
    { header: "Status", cell: (run) => <StatusBadge status={run.status} /> },
    { header: "Score", cell: (run) => run.score ?? "—" },
    {
      header: "Steps passed",
      cell: (run) => `${run.stepsPassed}/${run.totalSteps}`,
    },
    {
      header: "Actions",
      cell: (run) => (
        <div className="row-actions">
          <button
            type="button"
            className="row-action"
            aria-label={`View ${run.journeyName} run from ${formatShortDate(run.createdAt)}`}
            onClick={() => setViewingId(run.id)}
          >
            View
          </button>
        </div>
      ),
    },
  ];

  return (
    <ContentPage
      eyebrow="WORKSPACE / EVALUATIONS"
      title="Evaluation history"
      actions={
        <>
          {runs.length > 0 && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                if (window.confirm("Clear all evaluation history in this tab?")) {
                  clearHistory();
                }
              }}
            >
              Clear history
            </button>
          )}
          <Link href="/" className="run-button topbar-link">
            New evaluation
          </Link>
        </>
      }
    >
      <section className="section" aria-label="Summary">
        <div className="metrics-grid">
          <Metric
            label="TOTAL RUNS"
            value={String(runs.length)}
            detail={`${completed.length} completed, ${runs.length - completed.length} failed`}
          />
          <Metric
            label="AVERAGE SCORE"
            value={averageScore === null ? "—" : String(averageScore)}
            detail={scores.length ? `Across ${scores.length} scored runs, out of 100` : "No scored runs yet"}
          />
          <Metric
            label="SUCCESS RATE"
            value={
              runs.length
                ? `${Math.round((completed.length / runs.length) * 100)}%`
                : "—"
            }
            detail="Runs that finished every step"
          />
          <Metric
            label="UX FINDINGS"
            value={String(totalFindings)}
            detail="Across all runs"
          />
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <h2>Score by run</h2>
            <p>The {Math.min(runs.length, CHART_RUN_COUNT)} most recent runs, out of 100.</p>
          </div>
        </div>
        {runs.length === 0 ? (
          <div className="empty-state">
            No evaluations yet. Run one from <Link href="/">Overview</Link>;
            results are kept until you close this tab.
          </div>
        ) : (
          <ScoreChart runs={runs.slice(0, CHART_RUN_COUNT).reverse()} />
        )}
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <h2>All runs</h2>
            <p>
              Showing {visible.length} of {runs.length}
            </p>
          </div>
          <div className="toolbar">
            <SearchInput
              label="Search by journey or website"
              value={query}
              onChange={setQuery}
            />
            <select
              className="form-control toolbar-select"
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="empty-state">
            {runs.length === 0 ? "No runs yet." : "No runs match these filters."}
          </div>
        ) : (
          <DataTable
            caption="Evaluation runs"
            columns={columns}
            rows={visible}
            rowKey={(run) => run.id}
          />
        )}
      </section>

      {viewing && (
        <Modal
          title={viewing.journeyName}
          description={formatDateTime(viewing.createdAt)}
          onClose={() => setViewingId(null)}
        >
          <div className="modal-body modal-copy">
            <StatusBadge status={viewing.status} />
            <dl className="run-facts">
              <div>
                <dt>Website</dt>
                <dd>{viewing.websiteUrl}</dd>
              </div>
              <div>
                <dt>Overall score</dt>
                <dd>{viewing.score ?? "—"}</dd>
              </div>
              <div>
                <dt>Steps passed</dt>
                <dd>
                  {viewing.stepsPassed}/{viewing.totalSteps}
                </dd>
              </div>
              <div>
                <dt>Findings</dt>
                <dd>{viewing.findings}</dd>
              </div>
              <div>
                <dt>Duration</dt>
                <dd>{formatDuration(viewing.durationMs)}</dd>
              </div>
            </dl>
            <h3>Personas</h3>
            <ul className="run-personas">
              {viewing.personas.map((persona) => (
                <li key={persona.name}>
                  <span>{persona.name}</span>
                  <strong>{persona.score ?? "—"}</strong>
                </li>
              ))}
            </ul>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setViewingId(null)}
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </ContentPage>
  );
}
