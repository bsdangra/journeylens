# JourneyLens Project Status

Status snapshot: 4 November 2026. Verify against the current repository
before release planning.

  -----------------------------------------------------------------------
  Area                    Status                  Notes
  ----------------------- ----------------------- -----------------------
  Monorepo                Implemented             npm workspaces

  Contracts               Implemented             Shared TypeScript types

  Journey engine          Working                 Playwright

  Purchase journey        Working                 12 SauceDemo steps

  Personas                Implemented             Three simulated
                                                  perspectives

  Evidence collection     Implemented             Screenshots, timings,
                                                  interactions, errors

  HTTP error capture      Implemented             HTTP responses \>=400

  Axe integration         Implemented             Violations and
                                                  incomplete checks

  Scoring engine          Partial                 Rule findings and
                                                  efficiency metrics

  NestJS API              Working                 Health and evaluation
                                                  endpoints

  Input-driven triggers   Implemented             Dynamic journey ID, URL
                                                  override (with step-level
                                                  navigation forwarding), strict
                                                  persona filtering, input validation

  Screenshot serving      Working                 Static assets

  Dashboard               Working                 Displays evaluation
                                                  output

  AI analysis             Pending                 Not integrated

  Numeric UX scoring      Pending                 Score fields are null

  Evaluation history      Not implemented         Current flow is
                                                  in-memory

  Separate browser worker Not implemented         Execution remains in
                                                  journey-engine

  Deployment              Pending                 Local setup
  -----------------------------------------------------------------------

## Verified during development

-   API health endpoint returned HTTP 200.
-   `POST /evaluations` executed the demo for all three personas.
-   Custom website URL correctly overrides initial Playwright navigation step.
-   Invalid persona selections return HTTP 400 Bad Request.
-   An observed successful run completed all 12 steps per persona.
-   Dashboard called the API and displayed results with editable website URL input.
-   Screenshot URLs returned HTTP 200.
-   Journey-engine, scoring-engine and API builds passed.

## Known issue: incomplete accessibility findings absent from report

Execution JSON contained `accessibility.incompleteChecks` on
inventory-page steps for all personas. The `color-contrast` check
included selectors and axe failure summaries. However, report `findings`
remained empty.

`packages/scoring-engine/src/index.ts` already calls:

``` ts
const findings = [
  ...analyzeExecution(execution, persona),
  ...analyzeAccessibility(execution, persona),
  ...analyzeIncompleteAccessibilityChecks(execution, persona),
];
```

The analyzer in
`packages/scoring-engine/src/analyzers/accessibility-analyzer.ts` reads:

``` ts
step.accessibility?.incompleteChecks ?? []
```

The code appears structurally correct; verify runtime behavior.

Temporarily log at the start of
`analyzeIncompleteAccessibilityChecks()`:

``` ts
console.log(
  "[Accessibility Analyzer] Incomplete checks:",
  execution.steps.map((step) => ({
    stepId: step.stepId,
    count: step.accessibility?.incompleteChecks?.length ?? 0,
  }))
);
```

Rebuild in dependency order:

``` bash
npm run build -w @journeylens/scoring-engine
npm run build -w @journeylens/journey-engine
npm run build -w @journeylens/api
```

Restart API, run an evaluation, and verify analyzer input, analyzer
output, loaded compiled package, and API report. Remove the temporary
log afterward.

## Caveats

-   Earlier Backtrace telemetry 401s were observed. A heuristic was
    added to suppress console errors matching third-party HTTP errors;
    review this before production because it is not source-aware.
-   Incomplete axe checks are not confirmed violations.
-   Numeric scores are not implemented.
-   Current API runs personas sequentially and invokes journey-engine
    directly.
-   Demo URL and journey are fixed.
