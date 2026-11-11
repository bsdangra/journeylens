"use client";

import Link from "next/link";
import { useState } from "react";
import { Page, SectionHeader } from "@/components/shell/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import {
  Avatar,
  ProgressBar,
  Stat,
  StatusBadge,
} from "@/components/ui/data-display";
import { EmptyState } from "@/components/ui/feedback";
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  GaugeIcon,
  HistoryIcon,
  PlayIcon,
  SearchIcon,
  TrashIcon,
} from "@/components/ui/icons";
import { ConfirmDialog, Modal } from "@/components/ui/modal";
import { SearchInput } from "@/components/ui/search-input";
import { useToast } from "@/components/ui/toast";
import { useEvaluationHistory } from "@/lib/evaluations/history-store";
import type { EvaluationRun } from "@/lib/evaluations/types";
import {
  formatDateTime,
  formatDuration,
  formatShortDate,
  formatTime,
  hostnameOf,
  plural,
} from "@/lib/format";
import { ScoreChart } from "./score-chart";

const CHART_RUN_COUNT = 12;

const passRate = (run: EvaluationRun) =>
  run.totalSteps ? (run.stepsPassed / run.totalSteps) * 100 : 0;

export function EvaluationsScreen() {
  const { runs, latestEvaluation, clearHistory } = useEvaluationHistory();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const normalizedQuery = query.trim().toLowerCase();
  const visible = runs.filter(
    (run) =>
      (statusFilter === "all" || run.status === statusFilter) &&
      [run.journeyName, run.websiteUrl, ...run.personas.map((p) => p.name)].some(
        (value) => value.toLowerCase().includes(normalizedQuery)
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
  const chartMetric = scores.length > 0 ? "score" : "passRate";

  const columns: Column<EvaluationRun>[] = [
    {
      header: "Journey",
      primary: true,
      cell: (run) => (
        <div className="cell-primary">
          <strong>{run.journeyName}</strong>
          <span>{hostnameOf(run.websiteUrl)}</span>
        </div>
      ),
    },
    {
      header: "Run",
      cell: (run) => (
        <div className="cell-primary" style={{ minWidth: 0 }}>
          <strong>{formatShortDate(run.createdAt)}</strong>
          <span>{formatTime(run.createdAt)}</span>
        </div>
      ),
    },
    {
      header: "Personas",
      cell: (run) => (
        <span className="cell-with-avatar" title={run.personas.map((p) => p.name).join(", ")}>
          {run.personas.slice(0, 3).map((persona) => (
            <Avatar key={persona.name} name={persona.name} size="sm" />
          ))}
          {run.personas.length > 3 && <span>+{run.personas.length - 3}</span>}
        </span>
      ),
    },
    { header: "Status", cell: (run) => <StatusBadge status={run.status} /> },
    {
      header: "Steps passed",
      cell: (run) => (
        <div style={{ display: "grid", gap: 6, minWidth: 110 }}>
          <span>
            {run.stepsPassed}/{run.totalSteps}
          </span>
          <ProgressBar
            value={passRate(run)}
            tone={passRate(run) === 100 ? "success" : "danger"}
            label="Steps passed"
          />
        </div>
      ),
    },
    { header: "Score", cell: (run) => run.score ?? <span className="stat-meta">Pending</span> },
    { header: "Findings", cell: (run) => run.findings },
    {
      header: "Actions",
      hideLabel: true,
      align: "right",
      cell: (run) => (
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          aria-label={`View ${run.journeyName} run from ${formatDateTime(run.createdAt)}`}
          onClick={() => setViewingId(run.id)}
        >
          View
        </button>
      ),
    },
  ];

  const newEvaluation = (
    <Link href="/" className="btn btn-primary">
      <PlayIcon size={14} /> New evaluation
    </Link>
  );

  return (
    <Page
      breadcrumbs={[{ label: "Workspace" }, { label: "Evaluation history" }]}
      title="Evaluation history"
      description="Every evaluation run in this browser tab. History is kept until the tab is closed."
      actions={
        <>
          {runs.length > 0 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setConfirmClear(true)}
            >
              <TrashIcon size={16} /> Clear history
            </button>
          )}
          {newEvaluation}
        </>
      }
    >
      {runs.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<HistoryIcon size={22} />}
            title="No evaluations yet"
            description="Runs you start from New evaluation appear here, with their status, steps passed and findings."
            actions={newEvaluation}
          />
        </div>
      ) : (
        <>
          <div className="stat-grid">
            <Stat
              label="Total runs"
              icon={<HistoryIcon size={16} />}
              value={runs.length}
              meta={`${completed.length} completed · ${runs.length - completed.length} failed`}
            />
            <Stat
              label="Success rate"
              icon={<CheckCircleIcon size={16} />}
              value={`${Math.round((completed.length / runs.length) * 100)}%`}
              meta="Runs that finished every step"
            />
            <Stat
              label="Average score"
              icon={<GaugeIcon size={16} />}
              value={averageScore ?? "–"}
              meta={
                scores.length
                  ? `Across ${plural(scores.length, "scored run")}`
                  : "Pending AI scoring"
              }
            />
            <Stat
              label="UX findings"
              icon={<AlertTriangleIcon size={16} />}
              value={totalFindings}
              meta="Across all runs"
            />
          </div>

          <section className="section">
            <SectionHeader
              title={chartMetric === "score" ? "Score trend" : "Steps passed trend"}
              description={`The ${plural(Math.min(runs.length, CHART_RUN_COUNT), "most recent run")}${
                chartMetric === "passRate" ? ". Shows pass rate until runs are scored." : "."
              }`}
            />
            <ScoreChart
              runs={runs.slice(0, CHART_RUN_COUNT).reverse()}
              metric={chartMetric}
            />
          </section>

          <section className="section">
            <SectionHeader
              title="All runs"
              description={`Showing ${visible.length} of ${runs.length}`}
              actions={
                <div className="toolbar">
                  <SearchInput
                    label="Search journey, site or persona"
                    value={query}
                    onChange={setQuery}
                  />
                  <select
                    className="select select-sm"
                    aria-label="Filter by status"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                  >
                    <option value="all">All statuses</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              }
            />
            {visible.length === 0 ? (
              <div className="card">
                <EmptyState
                  icon={<SearchIcon size={22} />}
                  title="No matching runs"
                  description="Try a different search term or status filter."
                  actions={
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setQuery("");
                        setStatusFilter("all");
                      }}
                    >
                      Clear filters
                    </button>
                  }
                />
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
        </>
      )}

      {viewing && (
        <Modal
          title={viewing.journeyName}
          description={`${formatDateTime(viewing.createdAt)} · ${hostnameOf(viewing.websiteUrl)}`}
          onClose={() => setViewingId(null)}
        >
          <div className="modal-body">
            <dl className="run-detail-stats">
              <div>
                <dt>Status</dt>
                <dd>
                  <StatusBadge status={viewing.status} />
                </dd>
              </div>
              <div>
                <dt>Overall score</dt>
                <dd>{viewing.score ?? "Pending"}</dd>
              </div>
              <div>
                <dt>Steps passed</dt>
                <dd>
                  {viewing.stepsPassed}/{viewing.totalSteps}
                </dd>
              </div>
              <div>
                <dt>Run time</dt>
                <dd>{formatDuration(viewing.durationMs)}</dd>
              </div>
            </dl>
            <h3 className="subheading">Personas</h3>
            <ul className="run-persona-list">
              {viewing.personas.map((persona) => (
                <li key={persona.name}>
                  <span className="cell-with-avatar">
                    <Avatar name={persona.name} size="sm" />
                    {persona.name}
                  </span>
                  <strong>{persona.score ?? <span className="stat-meta">Pending</span>}</strong>
                </li>
              ))}
            </ul>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setViewingId(null)}
            >
              Close
            </button>
            {latestEvaluation?.id === viewing.id && (
              <Link href="/#latest-result" className="btn btn-primary">
                Open full report
              </Link>
            )}
          </div>
        </Modal>
      )}

      {confirmClear && (
        <ConfirmDialog
          title="Clear evaluation history?"
          confirmLabel="Clear history"
          onClose={() => setConfirmClear(false)}
          onConfirm={() => {
            clearHistory();
            setConfirmClear(false);
            toast("Evaluation history cleared.");
          }}
        >
          <p>
            All {plural(runs.length, "run")} and the latest report will be
            removed from this browser tab. This cannot be undone.
          </p>
        </ConfirmDialog>
      )}
    </Page>
  );
}
