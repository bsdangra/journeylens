"use client";

import { useState } from "react";
import type { Persona } from "@journeylens/contracts";
import { ContentPage } from "@/components/shell/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ErrorState, LoadingState } from "@/components/ui/load-state";
import { SearchInput } from "@/components/ui/search-input";
import { useCatalog } from "@/lib/catalog/store";

const columns: Column<Persona>[] = [
  {
    header: "Persona",
    cell: (persona) => (
      <div className="table-primary">
        <strong className="table-title">{persona.name}</strong>
        <span>{persona.description}</span>
      </div>
    ),
  },
  {
    header: "ID",
    cell: (persona) => <span className="key-chip">{persona.id}</span>,
  },
  {
    header: "Goals",
    cell: (persona) => (
      <ul className="persona-goals">
        {persona.goals.map((goal) => (
          <li key={goal}>{goal}</li>
        ))}
      </ul>
    ),
  },
  {
    header: "Evaluation focus",
    cell: (persona) => (
      <div className="focus-tags">
        {persona.evaluationFocus.map((focus) => (
          <span className="key-chip" key={focus}>
            {focus}
          </span>
        ))}
      </div>
    ),
  },
];

export function PersonasScreen() {
  const { state, reload } = useCatalog();
  const [query, setQuery] = useState("");

  const personas = state.status === "ready" ? state.data.personas : [];
  const normalizedQuery = query.trim().toLowerCase();
  const visible = personas.filter((persona) =>
    [persona.name, persona.id, persona.description].some((value) =>
      value.toLowerCase().includes(normalizedQuery)
    )
  );

  return (
    <ContentPage eyebrow="MASTERS / PERSONAS" title="Personas">
      <section className="section">
        <div className="section-heading">
          <div>
            <h2>All personas</h2>
            <p>
              Each persona is a simulated evaluation lens with its own goals and
              focus. They are defined in the journey engine and are read-only
              here.
            </p>
          </div>
          {state.status === "ready" && personas.length > 0 && (
            <SearchInput
              label="Search by name, ID or description"
              value={query}
              onChange={setQuery}
            />
          )}
        </div>

        {state.status === "loading" && (
          <LoadingState label="Loading personas…" />
        )}
        {state.status === "error" && (
          <ErrorState
            title="Could not load personas."
            message={state.error}
            onRetry={reload}
          />
        )}
        {state.status === "ready" &&
          (visible.length === 0 ? (
            <div className="empty-state">
              {personas.length === 0
                ? "The API has no personas defined yet."
                : "No personas match this search."}
            </div>
          ) : (
            <DataTable
              caption="Personas"
              columns={columns}
              rows={visible}
              rowKey={(persona) => persona.id}
            />
          ))}
      </section>
    </ContentPage>
  );
}
