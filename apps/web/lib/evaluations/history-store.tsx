"use client";

import { useSyncExternalStore } from "react";
import type { Evaluation, EvaluationRun } from "./types";

// Evaluation history lives in sessionStorage until the API has a database:
// it survives navigation and refreshes, and clears when the tab closes.
// Each run is kept as a summary row; only the latest full result is kept,
// because full results carry step evidence and can be large.

const RUNS_KEY = "journeylens:evaluation-runs";
const LATEST_KEY = "journeylens:latest-evaluation";
const MAX_RUNS = 50;

type Snapshot = {
  runs: EvaluationRun[];
  latestEvaluation: Evaluation | null;
};

const SERVER_SNAPSHOT: Snapshot = { runs: [], latestEvaluation: null };

const listeners = new Set<() => void>();
let cache: { runsRaw: string | null; latestRaw: string | null; snapshot: Snapshot } | null = null;

function read(key: string) {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null; // Storage blocked (private mode, site settings).
  }
}

function parse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function getSnapshot(): Snapshot {
  const runsRaw = read(RUNS_KEY);
  const latestRaw = read(LATEST_KEY);
  // Return the same object while storage is unchanged, as React requires.
  if (cache && cache.runsRaw === runsRaw && cache.latestRaw === latestRaw) {
    return cache.snapshot;
  }
  const stored = parse<EvaluationRun[]>(runsRaw, []);
  const snapshot: Snapshot = {
    runs: stored,
    latestEvaluation: parse<Evaluation | null>(latestRaw, null),
  };
  cache = { runsRaw, latestRaw, snapshot };
  return snapshot;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function write(key: string, value: unknown) {
  try {
    if (value === null) window.sessionStorage.removeItem(key);
    else window.sessionStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false; // Blocked or over quota.
  }
}

function notify() {
  listeners.forEach((listener) => listener());
}

/** Saves a finished evaluation: its history row, and the full result as the latest. */
export function addRun(run: EvaluationRun, evaluation: Evaluation) {
  const stored = parse<EvaluationRun[]>(read(RUNS_KEY), []);
  write(RUNS_KEY, [run, ...stored.filter((item) => item.id !== run.id)].slice(0, MAX_RUNS));
  if (!write(LATEST_KEY, evaluation)) {
    // Too large to keep; drop the stale one so Overview doesn't show it.
    write(LATEST_KEY, null);
  }
  notify();
}

export function clearHistory() {
  write(RUNS_KEY, null);
  write(LATEST_KEY, null);
  notify();
}

export function useEvaluationHistory() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => SERVER_SNAPSHOT
  );
  return { ...snapshot, addRun, clearHistory };
}
