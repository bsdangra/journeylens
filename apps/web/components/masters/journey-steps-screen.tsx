"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ContentPage } from "@/components/shell/page-header";
import { ErrorState, LoadingState } from "@/components/ui/load-state";
import { ACTION_LABELS, ASSERTION_LABELS } from "@/lib/catalog/labels";
import { useJourney } from "@/lib/catalog/store";

export function JourneyStepsScreen() {
  const params = useParams<{ journeyId: string }>();
  const journeyId = decodeURIComponent(params.journeyId);
  const { state, reload } = useJourney(journeyId);

  const backLink = (
    <Link href="/masters/journeys" className="btn-secondary topbar-link">
      ← All journeys
    </Link>
  );

  if (state.status !== "ready") {
    const notFound =
      state.status === "error" && /not found/i.test(state.error);
    return (
      <ContentPage
        eyebrow="MASTERS / JOURNEYS / STEPS"
        title={notFound ? "Journey not found" : journeyId}
        actions={backLink}
      >
        <section className="section">
          {state.status === "loading" ? (
            <LoadingState label="Loading journey steps…" />
          ) : (
            <ErrorState
              title={
                notFound
                  ? "This journey doesn't exist."
                  : "Could not load this journey."
              }
              message={state.error}
              onRetry={notFound ? undefined : reload}
            />
          )}
        </section>
      </ContentPage>
    );
  }

  const journey = state.data;

  return (
    <ContentPage
      eyebrow="MASTERS / JOURNEYS / STEPS"
      title={journey.name}
      actions={backLink}
    >
      <section className="section">
        <div className="record-summary">
          <div className="record-summary-copy">
            <span className="key-chip">{journey.id}</span>
            <a
              href={journey.startUrl}
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              {journey.startUrl}
            </a>
          </div>
          {journey.description && (
            <p className="readonly-note">{journey.description}</p>
          )}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <h2>Step sequence</h2>
            <p>
              {journey.steps.length}{" "}
              {journey.steps.length === 1 ? "step" : "steps"}, run in this order
              from top to bottom. Steps are defined in the journey engine and
              are read-only here.
            </p>
          </div>
        </div>

        {journey.steps.length === 0 ? (
          <div className="empty-state">This journey has no steps.</div>
        ) : (
          <ol className="step-sequence">
            {journey.steps.map((step, index) => (
              <li className="sequence-step" key={step.id}>
                <span className="sequence-number">{index + 1}</span>
                <div className="sequence-copy">
                  <div className="sequence-title">
                    <span className={`action-tag action-${step.action}`}>
                      {ACTION_LABELS[step.action] ?? step.action}
                    </span>
                    <strong>{step.description}</strong>
                    <small>{step.id}</small>
                  </div>
                  {(step.target || step.value || step.timeout) && (
                    <dl className="sequence-fields">
                      {step.target && (
                        <div>
                          <dt>Target</dt>
                          <dd>
                            <code>{step.target}</code>
                          </dd>
                        </div>
                      )}
                      {step.value && (
                        <div>
                          <dt>Value</dt>
                          <dd>
                            <code>{step.value}</code>
                          </dd>
                        </div>
                      )}
                      {step.timeout && (
                        <div>
                          <dt>Timeout</dt>
                          <dd>
                            <code>{step.timeout} ms</code>
                          </dd>
                        </div>
                      )}
                    </dl>
                  )}
                  {step.assertions && step.assertions.length > 0 && (
                    <ul className="sequence-assertions">
                      {step.assertions.map((assertion, assertionIndex) => (
                        <li key={assertionIndex}>
                          <span>
                            {ASSERTION_LABELS[assertion.type] ?? assertion.type}
                          </span>
                          {assertion.description}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </ContentPage>
  );
}
