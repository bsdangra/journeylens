"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type {
  Journey,
  JourneySummary,
  Persona,
} from "@journeylens/contracts";
import { apiRequest, errorMessage } from "@/lib/api";

// Journeys and personas are read-only here: the API serves them from the
// journey engine's definitions. Editing comes once they live in a database.

type LoadState<T> =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "ready"; data: T };

type Catalog = { journeys: JourneySummary[]; personas: Persona[] };

const CatalogContext = createContext<{
  state: LoadState<Catalog>;
  reload: () => void;
} | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LoadState<Catalog>>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      apiRequest<JourneySummary[]>("/journeys", { signal: controller.signal }),
      apiRequest<Persona[]>("/personas", { signal: controller.signal }),
    ])
      .then(([journeys, personas]) =>
        setState({ status: "ready", data: { journeys, personas } })
      )
      .catch((error) => {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          error: errorMessage(error, "Could not load journeys and personas."),
        });
      });
    return () => controller.abort();
  }, [attempt]);

  const reload = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((value) => value + 1);
  }, []);

  return (
    <CatalogContext.Provider value={{ state, reload }}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const catalog = useContext(CatalogContext);
  if (!catalog) {
    throw new Error("useCatalog must be used within CatalogProvider");
  }
  return catalog;
}

/** Loads one journey with its steps from GET /journeys/:id. */
export function useJourney(journeyId: string) {
  const [result, setResult] = useState<{
    id: string;
    state: LoadState<Journey>;
  } | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    apiRequest<Journey>(`/journeys/${encodeURIComponent(journeyId)}`, {
      signal: controller.signal,
    })
      .then((data) =>
        setResult({ id: journeyId, state: { status: "ready", data } })
      )
      .catch((error) => {
        if (controller.signal.aborted) return;
        setResult({
          id: journeyId,
          state: {
            status: "error",
            error: errorMessage(error, "Could not load this journey."),
          },
        });
      });
    return () => controller.abort();
  }, [journeyId, attempt]);

  // A result for a previous ID (or a retry in flight) counts as loading.
  const state: LoadState<Journey> =
    result && result.id === journeyId ? result.state : { status: "loading" };

  return {
    state,
    reload: () => {
      setResult(null);
      setAttempt((value) => value + 1);
    },
  };
}
