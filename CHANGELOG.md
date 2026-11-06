# Changelog

All notable changes implemented in branch `JOUR-20` compared to `main`.

---

## [Unreleased] - Branch `JOUR-20`

### 🚀 New Features

#### 1. Input-Driven Evaluation Trigger API
- **Dynamic Journey & Persona Execution**: Developed the Evaluation Trigger API allowing users to trigger evaluations with custom request payloads (`journeyId`, `websiteUrl`, and `personaIds`) rather than relying only on static hardcoded values.
- **Journey Registry (`packages/journey-engine`)**:
  - Added `availableJourneys` registry and `getJourneyById(id: string)` resolver to dynamically fetch journeys by identifier.
  - Added `getPersonas(personaIds?: string[])` helper to filter personas while defaulting to all configured personas if none are specified.
- **API Request DTO & Controller (`apps/api`)**:
  - Created `TriggerEvaluationRequestDto` in `src/evaluations/dto/trigger-evaluation.dto.ts` implementing `TriggerEvaluationDto`.
  - Updated `EvaluationsController.runEvaluation` on `POST /evaluations` to accept `@Body() dto?: TriggerEvaluationRequestDto` and respond with `200 OK`.
  - Updated `EvaluationsService.runEvaluation` to dynamically execute the chosen journey, support website URL overrides, execute only selected personas, and return typed `EvaluationResultResponse`.
  - Added input validation: throws `NotFoundException` (404) if a requested `journeyId` does not exist, and `BadRequestException` (400) if no valid personas are provided.
  - Added NestJS `Logger` diagnostics to trace evaluation and persona execution lifecycles.

#### 2. Interactive Web Dashboard Controls (`apps/web`)
- **Journey Selector**: Replaced the static display with an interactive dropdown allowing users to select available journeys (e.g. `Purchase a product (SauceDemo)`).
- **Interactive Persona Filters**: Upgraded persona badges into toggleable chips with active/inactive states so users can choose which simulated perspectives to run.
- **Evaluation Trigger Action**: Connected the "Run Evaluation" button to dispatch `POST /evaluations` with the active journey, website URL, and selected persona IDs.
- **Enhanced UI Feedback**: Added spinner loading state, disabled button states during execution, and detailed error banner display parsing API error responses.

---

### 🛠️ Bug Fixes & Improvements

#### 1. API Reliability & CORS Hardening (`apps/api`)
- **Flexible CORS Configuration**: Replaced static string origin with dynamic regex matching for all `localhost` and `127.0.0.1` origins across ports, allowing `OPTIONS` preflight and custom headers.
- **Host Binding**: Configured `app.listen(port, '0.0.0.0')` ensuring seamless connectivity across IPv4 (`127.0.0.1`) and IPv6 (`::1`) on macOS.
- **Health Check Unit Test**: Fixed `apps/api/src/app.controller.spec.ts` which previously failed due to testing obsolete `getHello()` instead of the active `getHealth()` endpoint.
- **Jest Monorepo Hoisting & ESM**: Updated test scripts in `apps/api/package.json` to use hoisted `jest` with `NODE_OPTIONS=--experimental-vm-modules` to support NestJS 12 pure ESM dependencies.

#### 2. Web Build Stability (`apps/web`)
- **Next.js Webpack Build**: Configured `build` script in `apps/web/package.json` with `--webpack` to avoid Turbopack process worker panics under Node.js 26.

#### 3. Monorepo Contracts Build Script (`packages/contracts`)
- Added `build` lifecycle script in `packages/contracts/package.json` so monorepo build pipelines (`npm run build -w @journeylens/contracts`) succeed without error.

#### 4. Environment & Repository Hygiene
- Added `.idea/` to `.gitignore`.

---

### 📦 Summary of Modified & Added Files

```text
A   CHANGELOG.md
M   .gitignore
M   README.md
M   docs/LOCAL_SETUP.md
M   docs/PROJECT_STATUS.md
M   packages/contracts/package.json
M   packages/contracts/src/index.ts
A   packages/journey-engine/src/journeys/index.ts
M   packages/journey-engine/src/personas.ts
M   packages/journey-engine/src/index.ts
A   apps/api/src/evaluations/dto/trigger-evaluation.dto.ts
M   apps/api/src/evaluations/evaluations.controller.ts
M   apps/api/src/evaluations/evaluations.controller.spec.ts
M   apps/api/src/evaluations/evaluations.service.ts
M   apps/api/src/evaluations/evaluations.service.spec.ts
M   apps/api/src/app.controller.spec.ts
M   apps/api/src/main.ts
M   apps/api/package.json
M   apps/web/app/page.tsx
M   apps/web/package.json
```

