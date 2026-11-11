# Website API List

The APIs the JourneyLens website (`apps/web`) calls today, all served by the NestJS API (`apps/api`).

- **Base URL:** `http://localhost:3000` (set in `apps/web/lib/api.ts`; override with `NEXT_PUBLIC_API_URL`)
- **Format:** JSON request and response bodies
- **Auth:** none

## Summary

| # | Group | Method | Path | Purpose |
|---|---|---|---|---|
| 1 | Master | GET | `/journeys` | List all journeys |
| 2 | Master | GET | `/journeys/{journeyId}` | One journey with its steps |
| 3 | Master | GET | `/personas` | List all personas |
| 4 | Evaluation | POST | `/evaluations` | Run a journey for selected personas |
| 5 | Supporting | GET | `/health` | API status |
| 6 | Supporting | GET | `/screenshots/{file}` | Step screenshot image |

---

## Master APIs

Journeys and personas are read-only. The API serves them from definitions in `packages/journey-engine`:

- Personas: `packages/journey-engine/src/personas.ts`
- Journeys: `packages/journey-engine/src/journeys/purchase.journey.ts`, registered in `packages/journey-engine/src/journeys/index.ts`

There is no database yet. To add or change a journey or persona, edit those files and restart the API.

### 1. List journeys

`GET http://localhost:3000/journeys`

Returns every journey as a summary, with the step count in place of the steps.

```json
[
  {
    "id": "JL-JRN-001",
    "name": "Complete a purchase",
    "description": "A customer purchases a product from an online store.",
    "startUrl": "https://www.saucedemo.com/",
    "stepCount": 12
  }
]
```

- **Website caller:** `apps/web/lib/catalog/store.tsx`
- **Used on:** the Journeys master screen and the Overview journey picker

### 2. Get journey with steps

`GET http://localhost:3000/journeys/{journeyId}`

Example: `GET http://localhost:3000/journeys/JL-JRN-001`

Returns the full journey with its steps and assertions. Values typed into sensitive fields, such as the password, are masked as `••••••••`.

```json
{
  "id": "JL-JRN-001",
  "name": "Complete a purchase",
  "description": "A customer purchases a product from an online store.",
  "startUrl": "https://www.saucedemo.com/",
  "steps": [
    { "id": "step-1", "action": "navigate", "description": "Open the website", "value": "https://www.saucedemo.com/" },
    { "id": "step-3", "action": "type", "description": "Enter password", "target": "[data-test=\"password\"]", "value": "••••••••" },
    {
      "id": "step-5",
      "action": "click",
      "description": "Add backpack to cart",
      "target": "[data-test=\"add-to-cart-sauce-labs-backpack\"]",
      "assertions": [
        { "type": "text", "target": ".shopping_cart_badge", "expected": "1", "description": "Cart count updates to one" }
      ]
    }
  ]
}
```

The steps above are a subset; the real response has all 12.

**Errors**

| Status | When | Body |
|---|---|---|
| 404 | Unknown journey ID | `{ "message": "Journey with ID \"nope\" was not found. Available journeys: JL-JRN-001.", "error": "Not Found", "statusCode": 404 }` |

- **Website caller:** `apps/web/lib/catalog/store.tsx`
- **Used on:** the Journey Steps screen

### 3. List personas

`GET http://localhost:3000/personas`

```json
[
  {
    "id": "first-time-shopper",
    "name": "First-time Shopper",
    "description": "A user unfamiliar with the website or its shopping process.",
    "goals": ["Understand how to browse products", "Find and purchase a product", "Understand each checkout step"],
    "evaluationFocus": ["Discoverability", "Navigation clarity", "Instruction clarity"]
  }
]
```

There are three personas today: `first-time-shopper`, `time-conscious-shopper` and `accessibility-conscious-shopper`.

- **Website caller:** `apps/web/lib/catalog/store.tsx`
- **Used on:** the Personas master screen and the Overview persona picker

---

## Evaluation API

### 4. Run evaluation

`POST http://localhost:3000/evaluations`

Runs the selected journey once for each selected persona in a real browser, then scores each run. The request waits until all runs finish, so it can take a while.

**Request body**

```json
{
  "journeyId": "JL-JRN-001",
  "personaIds": ["first-time-shopper", "time-conscious-shopper"]
}
```

**Response (shape)**

```json
{
  "id": "<evaluation uuid>",
  "websiteUrl": "https://www.saucedemo.com/",
  "journeyId": "JL-JRN-001",
  "status": "completed",
  "createdAt": "2026-11-11T08:00:00.000Z",
  "executions": [ /* one per persona: step results, timings, screenshots */ ],
  "reports":    [ /* one per persona: scores and findings */ ]
}
```

`status` is `completed` when every persona's run completed, and `failed` otherwise.

**Errors**

| Status | When |
|---|---|
| 400 | `journeyId` missing or empty: `"journeyId is required."` |
| 404 | Unknown `journeyId` |
| 400 | `personaIds` missing, empty or not a list of strings: `"personaIds must be a non-empty list of persona IDs."` |
| 400 | Unknown persona ID: `"Unknown persona IDs: x. Available personas: ..."` |

- **Website caller:** `apps/web/lib/evaluations/run.ts`
- **Used on:** Overview, through "New evaluation"

---

## Supporting APIs

### 5. Health check

`GET http://localhost:3000/health`

```json
{ "status": "ok", "service": "journeylens-api", "timestamp": "2026-11-11T08:00:00.000Z" }
```

- **Website caller:** `apps/web/lib/use-api-health.ts`, which polls every 30 seconds
- **Used on:** the API status indicator in the sidebar

### 6. Step screenshots

`GET http://localhost:3000/screenshots/{file}`

These are static image files written during an evaluation, not a controller endpoint. The file names come from the screenshot paths in `executions`.

- **Website caller:** `apps/web/components/evaluations/evaluation-report.tsx`
- **Used on:** step screenshots in the evaluation report

---

## Not available yet

| Missing API | Effect today |
|---|---|
| `GET /evaluations`, `GET /evaluations/{id}` | Evaluation history and the latest result are kept only in the browser's sessionStorage and are lost when the tab closes. The Evaluations screen calls no API. |
| Create, update or delete journeys and personas | The master screens are read-only. Changes are made in the journey-engine source files. |
