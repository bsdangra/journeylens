"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Page, SectionHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/data-display";
import { EmptyState, ErrorAlert, SkeletonRows } from "@/components/ui/feedback";
import {
  ArrowLeftIcon,
  CheckIcon,
  ExternalLinkIcon,
  PlayIcon,
  RouteIcon,
} from "@/components/ui/icons";
import { ACTION_LABELS, ASSERTION_LABELS } from "@/lib/catalog/labels";
import { useJourney } from "@/lib/catalog/store";
import { plural } from "@/lib/format";

const BASE_CRUMBS = [
  { label: "Library" },
  { label: "Journeys", href: "/masters/journeys" },
];

export function JourneyStepsScreen() {
  const params = useParams<{ journeyId: string }>();
  const journeyId = decodeURIComponent(params.journeyId);
  const { state, reload } = useJourney(journeyId);

  const backLink = (
    <Link href="/masters/journeys" className="btn btn-secondary">
      <ArrowLeftIcon size={16} /> All journeys
    </Link>
  );

  if (state.status !== "ready") {
    const notFound =
      state.status === "error" && /not found/i.test(state.error);
    return (
      <Page
        breadcrumbs={[...BASE_CRUMBS, { label: journeyId }]}
        title={notFound ? "Journey not found" : "Journey"}
        actions={backLink}
      >
        {state.status === "loading" ? (
          <div className="card">
            <SkeletonRows rows={5} label="Loading journey steps" />
          </div>
        ) : notFound ? (
          <div className="card">
            <EmptyState
              icon={<RouteIcon size={22} />}
              title="This journey does not exist"
              description={state.error}
              actions={backLink}
            />
          </div>
        ) : (
          <ErrorAlert
            title="Could not load this journey."
            message={state.error}
            onRetry={reload}
          />
        )}
      </Page>
    );
  }

  const journey = state.data;

  return (
    <Page
      breadcrumbs={[...BASE_CRUMBS, { label: journey.name }]}
      title={journey.name}
      description={journey.description}
      actions={
        <>
          <a
            href={journey.startUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary"
          >
            Open website <ExternalLinkIcon size={14} />
          </a>
          <Link href="/" className="btn btn-primary">
            <PlayIcon size={14} /> Run evaluation
          </Link>
        </>
      }
    >
      <dl className="card journey-overview">
        <div>
          <dt>Journey ID</dt>
          <dd>
            <span className="id-chip">{journey.id}</span>
          </dd>
        </div>
        <div>
          <dt>Start URL</dt>
          <dd>
            <a className="link" href={journey.startUrl} target="_blank" rel="noreferrer">
              {journey.startUrl}
            </a>
          </dd>
        </div>
        <div>
          <dt>Steps</dt>
          <dd>
            {plural(journey.steps.length, "step")} ·{" "}
            {plural(
              journey.steps.reduce(
                (total, step) => total + (step.assertions?.length ?? 0),
                0
              ),
              "check"
            )}
          </dd>
        </div>
      </dl>

      <section className="section">
        <SectionHeader
          title="Step sequence"
          description="The browser performs these steps in order, then verifies each check."
        />
        <div className="card">
          {journey.steps.length === 0 ? (
            <EmptyState
              icon={<RouteIcon size={22} />}
              title="No steps"
              description="This journey has no steps defined."
            />
          ) : (
            <ol className="step-list">
              {journey.steps.map((step, index) => (
                <li className="step-item" key={step.id}>
                  <span className="step-number" aria-hidden="true">
                    {index + 1}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div className="step-item-head">
                      <strong>{step.description}</strong>
                      <span className={`badge action-badge-${step.action}`}>
                        {ACTION_LABELS[step.action] ?? step.action}
                      </span>
                      <Badge>{step.id}</Badge>
                    </div>
                    {(step.target || step.value || step.timeout) && (
                      <dl className="step-item-fields">
                        {step.target && (
                          <>
                            <dt>Element</dt>
                            <dd>
                              <code>{step.target}</code>
                            </dd>
                          </>
                        )}
                        {step.value && (
                          <>
                            <dt>{step.action === "navigate" ? "URL" : "Value"}</dt>
                            <dd>
                              <code>{step.value}</code>
                            </dd>
                          </>
                        )}
                        {step.timeout && (
                          <>
                            <dt>Timeout</dt>
                            <dd>
                              <code>{step.timeout} ms</code>
                            </dd>
                          </>
                        )}
                      </dl>
                    )}
                    {step.assertions && step.assertions.length > 0 && (
                      <ul className="assertion-list">
                        {step.assertions.map((assertion, assertionIndex) => (
                          <li key={assertionIndex}>
                            <CheckIcon size={14} />
                            {assertion.description}
                            <Badge>
                              {ASSERTION_LABELS[assertion.type] ?? assertion.type}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </Page>
  );
}
