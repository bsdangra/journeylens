"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/shell/page-header";
import { Metric } from "@/components/ui/metric";
import { ErrorState, LoadingState } from "@/components/ui/load-state";
import { useToast } from "@/components/ui/toast";
import { API_URL, errorMessage } from "@/lib/api";
import { useCatalog } from "@/lib/catalog/store";
import { useEvaluationHistory } from "@/lib/evaluations/history-store";
import { runEvaluation as requestEvaluation } from "@/lib/evaluations/run";
import { toEvaluationRun } from "@/lib/evaluations/summary";

const listFormat = new Intl.ListFormat("en-GB", { type: "conjunction" });

export default function Home() {
  const { state: catalog, reload: reloadCatalog } = useCatalog();
  const { addRun, latestEvaluation } = useEvaluationHistory();
  const toast = useToast();
  const [journeyId, setJourneyId] = useState("");
  const [personaIds, setPersonaIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // The latest result comes from session storage, so it survives navigation.
  const evaluation = loading ? null : latestEvaluation;

  const journeys = catalog.status === "ready" ? catalog.data.journeys : [];
  const personas = catalog.status === "ready" ? catalog.data.personas : [];
  // Derived, so a selection clears itself if the API stops listing it.
  const journey = journeys.find(
    (item) => item.id === journeyId && item.stepCount > 0
  );
  const selectedPersonas = personas.filter((persona) =>
    personaIds.includes(persona.id)
  );

  const missing = [
    !journey && "a user journey",
    selectedPersonas.length === 0 && "at least one persona",
  ].filter((item): item is string => Boolean(item));

  function togglePersona(personaId: string) {
    setPersonaIds((current) =>
      current.includes(personaId)
        ? current.filter((id) => id !== personaId)
        : [...current, personaId]
    );
  }

  async function runEvaluation() {
    if (!journey || missing.length > 0) return;

    setLoading(true);
    setError("");

    try {
      const result = await requestEvaluation(journey, selectedPersonas);
      addRun(toEvaluationRun(result, journey.name), result);
      toast("Run added to Evaluations.");
    } catch (err) {
      setError(
        errorMessage(err, "Something went wrong while running the evaluation.")
      );
    } finally {
      setLoading(false);
    }
  }

  const personaName = (id: string) => evaluation?.personaNames[id] ?? id;

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
      <section className="main-content">
        <PageHeader
          eyebrow="WORKSPACE / OVERVIEW"
          title="Website experience overview"
        />

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
              <p>Choose a journey and the personas to simulate, then run it.</p>
            </div>
          </div>

          {catalog.status === "loading" && (
            <LoadingState label="Loading journeys and personas…" />
          )}
          {catalog.status === "error" && (
            <ErrorState
              title="Could not load journeys and personas."
              message={catalog.error}
              onRetry={reloadCatalog}
            />
          )}
          {catalog.status === "ready" && (
          <div className="evaluation-form">
            <div className="field">
              <label htmlFor="user-journey">USER JOURNEY</label>
              <select
                id="user-journey"
                className="form-control"
                value={journey?.id ?? ""}
                disabled={loading}
                onChange={(event) => setJourneyId(event.target.value)}
              >
                <option value="">Select a journey</option>
                {journeys.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                    disabled={item.stepCount === 0}
                  >
                    {item.name} ·{" "}
                    {item.stepCount === 0
                      ? "no steps"
                      : `${item.stepCount} steps`}
                  </option>
                ))}
              </select>
              {journeys.length === 0 ? (
                <p className="field-hint">The API has no journeys yet.</p>
              ) : (
                journey && (
                  <p className="journey-meta">
                    {journey.description}{" "}
                    <Link
                      href={`/masters/journeys/${encodeURIComponent(journey.id)}`}
                    >
                      View steps
                    </Link>
                  </p>
                )
              )}
            </div>
            <div className="field">
              <label htmlFor="website-url">TARGET WEBSITE</label>
              <div className="url-input is-readonly">
                <span aria-hidden="true">↗</span>
                <input
                  id="website-url"
                  type="url"
                  readOnly
                  placeholder="Set by the selected journey"
                  value={journey?.startUrl ?? ""}
                  aria-describedby="website-url-hint"
                />
              </div>
              <p className="field-hint" id="website-url-hint">
                Each journey runs against its own start URL.
              </p>
            </div>

            <fieldset className="evaluation-personas" disabled={loading}>
              <legend>EVALUATION PERSONAS</legend>
              {personas.length === 0 ? (
                <p className="field-hint">The API has no personas yet.</p>
              ) : (
                <div className="persona-options">
                  {personas.map((persona) => {
                    const selected = personaIds.includes(persona.id);
                    return (
                      <button
                        type="button"
                        className="persona-chip persona-toggle"
                        key={persona.id}
                        aria-pressed={selected}
                        title={persona.description}
                        onClick={() => togglePersona(persona.id)}
                      >
                        <span className="persona-check" aria-hidden="true">
                          {selected ? "✓" : "+"}
                        </span>
                        {persona.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </fieldset>

            <div className="evaluation-actions">
              {missing.length > 0 && (
                <p className="evaluation-hint" id="run-hint">
                  To run, add {listFormat.format(missing)}.
                </p>
              )}
              <button
                className={`run-button ${loading ? "is-running" : ""}`}
                onClick={runEvaluation}
                disabled={loading || missing.length > 0}
                aria-describedby={missing.length > 0 ? "run-hint" : undefined}
              >
                {loading ? (
                  <>
                    <span className="spinner" /> Running evaluation...
                  </>
                ) : (
                  <>Run evaluation <span>→</span></>
                )}
              </button>
              {loading && (
                <p className="evaluation-hint" role="status">
                  The browser is running each persona through the journey. This
                  can take a minute or two.
                </p>
              )}
            </div>
          </div>
          )}

          {error && (
            <div className="error-banner" role="alert">
              <strong>Could not run evaluation.</strong> {error}
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
              <div className="heading-tags">
                <span className="success-tag">
                  <span className="status-dot" /> {evaluation.status}
                </span>
              </div>
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
                          <h3>{personaName(report.personaId)}</h3>
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
                          {personaName(finding.personaId)}
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
                    <span>{personaName(execution.personaId)}</span>
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
                                href={`${API_URL}/screenshots/${encodeURIComponent(
                                  step.screenshotPath.split("/").pop() ?? "",
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <img
                                  src={`${API_URL}/screenshots/${encodeURIComponent(
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
  );
}