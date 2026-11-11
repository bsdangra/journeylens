"use client";

import { useState } from "react";

type PersonaReport = {
  personaId: string;
  summary: string;
  score: {
    overall: number | null;
    usability: number | null;
    efficiency: number | null;
    accessibility: number | null;
    clarity: number | null;
  };
  efficiency: {
    totalSteps: number;
    completedSteps: number;
    failedSteps: number;
    journeyDurationMs: number | null;
    averageActionDurationMs: number | null;
  };
  findings: {
    id: string;
    title: string;
    description: string;
    severity: string;
    recommendation: string;
    evidence: string[];
  }[];
};

type Execution = {
  personaId: string;
  status: string;
  durationMs?: number;
  steps: {
    stepId: string;
    status: string;
    durationMs: number;
    screenshotPath?: string;
    pageTitle?: string;
    pageUrl?: string;
    error?: string;

    assertions?: {
      description: string;
      passed: boolean;
      expected?: string | number;
      actual?: string | number;
      error?: string;
    }[];

    consoleErrors?: string[];

    failedRequests?: {
      url: string;
      method: string;
      failure: string;
    }[];

    interactions?: {
      action: string;
      target?: string;
      value?: string;
      timestamp: string;
    }[];

    actionDurationMs?: number;
    assertionDurationMs?: number;

    accessibility?: {
      violations: {
        id: string;
        impact: string | null;
        description: string;
        help: string;
        helpUrl: string;
        affectedElements: {
          target: string[];
          failureSummary: string | null;
        }[];
      }[];
      incompleteChecks: {
        id: string;
        impact: string | null;
        description: string;
        help: string;
        helpUrl: string;
        affectedElements: {
          target: string[];
          failureSummary: string | null;
        }[];
      }[];
      passes: number;
      incomplete: number;
      timestamp: string;
    };
  }[];
};

type Evaluation = {
  id: string;
  websiteUrl: string;
  journeyId: string;
  status: string;
  createdAt: string;
  reports: PersonaReport[];
  executions: Execution[];
};

function getApiUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined" && window.location.hostname) {
    return `http://${window.location.hostname}:3000`;
  }
  return "http://localhost:3000";
}

const personaNames: Record<string, string> = {
  "first-time-shopper": "First-time shopper",
  "time-conscious-shopper": "Time-conscious shopper",
  "accessibility-conscious-shopper": "Accessibility-conscious shopper",
};

function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="metric-card">
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
      <p className="metric-detail">{detail}</p>
    </div>
  );
}

export default function Home() {
  const apiUrl = getApiUrl();
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("https://www.saucedemo.com/");
  const [selectedJourneyId, setSelectedJourneyId] = useState("JL-JRN-001");
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([
    "first-time-shopper",
    "time-conscious-shopper",
    "accessibility-conscious-shopper",
  ]);

  const togglePersona = (id: string) => {
    if (selectedPersonas.includes(id)) {
      if (selectedPersonas.length > 1) {
        setSelectedPersonas(selectedPersonas.filter((p) => p !== id));
      }
    } else {
      setSelectedPersonas([...selectedPersonas, id]);
    }
  };

  async function runEvaluation() {
    const apiUrl = getApiUrl();
    const targetUrl = websiteUrl.trim() || "https://www.saucedemo.com/";
    console.log("[JourneyLens] 'Run Evaluation' clicked");
    console.log("[JourneyLens] Calling endpoint:", `${apiUrl}/evaluations`);
    console.log("[JourneyLens] Payload:", {
      journeyId: selectedJourneyId,
      websiteUrl: targetUrl,
      personaIds: selectedPersonas,
    });

    setLoading(true);
    setError("");
    setEvaluation(null);

    try {
      const response = await fetch(`${apiUrl}/evaluations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journeyId: selectedJourneyId,
          websiteUrl: targetUrl,
          personaIds: selectedPersonas,
        }),
      });

      console.log("[JourneyLens] Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `API returned ${response.status}`
        );
      }

      const result: Evaluation = await response.json();
      console.log("[JourneyLens] Evaluation succeeded:", result);
      setEvaluation(result);
    } catch (err) {
      console.error("[JourneyLens] Evaluation failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while running the evaluation."
      );
    } finally {
      setLoading(false);
    }
  }

  const reports = evaluation?.reports ?? [];
  const executions = evaluation?.executions ?? [];
  const totalSteps = executions.reduce(
    (total, execution) => total + execution.steps.length,
    0
  );
  const completedSteps = executions.reduce(
    (total, execution) =>
      total +
      execution.steps.filter((step) => step.status === "passed").length,
    0
  );
  const findings = reports.flatMap((report) =>
    report.findings.map((finding) => ({
      ...finding,
      personaId: report.personaId,
    }))
  );

  return (
    <main className="dashboard">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">J</div>
          <span>journey<span className="brand-light">lens</span></span>
        </div>

        <p className="nav-caption">WORKSPACE</p>
        <div className="nav-item active">
          <span>◫</span> Overview
        </div>
        <div className="nav-item">
          <span>◎</span> Evaluations
        </div>
        <div className="nav-item">
          <span>♙</span> Personas
        </div>

        <div className="sidebar-bottom">
          <div className="status-dot" />
          <span>Local environment</span>
        </div>
      </aside>

      <section className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">WORKSPACE / OVERVIEW</p>
            <h1>Website experience overview</h1>
          </div>
          <div className="avatar">B</div>
        </header>

        <section className="welcome-section">
          <div>
            <p className="eyebrow">AI-ASSISTED UX EVALUATION</p>
            <h2>Understand your user journey.</h2>
            <p className="welcome-copy">
              Simulate user journeys, uncover friction, and evaluate
              experiences through different user perspectives.
            </p>
          </div>
          <div className="welcome-decoration">J</div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div>
              <h2>Start an evaluation</h2>
              <p>Run the configured demo journey against SauceDemo.</p>
            </div>
            <span className="demo-tag">DEMO CONFIGURATION</span>
          </div>

          <div className="evaluation-form">
            <div className="field">
              <label>WEBSITE URL</label>
              <div className="url-input">
                <span>↗</span>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://www.saucedemo.com/"
                  title="Target website URL for evaluation"
                />
              </div>
            </div>
            <div className="field">
              <label>USER JOURNEY</label>
              <div className="select-display" style={{ position: "relative" }}>
                <select
                  value={selectedJourneyId}
                  onChange={(e) => setSelectedJourneyId(e.target.value)}
                  style={{
                    appearance: "none",
                    WebkitAppearance: "none",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    width: "100%",
                    color: "inherit",
                    fontSize: "inherit",
                    cursor: "pointer",
                    paddingRight: "20px",
                  }}
                >
                  <option value="JL-JRN-001">Purchase a product (SauceDemo)</option>
                </select>
                <span style={{ pointerEvents: "none", position: "absolute", right: "12px" }}>⌄</span>
              </div>
            </div>
            <button
              type="button"
              className="run-button"
              onClick={runEvaluation}
              disabled={loading || selectedPersonas.length === 0}
            >
              {loading ? (
                <>
                  <span className="spinner" /> Running evaluation...
                </>
              ) : (
                <>Run Evaluation <span>→</span></>
              )}
            </button>
          </div>

          <div className="persona-row">
            <span className="persona-label">EVALUATION PERSONAS</span>
            {Object.entries(personaNames).map(([id, name], index) => {
              const isSelected = selectedPersonas.includes(id);
              return (
                <button
                  type="button"
                  className="persona-chip"
                  key={id}
                  onClick={() => togglePersona(id)}
                  style={{
                    opacity: isSelected ? 1 : 0.45,
                    cursor: "pointer",
                    border: isSelected ? "1px solid #c9c3ff" : "1px solid var(--border)",
                    backgroundColor: isSelected ? "#f9f8ff" : "#fff",
                  }}
                  title={isSelected ? "Click to deselect persona" : "Click to select persona"}
                >
                  <span className={`persona-dot dot-${index}`} />
                  {name}
                </button>
              );
            })}
          </div>

          {error && (
            <div className="error-banner">
              <strong>Could not run evaluation.</strong> {error}
              <p>
                Check that the NestJS API is running and its CORS configuration
                allows the web app.
              </p>
            </div>
          )}
        </section>

        <section className="section">
          <div className="section-heading">
            <div>
              <h2>Evaluation results</h2>
              <p>
                {evaluation
                  ? `Evaluation ${evaluation.id.slice(0, 8)} · ${new Date(
                      evaluation.createdAt
                    ).toLocaleString()}`
                  : "Your latest evaluation results will appear here."}
              </p>
            </div>
            {evaluation && (
              <span className="success-tag">
                <span className="status-dot" /> {evaluation.status}
              </span>
            )}
          </div>

          <div className="metrics-grid">
            <Metric
              label="COMPLETION RATE"
              value={
                totalSteps
                  ? `${Math.round((completedSteps / totalSteps) * 100)}%`
                  : "—"
              }
              detail={
                totalSteps
                  ? `${completedSteps} of ${totalSteps} steps passed`
                  : "No evaluation yet"
              }
            />
            <Metric
              label="PERSONAS EVALUATED"
              value={evaluation ? String(reports.length) : "—"}
              detail="Independent simulations"
            />
            <Metric
              label="UX FINDINGS"
              value={evaluation ? String(findings.length) : "—"}
              detail="Evidence-based observations"
            />
            <Metric
              label="EXECUTION STATUS"
              value={evaluation ? evaluation.status : "—"}
              detail="Browser journey execution"
            />
          </div>
        </section>

        {evaluation && (
          <>
            <section className="section">
              <div className="section-heading">
                <div>
                  <h2>Persona analysis</h2>
                  <p>Results from each simulated evaluation perspective.</p>
                </div>
              </div>

              <div className="report-grid">
                {reports.map((report) => {
                  const execution = executions.find(
                    (item) => item.personaId === report.personaId
                  );
                  return (
                    <article className="report-card" key={report.personaId}>
                      <div className="report-card-top">
                        <div>
                          <span className="card-overline">PERSONA</span>
                          <h3>
                            {personaNames[report.personaId] ??
                              report.personaId}
                          </h3>
                        </div>
                        <span
                          className={`execution-status ${
                            execution?.status === "completed" ? "passed" : ""
                          }`}
                        >
                          {execution?.status ?? "unknown"}
                        </span>
                      </div>

                      <div className="report-score">
                        <span>
                          {report.score.overall === null
                            ? "—"
                            : report.score.overall}
                        </span>
                        <small>Overall score / 100</small>
                      </div>

                      <p className="report-summary">{report.summary}</p>

                      <div className="report-stats">
                        <div>
                          <strong>
                            {report.efficiency.completedSteps}/
                            {report.efficiency.totalSteps}
                          </strong>
                          <span>Steps passed</span>
                        </div>
                        <div>
                          <strong>
                            {report.efficiency.averageActionDurationMs === null
                              ? "—"
                              : `${Math.round(
                                  report.efficiency.averageActionDurationMs
                                )} ms`}
                          </strong>
                          <span>Avg. action time</span>
                        </div>
                        <div>
                          <strong>{report.findings.length}</strong>
                          <span>Findings</span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="section">
              <div className="section-heading">
                <div>
                  <h2>UX findings</h2>
                  <p>Issues detected during the simulated journeys.</p>
                </div>
              </div>

              {findings.length === 0 ? (
                <div className="empty-state">
                  No findings were reported for this evaluation.
                </div>
              ) : (
                <div className="findings-list">
                  {findings.map((finding, index) => (
                    <article className="finding-card" key={`${finding.id}-${index}`}>
                      <div className={`severity severity-${finding.severity}`}>
                        {finding.severity}
                      </div>
                      <div className="finding-content">
                        <h3>{finding.title}</h3>
                        <p>{finding.description}</p>
                        <p className="finding-persona">
                          {personaNames[finding.personaId] ??
                            finding.personaId}
                        </p>
                        <div className="recommendation">
                          <strong>Recommendation</strong>
                          <p>{finding.recommendation}</p>
                        </div>
                        {finding.evidence.length > 0 && (
                          <details>
                            <summary>View evidence</summary>
                            <ul>
                              {finding.evidence.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </details>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="section">
              <div className="section-heading">
                <div>
                  <h2>Journey execution</h2>
                  <p>Step-level results and browser evidence for each persona.</p>
                </div>
              </div>

              {executions.map((execution) => (
                <details className="execution-panel" key={execution.personaId}>
                  <summary>
                    <span>
                      {personaNames[execution.personaId] ?? execution.personaId}
                    </span>
                    <span className="execution-count">
                      {execution.steps.filter((s) => s.status === "passed").length}
                      /{execution.steps.length} passed
                    </span>
                  </summary>

                  <div className="step-list">
                    {execution.steps.map((step, index) => (
                      <details
                        className="step-row"
                        key={`${step.stepId}-${index}`}
                      >
                        <summary>
                          <span
                            className={`step-indicator ${
                              step.status === "passed" ? "step-passed" : "step-failed"
                            }`}
                          >
                            {step.status === "passed" ? "✓" : "!"}
                          </span>

                          <div className="step-info">
                            <strong>{step.stepId}</strong>
                            {step.pageTitle && <p>{step.pageTitle}</p>}
                          </div>

                          <span className="step-duration">{step.durationMs} ms</span>
                        </summary>

                        <div className="step-evidence">
                          {step.pageUrl && (
                            <p>
                              <strong>Page URL:</strong>{" "}
                              <a href={step.pageUrl} target="_blank" rel="noreferrer">
                                {step.pageUrl}
                              </a>
                            </p>
                          )}

                          {step.screenshotPath && (
                            <div className="evidence-block">
                              <h4>Screenshot</h4>
                              <a
                                href={`${apiUrl}/screenshots/${encodeURIComponent(
                                  step.screenshotPath.split("/").pop() ?? "",
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <img
                                  src={`${apiUrl}/screenshots/${encodeURIComponent(
                                    step.screenshotPath.split("/").pop() ?? "",
                                  )}`}
                                  alt={`Screenshot for ${step.stepId}`}
                                  className="step-screenshot"
                                />
                              </a>
                            </div>
                          )}

                          {step.error && (
                            <div className="evidence-block">
                              <h4>Execution error</h4>
                              <p className="evidence-error">{step.error}</p>
                            </div>
                          )}

                          {step.assertions && step.assertions.length > 0 && (
                            <div className="evidence-block">
                              <h4>Assertions</h4>
                              {step.assertions.map((assertion, i) => (
                                <div className="evidence-item" key={i}>
                                  <span>{assertion.passed ? "✓" : "✕"}</span>
                                  <div>
                                    <strong>{assertion.description}</strong>
                                    <p>
                                      Expected: {assertion.expected ?? "—"} · Actual:{" "}
                                      {assertion.actual ?? "—"}
                                    </p>
                                    {assertion.error && <p>{assertion.error}</p>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {step.interactions && step.interactions.length > 0 && (
                            <div className="evidence-block">
                              <h4>Interactions</h4>
                              {step.interactions.map((interaction, i) => (
                                <div className="evidence-item" key={i}>
                                  <span>↳</span>
                                  <div>
                                    <strong>{interaction.action}</strong>
                                    {interaction.target && <p>Target: {interaction.target}</p>}
                                    {interaction.value && <p>Value: {interaction.value}</p>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {(step.actionDurationMs != null ||
                            step.assertionDurationMs != null) && (
                            <div className="evidence-block">
                              <h4>Timing breakdown</h4>
                              <p>Action: {step.actionDurationMs ?? "—"} ms</p>
                              <p>Assertions: {step.assertionDurationMs ?? "—"} ms</p>
                            </div>
                          )}

                          {step.consoleErrors && step.consoleErrors.length > 0 && (
                            <div className="evidence-block">
                              <h4>Console errors ({step.consoleErrors.length})</h4>
                              {step.consoleErrors.map((error, i) => (
                                <p className="evidence-error" key={i}>{error}</p>
                              ))}
                            </div>
                          )}

                          {step.failedRequests && step.failedRequests.length > 0 && (
                            <div className="evidence-block">
                              <h4>Failed network requests ({step.failedRequests.length})</h4>
                              {step.failedRequests.map((request, i) => (
                                <div className="evidence-item" key={i}>
                                  <div>
                                    <strong>{request.method}</strong>
                                    <p>{request.url}</p>
                                    <p>{request.failure}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {step.accessibility && (
                            <div className="evidence-block">
                              <h4>Accessibility scan</h4>
                              <p>
                                {step.accessibility.passes} checks passed ·{" "}
                                {step.accessibility.violations.length} violations ·{" "}
                                {step.accessibility.incomplete} incomplete checks
                              </p>

                              {step.accessibility.violations.length > 0 && (
                                <>
                                  <h4>Detected violations</h4>
                                  {step.accessibility.violations.map((violation, i) => (
                                    <div className="evidence-item" key={i}>
                                      <span>!</span>
                                      <div>
                                        <strong>
                                          {violation.id} · {violation.impact ?? "Unknown impact"}
                                        </strong>
                                        <p>{violation.description}</p>
                                        <a href={violation.helpUrl} target="_blank" rel="noreferrer">
                                          {violation.help}
                                        </a>
                                        {violation.affectedElements.map((element, j) => (
                                          <p key={j}>
                                            Targets: {element.target.join(", ")}
                                            {element.failureSummary &&
                                              ` — ${element.failureSummary}`}
                                          </p>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </>
                              )}

                              {step.accessibility.incompleteChecks.length > 0 && (
                                <>
                                  <h4>Needs manual review</h4>
                                  {step.accessibility.incompleteChecks.map((check, i) => (
                                    <div className="evidence-item" key={i}>
                                      <span>?</span>
                                      <div>
                                        <strong>{check.id}</strong>
                                        <p>{check.description}</p>
                                        <a href={check.helpUrl} target="_blank" rel="noreferrer">
                                          Review guidance
                                        </a>
                                      </div>
                                    </div>
                                  ))}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </details>
                    ))}
                  </div>
                </details>
              ))}
            </section>
          </>
        )}

        <footer>JourneyLens · Evidence-led website experience evaluation</footer>
      </section>
    </main>
  );
}