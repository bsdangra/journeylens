"use client";

import Link from "next/link";
import { useState } from "react";
import type { JourneySummary } from "@journeylens/contracts";
import { Page, SectionHeader } from "@/components/shell/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState, ErrorAlert, SkeletonRows } from "@/components/ui/feedback";
import {
  ArrowRightIcon,
  ExternalLinkIcon,
  RouteIcon,
  SearchIcon,
} from "@/components/ui/icons";
import { SearchInput } from "@/components/ui/search-input";
import { useCatalog } from "@/lib/catalog/store";
import { hostnameOf, plural } from "@/lib/format";

const stepsHref = (journey: JourneySummary) =>
  `/masters/journeys/${encodeURIComponent(journey.id)}`;

const columns: Column<JourneySummary>[] = [
  {
    header: "Journey",
    primary: true,
    cell: (journey) => (
      <div className="cell-with-avatar">
        <span className="stat-icon" aria-hidden="true">
          <RouteIcon size={16} />
        </span>
        <div className="cell-primary">
          <Link href={stepsHref(journey)}>{journey.name}</Link>
          {journey.description && <span>{journey.description}</span>}
        </div>
      </div>
    ),
  },
  {
    header: "ID",
    cell: (journey) => <span className="id-chip">{journey.id}</span>,
  },
  {
    header: "Website",
    cell: (journey) => (
      <a
        href={journey.startUrl}
        target="_blank"
        rel="noreferrer"
        className="link"
      >
        {hostnameOf(journey.startUrl)} <ExternalLinkIcon size={12} />
      </a>
    ),
  },
  { header: "Steps", cell: (journey) => journey.stepCount },
  {
    header: "Actions",
    hideLabel: true,
    align: "right",
    cell: (journey) => (
      <Link
        href={stepsHref(journey)}
        className="btn btn-secondary btn-sm"
        aria-label={`View steps for ${journey.name}`}
      >
        View steps <ArrowRightIcon size={14} />
      </Link>
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
    <Page
      breadcrumbs={[{ label: "Library" }, { label: "Journeys" }]}
      title="Journeys"
      description="Scripted user paths the browser follows during an evaluation. Journeys are defined in the journey engine."
    >
      <section className="section">
        <SectionHeader
          title="All journeys"
          description={
            state.status === "ready"
              ? `${plural(journeys.length, "journey")} available`
              : undefined
          }
          actions={
            state.status === "ready" &&
            journeys.length > 0 && (
              <SearchInput
                label="Search name, ID or website"
                value={query}
                onChange={setQuery}
              />
            )
          }
        />

        {state.status === "loading" && (
          <div className="card">
            <SkeletonRows label="Loading journeys" />
          </div>
        )}
        {state.status === "error" && (
          <ErrorAlert
            title="Could not load journeys."
            message={state.error}
            onRetry={reload}
          />
        )}
        {state.status === "ready" &&
          (visible.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={
                  journeys.length === 0 ? (
                    <RouteIcon size={22} />
                  ) : (
                    <SearchIcon size={22} />
                  )
                }
                title={
                  journeys.length === 0 ? "No journeys yet" : "No matching journeys"
                }
                description={
                  journeys.length === 0
                    ? "Journeys added to the journey engine appear here."
                    : "Try a different search term."
                }
              />
            </div>
          ) : (
            <DataTable
              caption="Journeys"
              columns={columns}
              rows={visible}
              rowKey={(journey) => journey.id}
              footer={`Showing ${visible.length} of ${journeys.length}`}
            />
          ))}
      </section>
    </Page>
  );
}
