
// ============================================
// Journey definitions
// ============================================

export type JourneyAction =
  | "navigate"
  | "click"
  | "type"
  | "select"
  | "scroll"
  | "wait";

export type AssertionType =
  | "visible"
  | "hidden"
  | "text"
  | "url"
  | "count";

export interface StepAssertion {
  type: AssertionType;
  target?: string;
  expected?: string | number;
  description: string;
}

export interface JourneyStep {
  id: string;
  action: JourneyAction;
  description: string;
  target?: string;
  value?: string;
  timeout?: number;
  assertions?: StepAssertion[];
}

export interface Journey {
  id: string;
  name: string;
  description?: string;
  startUrl: string;
  steps: JourneyStep[];
}

// ============================================
// Persona definitions
// ============================================

export interface Persona {
  id: string;
  name: string;
  description: string;
  goals: string[];
  evaluationFocus: string[];
}

// ============================================
// Evaluation definitions
// ============================================

export type EvaluationStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed";

export interface Evaluation {
  id: string;
  websiteUrl: string;
  journeyId: string;
  personaIds: string[];
  status: EvaluationStatus;
  createdAt: string;
}

// ============================================
// Browser execution results
// ============================================

export type StepStatus = "passed" | "failed" | "skipped";

export interface AssertionResult {
  description: string;
  passed: boolean;
  expected?: string | number;
  actual?: string | number;
  error?: string;
}

export interface HttpErrorResponse {
  url: string;
  method: string;
  status: number;
  statusText: string;
  resourceType: string;
}

export interface StepResult {
  stepId: string;
  status: StepStatus;
  durationMs: number;
  screenshotPath?: string;
  error?: string;
  assertions?: AssertionResult[];

  // Browser evidence
  pageUrl?: string;
  pageTitle?: string;
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
  accessibility?: AccessibilityScanResult;
  httpErrors?: HttpErrorResponse[];
}

export interface ExecutionResult {
  id: string;
  evaluationId: string;
  personaId: string;
  status: EvaluationStatus;
  steps: StepResult[];
  screenshots: string[];
  errors: string[];
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
}

// ============================================
// UX analysis and scoring
// ============================================

export type FindingSeverity = "low" | "medium" | "high" | "critical";

export interface UXFinding {
  id: string;
  title: string;
  description: string;
  severity: FindingSeverity;
  recommendation: string;
  evidence: string[];
  personaId: string;
}

export interface UXScore {
  overall: number | null;
  usability: number | null;
  efficiency: number | null;
  accessibility: number | null;
  clarity: number | null;
}

export interface EvaluationReport {
  evaluationId: string;
  personaId: string;
  score: UXScore;
  efficiency: EfficiencyMetrics;
  findings: UXFinding[];
  summary: string;
}

export interface EfficiencyMetrics {
  totalSteps: number;
  completedSteps: number;
  failedSteps: number;
  measuredActionCount: number;
  totalActionDurationMs: number | null;
  averageActionDurationMs: number | null;
  medianActionDurationMs: number | null;
  journeyDurationMs: number | null;
}

export interface AccessibilityViolation {
  id: string;
  impact: string | null;
  description: string;
  help: string;
  helpUrl: string;
  affectedElements: {
    target: string[];
    failureSummary: string | null;
  }[];
}

export interface AccessibilityScanResult {
  violations: AccessibilityViolation[];
  incompleteChecks: AccessibilityIncompleteCheck[];
  passes: number;
  incomplete: number;
  timestamp: string;
}

export interface AccessibilityIncompleteCheck {
  id: string;
  impact: string | null;
  description: string;
  help: string;
  helpUrl: string;
  affectedElements: {
    target: string[];
    failureSummary: string | null;
  }[];
}
// ============================================
// API payloads
// ============================================

/** A journey without its steps, as listed by GET /journeys. */
export interface JourneySummary {
  id: string;
  name: string;
  description?: string;
  startUrl: string;
  stepCount: number;
}

/** Body of POST /evaluations. */
export interface EvaluationRequest {
  journeyId: string;
  personaIds: string[];
}

/** Response of POST /evaluations. */
export interface EvaluationResult extends Evaluation {
  executions: ExecutionResult[];
  reports: EvaluationReport[];
}
