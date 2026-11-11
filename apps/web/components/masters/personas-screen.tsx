"use client";

import { useState } from "react";
import type { Persona } from "@journeylens/contracts";
import { Page, SectionHeader } from "@/components/shell/page-header";
import { Avatar } from "@/components/ui/data-display";
import { EmptyState, ErrorAlert, SkeletonRows } from "@/components/ui/feedback";
import { SearchIcon, TargetIcon, UsersIcon } from "@/components/ui/icons";
import { SearchInput } from "@/components/ui/search-input";
import { useCatalog } from "@/lib/catalog/store";
import { plural } from "@/lib/format";

function PersonaCard({ persona }: { persona: Persona }) {
  return (
    <article className="card persona-result">
      <div className="persona-result-head">
        <Avatar name={persona.name} />
        <div>
          <h3>{persona.name}</h3>
          <p>
            <span className="id-chip">{persona.id}</span>
          </p>
        </div>
      </div>
      <p className="persona-summary">{persona.description}</p>

      <div>
        <h4 className="subheading">Goals</h4>
        <ul className="cell-list">
          {persona.goals.map((goal) => (
            <li key={goal}>{goal}</li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="subheading" style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <TargetIcon size={14} /> Evaluation focus
        </h4>
        <div className="tag-list">
          {persona.evaluationFocus.map((focus) => (
            <span className="tag" key={focus}>
              {focus}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export function PersonasScreen() {
  const { state, reload } = useCatalog();
  const [query, setQuery] = useState("");

  const personas = state.status === "ready" ? state.data.personas : [];
  const normalizedQuery = query.trim().toLowerCase();
  const visible = personas.filter((persona) =>
    [persona.name, persona.id, persona.description, ...persona.evaluationFocus].some(
      (value) => value.toLowerCase().includes(normalizedQuery)
    )
  );

  return (
    <Page
      breadcrumbs={[{ label: "Library" }, { label: "Personas" }]}
      title="Personas"
      description="Simulated users with their own goals and evaluation focus. Each one runs the journey independently."
    >
      <section className="section">
        <SectionHeader
          title="All personas"
          description={
            state.status === "ready"
              ? `${plural(personas.length, "persona")} available`
              : undefined
          }
          actions={
            state.status === "ready" &&
            personas.length > 0 && (
              <SearchInput
                label="Search name, ID or focus"
                value={query}
                onChange={setQuery}
              />
            )
          }
        />

        {state.status === "loading" && (
          <div className="card">
            <SkeletonRows label="Loading personas" />
          </div>
        )}
        {state.status === "error" && (
          <ErrorAlert
            title="Could not load personas."
            message={state.error}
            onRetry={reload}
          />
        )}
        {state.status === "ready" &&
          (visible.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={
                  personas.length === 0 ? (
                    <UsersIcon size={22} />
                  ) : (
                    <SearchIcon size={22} />
                  )
                }
                title={
                  personas.length === 0 ? "No personas yet" : "No matching personas"
                }
                description={
                  personas.length === 0
                    ? "Personas added to the journey engine appear here."
                    : "Try a different search term."
                }
              />
            </div>
          ) : (
            <div className="persona-grid">
              {visible.map((persona) => (
                <PersonaCard key={persona.id} persona={persona} />
              ))}
            </div>
          ))}
      </section>
    </Page>
  );
}
