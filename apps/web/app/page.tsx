"use client";

import Link from "next/link";
import { useState } from "react";
import type { JourneySummary, Persona } from "@journeylens/contracts";
import { EvaluationReport } from "@/components/evaluations/evaluation-report";
import { NewEvaluation } from "@/components/overview/new-evaluation";
import { Page, SectionHeader } from "@/components/shell/page-header";
import { EmptyState } from "@/components/ui/feedback";
import { FileTextIcon, HistoryIcon } from "@/components/ui/icons";
import { useToast } from "@/components/ui/toast";
import { errorMessage } from "@/lib/api";
import { useEvaluationHistory } from "@/lib/evaluations/history-store";
import { runEvaluation } from "@/lib/evaluations/run";
import { toEvaluationRun } from "@/lib/evaluations/summary";

export default function Home() {
  const { addRun, latestEvaluation } = useEvaluationHistory();
  const toast = useToast();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  async function handleRun(journey: JourneySummary, personas: Persona[]) {
    setRunning(true);
    setError("");
    try {
      const result = await runEvaluation(journey, personas);
      addRun(toEvaluationRun(result, journey.name), result);
      toast("Evaluation complete. Saved to history.");
      requestAnimationFrame(() =>
        document
          .getElementById("latest-result")
          ?.scrollIntoView({ behavior: "smooth", block: "start" })
      );
    } catch (err) {
      setError(errorMessage(err, "Something went wrong while running the evaluation."));
    } finally {
      setRunning(false);
    }
  }

  return (
    <Page
      breadcrumbs={[{ label: "Workspace" }, { label: "New evaluation" }]}
      title="New evaluation"
      description="Run a scripted user journey in a real browser for each persona, and get evidence-backed UX findings."
      actions={
        <Link href="/evaluations" className="btn btn-secondary">
          <HistoryIcon size={16} /> View history
        </Link>
      }
    >
      <NewEvaluation running={running} error={error} onRun={handleRun} />

      <section className="section" id="latest-result" style={{ scrollMarginTop: 72 }}>
        <SectionHeader
          title="Latest result"
          description="The most recent evaluation in this browser tab."
        />
        {latestEvaluation && !running ? (
          <EvaluationReport evaluation={latestEvaluation} />
        ) : (
          <div className="card">
            <EmptyState
              icon={<FileTextIcon size={22} />}
              title={running ? "Evaluation in progress" : "No results yet"}
              description={
                running
                  ? "The report will appear here as soon as the browser finishes every persona."
                  : "Choose a journey and at least one persona above, then run the evaluation. The full report appears here."
              }
            />
          </div>
        )}
      </section>
    </Page>
  );
}
