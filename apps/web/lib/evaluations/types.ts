export type PersonaReport = {
  personaId: string;
  summary: string;
  score: {
    overall: number | null;
    usability: number | null;
    efficiency: number | null;
    accessibility: number | null;
    clarity: number | null;
  };
  efficiency: {
    totalSteps: number;
    completedSteps: number;
    failedSteps: number;
    journeyDurationMs: number | null;
    averageActionDurationMs: number | null;
  };
  findings: {
    id: string;
    title: string;
    description: string;
    severity: string;
    recommendation: string;
    evidence: string[];
  }[];
};

export type Execution = {
  personaId: string;
  status: string;
  durationMs?: number;
  steps: {
    stepId: string;
    status: string;
    durationMs: number;
    screenshotPath?: string;
    pageTitle?: string;
    pageUrl?: string;
    error?: string;

    assertions?: {
      description: string;
      passed: boolean;
      expected?: string | number;
      actual?: string | number;
      error?: string;
    }[];

    consoleErrors?: string[];

    failedRequests?: {
      url: string;
      method: string;
      failure: string;
    }[];

    interactions?: {
      action: string;
      target?: string;
      value?: string;
      timestamp: string;
    }[];

    actionDurationMs?: number;
    assertionDurationMs?: number;

    accessibility?: {
      violations: {
        id: string;
        impact: string | null;
        description: string;
        help: string;
        helpUrl: string;
        affectedElements: {
          target: string[];
          failureSummary: string | null;
        }[];
      }[];
      incompleteChecks: {
        id: string;
        impact: string | null;
        description: string;
        help: string;
        helpUrl: string;
        affectedElements: {
          target: string[];
          failureSummary: string | null;
        }[];
      }[];
      passes: number;
      incomplete: number;
      timestamp: string;
    };
  }[];
};

export type Evaluation = {
  id: string;
  websiteUrl: string;
  journeyId: string;
  status: string;
  createdAt: string;
  /** Names as they were at run time, so results survive master data changes. */
  personaNames: Record<string, string>;
  reports: PersonaReport[];
  executions: Execution[];
};

/** One row in the Evaluations history. */
export interface EvaluationRun {
  id: string;
  websiteUrl: string;
  journeyName: string;
  personas: { name: string; score: number | null }[];
  status: "completed" | "failed";
  score: number | null;
  stepsPassed: number;
  totalSteps: number;
  findings: number;
  durationMs: number;
  createdAt: string;
}
