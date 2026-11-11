"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { JourneySummary, Persona } from "@journeylens/contracts";
import { Avatar } from "@/components/ui/data-display";
import { ErrorAlert, SkeletonRows } from "@/components/ui/feedback";
import {
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  GlobeIcon,
  InfoIcon,
  ListChecksIcon,
  PlayIcon,
} from "@/components/ui/icons";
import { useCatalog } from "@/lib/catalog/store";
import { formatClock, hostnameOf, plural } from "@/lib/format";

// Observed browser run time for one persona on the current journeys.
const SECONDS_PER_PERSONA = { min: 10, max: 45 };

function StepCardHeader({
  id,
  number,
  done,
  title,
  description,
  actions,
}: {
  id: string;
  number: number;
  done: boolean;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="card-header">
      <div className="run-step-title">
        <span className={`step-number${done ? " is-done" : ""}`} aria-hidden="true">
          {done ? <CheckIcon size={14} /> : number}
        </span>
        <div>
          <h2 id={id}>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      {actions}
    </div>
  );
}

function JourneyOption({
  journey,
  selected,
  disabled,
  onSelect,
}: {
  journey: JourneySummary;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className="option-card"
      disabled={disabled || journey.stepCount === 0}
      onClick={onSelect}
    >
      <div className="option-head">
        <div>
          <strong>{journey.name}</strong>
          {journey.description && <p>{journey.description}</p>}
        </div>
        <span className="option-check is-radio">
          <CheckIcon size={12} />
        </span>
      </div>
      <div className="option-meta">
        <span>
          <GlobeIcon size={14} /> {hostnameOf(journey.startUrl)}
        </span>
        <span>
          <ListChecksIcon size={14} /> {plural(journey.stepCount, "step")}
        </span>
        <span className="id-chip">{journey.id}</span>
      </div>
    </button>
  );
}

function PersonaOption({
  persona,
  selected,
  disabled,
  onToggle,
}: {
  persona: Persona;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className="option-card"
      disabled={disabled}
      onClick={onToggle}
    >
      <div className="option-head">
        <Avatar name={persona.name} />
        <div>
          <strong>{persona.name}</strong>
          <p>{persona.description}</p>
        </div>
        <span className="option-check">
          <CheckIcon size={12} />
        </span>
      </div>
      <div className="tag-list" aria-label="Evaluation focus">
        {persona.evaluationFocus.map((focus) => (
          <span className="tag" key={focus}>
            {focus}
          </span>
        ))}
      </div>
    </button>
  );
}

function useElapsedSeconds(running: boolean) {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (!running) return;
    const start = Date.now();
    // Timer callbacks, not synchronous effect updates.
    const first = setTimeout(() => {
      setStartedAt(start);
      setNow(start);
    }, 0);
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [running]);

  return running && startedAt ? Math.floor((now - startedAt) / 1000) : 0;
}

export function NewEvaluation({
  running,
  error,
  onRun,
}: {
  running: boolean;
  error: string;
  onRun: (journey: JourneySummary, personas: Persona[]) => void;
}) {
  const { state: catalog, reload } = useCatalog();
  const [journeyId, setJourneyId] = useState("");
  const [personaIds, setPersonaIds] = useState<string[]>([]);
  const elapsed = useElapsedSeconds(running);

  if (catalog.status === "loading") {
    return (
      <div className="card">
        <SkeletonRows rows={4} label="Loading journeys and personas" />
      </div>
    );
  }

  if (catalog.status === "error") {
    return (
      <ErrorAlert
        title="Could not load journeys and personas."
        message={catalog.error}
        onRetry={reload}
      />
    );
  }

  const { journeys, personas } = catalog.data;
  // Derived, so a selection clears itself if the API stops listing it.
  const journey = journeys.find(
    (item) => item.id === journeyId && item.stepCount > 0
  );
  const selectedPersonas = personas.filter((persona) =>
    personaIds.includes(persona.id)
  );
  const canRun = Boolean(journey) && selectedPersonas.length > 0 && !running;
  const allSelected =
    personas.length > 0 && selectedPersonas.length === personas.length;

  function togglePersona(id: string) {
    setPersonaIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  const estimate = selectedPersonas.length
    ? `${selectedPersonas.length * SECONDS_PER_PERSONA.min}–${
        selectedPersonas.length * SECONDS_PER_PERSONA.max
      } seconds`
    : null;

  return (
    <div className="run-layout">
      <div className="run-steps">
        <section className="card" aria-labelledby="choose-journey">
          <StepCardHeader
            id="choose-journey"
            number={1}
            done={Boolean(journey)}
            title="Choose a journey"
            description="The scripted path the browser follows on the target website."
          />
          <div className="card-body">
            {journeys.length === 0 ? (
              <p className="stat-meta">The API has no journeys defined yet.</p>
            ) : (
              <div
                className="option-grid"
                role="radiogroup"
                aria-labelledby="choose-journey"
              >
                {journeys.map((item) => (
                  <JourneyOption
                    key={item.id}
                    journey={item}
                    selected={item.id === journey?.id}
                    disabled={running}
                    onSelect={() => setJourneyId(item.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="card" aria-labelledby="choose-personas">
          <StepCardHeader
            id="choose-personas"
            number={2}
            done={selectedPersonas.length > 0}
            title="Choose personas"
            description="Each persona runs the journey separately and gets its own findings."
            actions={
              personas.length > 1 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={running}
                  onClick={() =>
                    setPersonaIds(allSelected ? [] : personas.map((p) => p.id))
                  }
                >
                  {allSelected ? "Clear all" : "Select all"}
                </button>
              )
            }
          />
          <div className="card-body">
            {personas.length === 0 ? (
              <p className="stat-meta">The API has no personas defined yet.</p>
            ) : (
              <div
                className="option-grid"
                role="group"
                aria-labelledby="choose-personas"
              >
                {personas.map((persona) => (
                  <PersonaOption
                    key={persona.id}
                    persona={persona}
                    selected={personaIds.includes(persona.id)}
                    disabled={running}
                    onToggle={() => togglePersona(persona.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <aside className="card summary-card" aria-label="Run summary">
        <div className="card-header">
          <div className="run-step-title">
            <span
              className={`step-number${canRun || running ? " is-done" : ""}`}
              aria-hidden="true"
            >
              3
            </span>
            <div>
              <h2>Review and run</h2>
              <p>Runs in a headless browser via the API.</p>
            </div>
          </div>
        </div>

        <div className="card-body">
          <dl className="summary-list">
            <div className="summary-item">
              <dt>Journey</dt>
              <dd className={journey ? "" : "is-empty"}>
                {journey ? journey.name : "Not selected"}
              </dd>
            </div>
            <div className="summary-item">
              <dt>Target website</dt>
              <dd className={journey ? "" : "is-empty"}>
                {journey ? (
                  <a
                    className="link"
                    href={journey.startUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {journey.startUrl}
                  </a>
                ) : (
                  "Set by the journey"
                )}
              </dd>
            </div>
            <div className="summary-item">
              <dt>
                Personas{selectedPersonas.length ? ` (${selectedPersonas.length})` : ""}
              </dt>
              <dd className={selectedPersonas.length ? "" : "is-empty"}>
                {selectedPersonas.length ? (
                  <span className="summary-personas">
                    {selectedPersonas.map((persona) => (
                      <span className="tag" key={persona.id}>
                        {persona.name}
                      </span>
                    ))}
                  </span>
                ) : (
                  "None selected"
                )}
              </dd>
            </div>
            <div className="summary-item">
              <dt>Estimated time</dt>
              <dd className={estimate ? "" : "is-empty"}>{estimate ?? "–"}</dd>
            </div>
          </dl>

          {journey && (
            <p className="summary-hint">
              <InfoIcon size={14} />
              <span>
                Review the{" "}
                <Link
                  className="link"
                  href={`/masters/journeys/${encodeURIComponent(journey.id)}`}
                >
                  journey steps
                </Link>{" "}
                before running.
              </span>
            </p>
          )}
        </div>

        <div className="card-footer" style={{ flexDirection: "column" }}>
          {running ? (
            <div className="run-progress" role="status" aria-live="polite">
              <div className="run-progress-head">
                <strong>Running {plural(selectedPersonas.length, "persona")}…</strong>
                <span>
                  <ClockIcon
                    size={13}
                    style={{ display: "inline", verticalAlign: "-2px", marginRight: 4 }}
                  />
                  {formatClock(elapsed)}
                </span>
              </div>
              <div className="progress is-indeterminate" aria-hidden="true">
                <span />
              </div>
              <span className="stat-meta">
                Keep this tab open. Results appear below when the run finishes.
              </span>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-lg btn-block"
              disabled={!canRun}
              onClick={() => journey && onRun(journey, selectedPersonas)}
            >
              <PlayIcon size={16} />
              Run evaluation
              <ArrowRightIcon size={16} />
            </button>
          )}
          {!running && !canRun && (
            <span className="stat-meta" style={{ textAlign: "center" }}>
              {!journey
                ? "Choose a journey to continue."
                : "Choose at least one persona to continue."}
            </span>
          )}
        </div>
      </aside>

      {error && (
        <div style={{ gridColumn: "1 / -1" }}>
          <ErrorAlert title="The evaluation could not run." message={error} />
        </div>
      )}
    </div>
  );
}
