# JourneyLens 🔍

**AI-assisted website usability testing through scripted user journeys and persona-informed analysis.**

JourneyLens helps identify potential usability friction in a website before it affects real users.

Define a user journey, execute it in a real browser, collect interaction evidence, and use AI to identify usability issues and suggest improvements.

> The goal is to make website usability testing more accessible, repeatable, and actionable.

## 🎯 The Problem

Traditional website testing tools primarily focus on whether a website works:

- Do buttons work?
- Do forms submit?
- Do pages load?
- Does the expected navigation happen?

But functional correctness doesn't necessarily mean a good user experience.

A website can work perfectly while still confusing users, hiding important information, or making tasks unnecessarily difficult.

JourneyLens aims to bridge this gap by combining browser automation with AI-assisted UX analysis.

## 💡 How It Works

1. **Define a journey** — Specify a website URL, user goal, actions, and expected outcomes.
2. **Select personas** — Choose different user perspectives for analysis.
3. **Execute the journey** — Run the same scripted journey independently in isolated browser contexts.
4. **Collect evidence** — Capture screenshots, DOM information, accessibility details, and browser telemetry.
5. **Analyze with AI** — Identify potential usability friction using the collected evidence and persona context.
6. **Generate a report** — Present findings, severity, confidence, supporting evidence, and recommendations.


## Current demo

-   Website: https://www.saucedemo.com/
-   Journey: 12-step purchase flow
-   Personas: First-time Shopper, Time-conscious Shopper,
    Accessibility-conscious Shopper

## Repository

``` text
apps/web                 Next.js dashboard
apps/api                 NestJS API
packages/contracts       Shared TypeScript types
packages/journey-engine  Journey definitions, Playwright executor, axe collector
packages/scoring-engine  Rule-based and accessibility analysis
storage/screenshots      Local screenshots
docs                     Project documentation
```

`workers/` and `infrastructure/` are future targets, not implemented.
Browser execution currently lives in `packages/journey-engine`.

## Quick start

Requirements: Node.js 20+, npm, Git.

``` bash
npm install
npx playwright install chromium
npm run build -w @journeylens/contracts
npm run build -w @journeylens/scoring-engine
npm run build -w @journeylens/journey-engine
npm run build -w @journeylens/api
```

Terminal 1:

``` bash
npm run start:dev -w @journeylens/api
```

Terminal 2:

``` bash
npm run dev -w web -- --port 3001
```

Dashboard: http://localhost:3001\
API: http://localhost:3000

``` bash
curl http://localhost:3000/health
curl -X POST http://localhost:3000/evaluations -H "Content-Type: application/json"
```

### Run the storefront from Windows Command Prompt

Open Command Prompt, then run:

``` bash
npm install
npm run dev:storefront
```

Once Next.js reports that it is ready, open http://localhost:3002 in your browser. Keep the Command Prompt window open while using the storefront; press `Ctrl+C` to stop it.

## Documentation

-   [Architecture](ARCHITECTURE.md)
-   [Project status](PROJECT_STATUS.md)
-   [Local setup](LOCAL_SETUP.md)
-   [Task breakdown](TASK_BREAKDOWN.md)

## Product principles

1.  Scripted journeys first; autonomous agents are out of MVP scope.
2.  Personas are simulated evaluation lenses, not real users.
3.  Findings must be grounded in observable evidence.
4.  Keep deterministic test results distinct from AI interpretations.
5.  Axe incomplete checks are manual-review items, not confirmed
    violations.
6.  Do not claim conversion prediction or WCAG compliance.
