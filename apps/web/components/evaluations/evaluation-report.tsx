"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/shell/page-header";
import {
  Avatar,
  Badge,
  ProgressBar,
  ScoreRing,
  SeverityBadge,
  Stat,
  StatusBadge,
} from "@/components/ui/data-display";
import { EmptyState } from "@/components/ui/feedback";
import {
  AccessibilityIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronRightIcon,
  ClockIcon,
  ExternalLinkIcon,
  FileTextIcon,
  GaugeIcon,
  GlobeIcon,
  ImageIcon,
  InfoIcon,
  ListChecksIcon,
  SparklesIcon,
  UsersIcon,
  XCircleIcon,
  XIcon,
} from "@/components/ui/icons";
import { API_URL } from "@/lib/api";
import { useCatalog, useJourney } from "@/lib/catalog/store";
import { formatDateTime, formatDuration, hostnameOf, plural } from "@/lib/format";
import type { Evaluation, Execution, PersonaReport } from "@/lib/evaluations/types";

type Step = Execution["steps"][number];
type Finding = PersonaReport["findings"][number] & { personaId: string };

const SEVERITY_ORDER = ["critical", "high", "medium", "low"];

function screenshotUrl(path: string) {
  return `${API_URL}/screenshots/${encodeURIComponent(path.split(/[\\/]/).pop() ?? "")}`;
}

/* ---------- Persona result card ---------- */

function PersonaResult({
  name,
  report,
  execution,
}: {
  name: string;
  report: PersonaReport;
  execution?: Execution;
}) {
  const { totalSteps, completedSteps } = report.efficiency;
  const passRate = totalSteps ? (completedSteps / totalSteps) * 100 : 0;
  const breakdown = [
    ["Usability", report.score.usability],
    ["Efficiency", report.score.efficiency],
    ["Access.", report.score.accessibility],
    ["Clarity", report.score.clarity],
  ] as const;

  return (
    <article className="card persona-result">
      <div className="persona-result-head">
        <Avatar name={name} />
        <div>
          <h3>{name}</h3>
          <p>
            <StatusBadge status={execution?.status ?? "pending"} />
          </p>
        </div>
        <ScoreRing score={report.score.overall} />
      </div>

      {report.summary && <p className="persona-summary">{report.summary}</p>}

      <div className="metric-rows">
        <div className="metric-row">
          <span>Steps passed</span>
          <strong>
            {completedSteps}/{totalSteps}
          </strong>
          <ProgressBar
            value={passRate}
            tone={passRate === 100 ? "success" : "danger"}
            label={`${name}: steps passed`}
          />
        </div>
        <div className="metric-row">
          <span>Average action time</span>
          <strong>{formatDuration(report.efficiency.averageActionDurationMs)}</strong>
        </div>
        <div className="metric-row">
          <span>Journey duration</span>
          <strong>{formatDuration(report.efficiency.journeyDurationMs)}</strong>
        </div>
        <div className="metric-row">
          <span>UX findings</span>
          <strong>{report.findings.length}</strong>
        </div>
      </div>

      <div className="score-breakdown" aria-label="Score breakdown">
        {breakdown.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value ?? "–"}</strong>
          </div>
        ))}
      </div>
    </article>
  );
}

/* ---------- Findings ---------- */

function FindingItem({
  finding,
  personaName,
  showPersona,
}: {
  finding: Finding;
  personaName: string;
  showPersona: boolean;
}) {
  const Icon =
    finding.severity === "low" ? InfoIcon : AlertTriangleIcon;
  return (
    <article className="finding">
      <span className={`finding-icon is-${finding.severity}`} aria-hidden="true">
        <Icon size={16} />
      </span>
      <div className="finding-body">
        <div className="finding-head">
          <h3>{finding.title}</h3>
          <SeverityBadge severity={finding.severity} />
          {showPersona && <Badge>{personaName}</Badge>}
        </div>
        <p>{finding.description}</p>
        {finding.recommendation && (
          <div className="recommendation">
            <SparklesIcon size={16} />
            <div>
              <strong>Recommendation</strong>
              <p>{finding.recommendation}</p>
            </div>
          </div>
        )}
        {finding.evidence.length > 0 && (
          <details className="disclosure">
            <summary>
              <ChevronRightIcon size={14} />
              Evidence ({finding.evidence.length})
            </summary>
            <ul className="evidence-list">
              {finding.evidence.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </article>
  );
}

function FindingsPanel({
  findings,
  personaName,
  multiplePersonas,
}: {
  findings: Finding[];
  personaName: (id: string) => string;
  multiplePersonas: boolean;
}) {
  const [severity, setSeverity] = useState("all");
  const counts = Object.fromEntries(
    SEVERITY_ORDER.map((level) => [
      level,
      findings.filter((finding) => finding.severity === level).length,
    ])
  );
  const levels = SEVERITY_ORDER.filter((level) => counts[level] > 0);
  const visible = findings
    .filter((finding) => severity === "all" || finding.severity === severity)
    .sort(
      (a, b) =>
        SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
    );

  return (
    <section className="section" aria-labelledby="findings-heading">
      <SectionHeader
        id="findings-heading"
        title="UX findings"
        description="Issues detected while each persona ran the journey, most severe first."
        actions={
          findings.length > 0 && (
            <div className="tabs" role="group" aria-label="Filter by severity">
              <button
                type="button"
                className="tab"
                aria-pressed={severity === "all"}
                onClick={() => setSeverity("all")}
              >
                All <span className="tab-count">{findings.length}</span>
              </button>
              {levels.map((level) => (
                <button
                  type="button"
                  key={level}
                  className="tab"
                  aria-pressed={severity === level}
                  onClick={() => setSeverity(level)}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                  <span className="tab-count">{counts[level]}</span>
                </button>
              ))}
            </div>
          )
        }
      />
      <div className="card">
        {findings.length === 0 ? (
          <EmptyState
            icon={<CheckCircleIcon size={22} />}
            title="No findings"
            description="No UX issues were detected in this run."
          />
        ) : (
          <div className="finding-list">
            {visible.map((finding, index) => (
              <FindingItem
                key={`${finding.personaId}-${finding.id}-${index}`}
                finding={finding}
                personaName={personaName(finding.personaId)}
                showPersona={multiplePersonas}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- Execution timeline ---------- */

function StepEvidence({ step }: { step: Step }) {
  const a11y = step.accessibility;
  return (
    <div className="timeline-detail">
      {step.error && (
        <div className="evidence-panel is-danger is-wide">
          <h4>
            <XCircleIcon size={14} /> Execution error
          </h4>
          <p>{step.error}</p>
        </div>
      )}

      {step.screenshotPath && (
        <div className="evidence-panel">
          <h4>
            <ImageIcon size={14} /> Screenshot
          </h4>
          <a
            className="screenshot-link"
            href={screenshotUrl(step.screenshotPath)}
            target="_blank"
            rel="noreferrer"
          >
            {/* Screenshots are served by the API, outside next/image's loader. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={screenshotUrl(step.screenshotPath)}
              alt={`Browser after: ${step.stepId}`}
              loading="lazy"
            />
          </a>
        </div>
      )}

      <div className="evidence-panel">
        <h4>
          <ClockIcon size={14} /> Details
        </h4>
        <dl className="kv">
          {step.pageTitle && (
            <>
              <dt>Page</dt>
              <dd>{step.pageTitle}</dd>
            </>
          )}
          {step.pageUrl && (
            <>
              <dt>URL</dt>
              <dd>
                <a className="link" href={step.pageUrl} target="_blank" rel="noreferrer">
                  {step.pageUrl} <ExternalLinkIcon size={12} />
                </a>
              </dd>
            </>
          )}
          <dt>Total</dt>
          <dd>{formatDuration(step.durationMs)}</dd>
          {step.actionDurationMs != null && (
            <>
              <dt>Action</dt>
              <dd>{formatDuration(step.actionDurationMs)}</dd>
            </>
          )}
          {step.assertionDurationMs != null && (
            <>
              <dt>Assertions</dt>
              <dd>{formatDuration(step.assertionDurationMs)}</dd>
            </>
          )}
        </dl>
      </div>

      {step.assertions && step.assertions.length > 0 && (
        <div className="evidence-panel">
          <h4>
            <ListChecksIcon size={14} /> Assertions
          </h4>
          <div className="evidence-rows">
            {step.assertions.map((assertion, index) => (
              <div className="evidence-row" key={index}>
                {assertion.passed ? (
                  <CheckIcon size={14} className="is-pass" />
                ) : (
                  <XIcon size={14} className="is-fail" />
                )}
                <div>
                  <strong>{assertion.description}</strong>
                  <p>
                    Expected {String(assertion.expected ?? "–")}, got{" "}
                    {String(assertion.actual ?? "–")}
                  </p>
                  {assertion.error && <p>{assertion.error}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {a11y && (
        <div className="evidence-panel">
          <h4>
            <AccessibilityIcon size={14} /> Accessibility scan
          </h4>
          <dl className="kv">
            <dt>Passed checks</dt>
            <dd>{a11y.passes}</dd>
            <dt>Violations</dt>
            <dd>{a11y.violations.length}</dd>
            <dt>Needs review</dt>
            <dd>{a11y.incomplete}</dd>
          </dl>
          {a11y.violations.length > 0 && (
            <div className="evidence-rows" style={{ marginTop: 12 }}>
              {a11y.violations.map((violation, index) => (
                <div className="evidence-row" key={index}>
                  <AlertTriangleIcon size={14} className="is-fail" />
                  <div>
                    <strong>
                      {violation.help}
                      {violation.impact ? ` · ${violation.impact}` : ""}
                    </strong>
                    <a className="link" href={violation.helpUrl} target="_blank" rel="noreferrer">
                      Guidance <ExternalLinkIcon size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {step.consoleErrors && step.consoleErrors.length > 0 && (
        <div className="evidence-panel is-danger">
          <h4>Console errors ({step.consoleErrors.length})</h4>
          <ul className="evidence-rows">
            {step.consoleErrors.map((message, index) => (
              <li key={index} className="mono">
                {message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {step.failedRequests && step.failedRequests.length > 0 && (
        <div className="evidence-panel is-danger">
          <h4>Failed requests ({step.failedRequests.length})</h4>
          <ul className="evidence-rows">
            {step.failedRequests.map((request, index) => (
              <li key={index} className="mono">
                {request.method} {request.url} · {request.failure}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ExecutionPanel({
  executions,
  personaName,
  stepName,
}: {
  executions: Execution[];
  personaName: (id: string) => string;
  stepName: (id: string) => string;
}) {
  const [activeId, setActiveId] = useState(executions[0]?.personaId ?? "");
  const active =
    executions.find((execution) => execution.personaId === activeId) ??
    executions[0];

  if (!active) return null;
  const passed = active.steps.filter((step) => step.status === "passed").length;

  return (
    <section className="section" aria-labelledby="execution-heading">
      <SectionHeader
        id="execution-heading"
        title="Journey execution"
        description="Every step the browser performed, with screenshots and checks. Select a step for its evidence."
        actions={
          executions.length > 1 && (
            <div className="tabs" role="tablist" aria-label="Persona">
              {executions.map((execution) => (
                <button
                  type="button"
                  role="tab"
                  key={execution.personaId}
                  className="tab"
                  aria-selected={execution.personaId === active.personaId}
                  onClick={() => setActiveId(execution.personaId)}
                >
                  {personaName(execution.personaId)}
                </button>
              ))}
            </div>
          )
        }
      />
      <div className="card">
        <div className="card-header">
          <div className="run-step-title">
            <Avatar name={personaName(active.personaId)} size="sm" />
            <div>
              <h3>{personaName(active.personaId)}</h3>
              <p>
                {passed} of {active.steps.length} steps passed ·{" "}
                {formatDuration(active.durationMs)}
              </p>
            </div>
          </div>
          <StatusBadge status={active.status} />
        </div>
        <div className="timeline">
          {active.steps.map((step, index) => (
            <details className="timeline-step" key={`${step.stepId}-${index}`}>
              <summary>
                <span className="timeline-index">{index + 1}</span>
                <span
                  className={`status-icon is-${step.status}`}
                  aria-label={step.status}
                >
                  {step.status === "passed" ? (
                    <CheckIcon size={12} />
                  ) : step.status === "failed" ? (
                    <XIcon size={12} />
                  ) : (
                    <ChevronRightIcon size={12} />
                  )}
                </span>
                <span className="timeline-title">
                  <strong>{stepName(step.stepId)}</strong>
                  <span>{step.pageTitle ?? step.stepId}</span>
                </span>
                <span className="timeline-duration">
                  {formatDuration(step.durationMs)}
                </span>
                <ChevronRightIcon size={16} className="timeline-chevron" />
              </summary>
              <StepEvidence step={step} />
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Report ---------- */

export function EvaluationReport({ evaluation }: { evaluation: Evaluation }) {
  const { state: catalog } = useCatalog();
  const { state: journeyState } = useJourney(evaluation.journeyId);
  const journey = journeyState.status === "ready" ? journeyState.data : null;
  const journeyName =
    journey?.name ??
    (catalog.status === "ready"
      ? catalog.data.journeys.find((item) => item.id === evaluation.journeyId)?.name
      : undefined) ??
    evaluation.journeyId;

  const personaName = (id: string) => evaluation.personaNames[id] ?? id;
  const stepName = (id: string) =>
    journey?.steps.find((step) => step.id === id)?.description ?? id;

  const { reports, executions } = evaluation;
  const steps = executions.flatMap((execution) => execution.steps);
  const passedSteps = steps.filter((step) => step.status === "passed").length;
  const passRate = steps.length ? Math.round((passedSteps / steps.length) * 100) : 0;
  const findings: Finding[] = reports.flatMap((report) =>
    report.findings.map((finding) => ({ ...finding, personaId: report.personaId }))
  );
  const severityCounts = SEVERITY_ORDER.map((level) => ({
    level,
    count: findings.filter((finding) => finding.severity === level).length,
  })).filter((item) => item.count > 0);
  const totalDuration = executions.reduce(
    (total, execution) => total + (execution.durationMs ?? 0),
    0
  );
  const unscored = reports.every((report) => report.score.overall === null);

  return (
    <div className="report">
      <div className="card report-hero">
        <div className="report-hero-title">
          <span className="report-hero-icon" aria-hidden="true">
            <FileTextIcon size={22} />
          </span>
          <div>
            <h2>{journeyName}</h2>
            <div className="report-hero-meta">
              <span>
                <GlobeIcon size={14} /> {hostnameOf(evaluation.websiteUrl)}
              </span>
              <span>
                <ClockIcon size={14} /> {formatDateTime(evaluation.createdAt)}
              </span>
              <span>
                <UsersIcon size={14} /> {plural(reports.length, "persona")}
              </span>
              <span className="id-chip" title={evaluation.id}>
                {evaluation.id.slice(0, 8)}
              </span>
            </div>
          </div>
        </div>
        <StatusBadge status={evaluation.status} />
      </div>

      <div className="stat-grid" style={{ marginTop: 16 }}>
        <Stat
          label="Steps passed"
          icon={<ListChecksIcon size={16} />}
          value={`${passRate}%`}
          meta={`${passedSteps} of ${steps.length} steps across all personas`}
        />
        <Stat
          label="Personas"
          icon={<UsersIcon size={16} />}
          value={reports.length}
          meta="Independent browser runs"
        />
        <Stat
          label="UX findings"
          icon={<AlertTriangleIcon size={16} />}
          value={findings.length}
          meta={
            severityCounts.length
              ? severityCounts.map((item) => `${item.count} ${item.level}`).join(" · ")
              : "No issues detected"
          }
        />
        <Stat
          label="Run time"
          icon={<GaugeIcon size={16} />}
          value={formatDuration(totalDuration)}
          meta="Browser time, all personas"
        />
      </div>

      {unscored && (
        <div className="alert alert-info" style={{ marginTop: 16 }}>
          <SparklesIcon size={18} />
          <div className="alert-content">
            <strong>UX scores are pending</strong>
            <p>
              Scores appear once AI scoring is connected. The findings and step
              evidence below come straight from the browser run.
            </p>
          </div>
        </div>
      )}

      <section className="section" aria-labelledby="personas-heading">
        <SectionHeader
          id="personas-heading"
          title="Persona results"
          description="How the journey performed for each simulated user."
        />
        <div className="persona-grid">
          {reports.map((report) => (
            <PersonaResult
              key={report.personaId}
              name={personaName(report.personaId)}
              report={report}
              execution={executions.find(
                (execution) => execution.personaId === report.personaId
              )}
            />
          ))}
        </div>
      </section>

      <FindingsPanel
        findings={findings}
        personaName={personaName}
        multiplePersonas={reports.length > 1}
      />

      <ExecutionPanel
        executions={executions}
        personaName={personaName}
        stepName={stepName}
      />
    </div>
  );
}
