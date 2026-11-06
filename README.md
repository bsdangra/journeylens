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

## 📋 Prerequisites

- **Node.js**: `20+` (tested with Node 24 and Node 26)
- **npm**: `10+`
- **Git**
- **Playwright Chromium**: Required for headless browser journey execution and evidence collection (`npx playwright install chromium`)

## 🚀 Local Setup & Running the Application

### 1. Install Dependencies & Browser Binaries

```bash
npm install
npx playwright install chromium
```

### 2. Build Packages in Dependency Order

From the repository root, build the shared packages and the backend API:

```bash
npm run build -w @journeylens/contracts
npm run build -w @journeylens/scoring-engine
npm run build -w @journeylens/journey-engine
npm run build -w @journeylens/api
```

### 3. Start the Backend API (Terminal 1)

```bash
npm run start:dev -w @journeylens/api
```

- **API URL**: http://localhost:3000
- **Health check**:
  ```bash
  curl http://localhost:3000/health
  ```

### 4. Start the Web Dashboard (Terminal 2)

```bash
npm run dev -w web -- --port 3001
```

- **Dashboard URL**: http://localhost:3001
- *(Note: Port 3001 is required because the NestJS API runs on port 3000 and CORS is configured for port 3001).*

### 5. Trigger an Evaluation

You can execute a journey in either of two ways:

- **Via Web Dashboard**: Open [http://localhost:3001](http://localhost:3001), choose your journey and personas, and click **Run Evaluation →**.
- **Via cURL**:
  ```bash
  curl -X POST http://localhost:3000/evaluations \
    -H "Content-Type: application/json" \
    -d '{
      "journeyId": "JL-JRN-001",
      "websiteUrl": "https://www.saucedemo.com/",
      "personaIds": [
        "first-time-shopper",
        "time-conscious-shopper",
        "accessibility-conscious-shopper"
      ]
    }'
  ```

## Documentation

-   [Changelog](CHANGELOG.md)
-   [Architecture](docs/ARCHITECTURE.md)
-   [Project status](docs/PROJECT_STATUS.md)
-   [Local setup](docs/LOCAL_SETUP.md)
-   [Task breakdown](docs/TASK_BREAKDOWN.md)

## Product principles

1.  Scripted journeys first; autonomous agents are out of MVP scope.
2.  Personas are simulated evaluation lenses, not real users.
3.  Findings must be grounded in observable evidence.
4.  Keep deterministic test results distinct from AI interpretations.
5.  Axe incomplete checks are manual-review items, not confirmed
    violations.
6.  Do not claim conversion prediction or WCAG compliance.
