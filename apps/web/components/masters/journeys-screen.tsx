"use client";

import Link from "next/link";
import { useState } from "react";
import type { JourneySummary } from "@journeylens/contracts";
import { ContentPage } from "@/components/shell/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ErrorState, LoadingState } from "@/components/ui/load-state";
import { SearchInput } from "@/components/ui/search-input";
import { useCatalog } from "@/lib/catalog/store";
import { hostnameOf } from "@/lib/format";

const stepsHref = (journey: JourneySummary) =>
  `/masters/journeys/${encodeURIComponent(journey.id)}`;

const columns: Column<JourneySummary>[] = [
  {
    header: "Journey",
    cell: (journey) => (
      <div className="table-primary">
        <Link href={stepsHref(journey)} className="table-title">
          {journey.name}
        </Link>
        {journey.description && <span>{journey.description}</span>}
      </div>
    ),
  },
  {
    header: "ID",
    cell: (journey) => <span className="key-chip">{journey.id}</span>,
  },
  {
    header: "Website",
    cell: (journey) => (
      <a
        href={journey.startUrl}
        target="_blank"
        rel="noreferrer"
        className="text-link"
      >
        {hostnameOf(journey.startUrl)}
      </a>
    ),
  },
  { header: "Steps", cell: (journey) => journey.stepCount },
  {
    header: "Actions",
    cell: (journey) => (
      <div className="row-actions">
        <Link
          href={stepsHref(journey)}
          className="row-action"
          aria-label={`View steps for ${journey.name}`}
        >
          View steps
        </Link>
      </div>
    ),
  },
];

export function JourneysScreen() {
  const { state, reload } = useCatalog();
  const [query, setQuery] = useState("");

  const journeys = state.status === "ready" ? state.data.journeys : [];
  const normalizedQuery = query.trim().toLowerCase();
  const visible = journeys.filter((journey) =>
    [journey.name, journey.id, journey.startUrl].some((value) =>
      value.toLowerCase().includes(normalizedQuery)
    )
  );

  return (
    <ContentPage eyebrow="MASTERS / JOURNEYS" title="Journeys">
      <section className="section">
        <div className="section-heading">
          <div>
            <h2>All journeys</h2>
            <p>
              {state.status === "ready"
                ? `Showing ${visible.length} of ${journeys.length}. Journeys are defined in the journey engine and are read-only here.`
                : "Scripted user journeys the engine can run."}
            </p>
          </div>
          {state.status === "ready" && journeys.length > 0 && (
            <SearchInput
              label="Search by name, ID or website"
              value={query}
              onChange={setQuery}
            />
          )}
        </div>

        {state.status === "loading" && (
          <LoadingState label="Loading journeys…" />
        )}
        {state.status === "error" && (
          <ErrorState
            title="Could not load journeys."
            message={state.error}
            onRetry={reload}
          />
        )}
        {state.status === "ready" &&
          (visible.length === 0 ? (
            <div className="empty-state">
              {journeys.length === 0
                ? "The API has no journeys defined yet."
                : "No journeys match this search."}
            </div>
          ) : (
            <DataTable
              caption="Journeys"
              columns={columns}
              rows={visible}
              rowKey={(journey) => journey.id}
            />
          ))}
      </section>
    </ContentPage>
  );
}
