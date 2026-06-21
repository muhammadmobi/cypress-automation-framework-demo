# Cypress Automation Framework — Complete Master Documentation

A deep-dive into how this demo framework is built, why each layer exists, and
how the pieces fit together. It mirrors the structure of a production StockWise
test framework — Page Object Model, fixtures, custom commands, a config factory,
tag-based filtering, Mochawesome reporting, a route-coverage matrix, and a
quality-gated CI pipeline — at a focused, fully-runnable demo scale.

> **Target under test.** Unlike a private corporate suite, this repo ships its
> own target so anyone can run it offline: a static _ShopWise_ web app
> (`app/`) and a json-server mock API (`mock-api/`). No real URLs or
> credentials are used anywhere.

---

## Table of Contents

1. Introduction & Purpose
2. Technology Stack
3. Framework Architecture — The Big Picture
4. Complete Directory Structure
5. Configuration — the config factory
6. Global Support Files
7. Custom Cypress Commands
8. The Page Object Model
9. Fixtures — Test Data Strategy
10. Custom Node Tasks
11. UI Spec Catalog
12. API Spec Catalog
13. API Spec Code Flow — Walkthrough
14. Test IDs, Tags & Categorization
15. Test-Design Techniques
16. End-to-End Execution Flow
17. Reporting Pipeline
18. CI/CD & Quality Gates
19. Common Patterns Cheat Sheet
20. Anti-Patterns — What NOT to Do
21. Reference Index

---

## 1. Introduction & Purpose

### What is Cypress?

Cypress is a JavaScript end-to-end testing framework that runs in the same
run-loop as the application under test. It gives automatic waiting, time-travel
debugging, network stubbing, and a single language (JS) for UI **and** API
tests via `cy.request`.

### What this framework demonstrates

- A clean **Page Object Model** with selectors isolated from page logic.
- **Custom commands** for login and cached sessions (`cy.session`).
- **Data-driven** specs (fixtures + decision-table loops).
- **API contract testing** with authenticated, self-reverting CRUD.
- **Tag-based** smoke/regression filtering via `@bahmutov/cy-grep`.
- **Mochawesome** HTML reporting, published to GitHub Pages.
- A **quality-gated** GitHub Actions pipeline (lint + format → test → publish).

### Framework health snapshot

| Metric                           | Value                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------- |
| Spec files                       | 19 (12 UI + 7 API)                                                              |
| Tests                            | 91                                                                              |
| Passing                          | 91                                                                              |
| Mock-API route coverage          | 100% (23/23 — see [ROUTE_COVERAGE_MATRIX.md](cypress/ROUTE_COVERAGE_MATRIX.md)) |
| External dependencies at runtime | none (bundled app + mock API)                                                   |

---

## 2. Technology Stack

### Test stack (devDependencies)

| Package                            | Role                                             |
| ---------------------------------- | ------------------------------------------------ |
| `cypress`                          | The E2E + API test runner                        |
| `@bahmutov/cy-grep`                | Filter tests by `@tag` or title substring        |
| `@testing-library/cypress`         | Accessible query helpers                         |
| `cypress-mochawesome-reporter`     | Per-spec JSON + a merged single-file HTML report |
| `eslint` + `eslint-plugin-cypress` | Static analysis quality gate                     |
| `prettier`                         | Formatting quality gate                          |
| `start-server-and-test`            | Boot the app + API, wait, then run Cypress       |
| `concurrently`                     | Run the two dev servers together                 |
| `http-server`                      | Serve the static app + the generated report      |
| `json-server`                      | The mock REST API                                |
| `rimraf`                           | Cross-platform report cleanup                    |

### Target under test (the bundled stack)

| Component    | Tech                           | Port |
| ------------ | ------------------------------ | ---- |
| ShopWise app | static HTML/CSS/JS             | 8080 |
| Mock API     | json-server + Express handlers | 3001 |

---

## 3. Framework Architecture — The Big Picture

```
        ┌──────────────── Spec (cypress/e2e/**) ────────────────┐
        │  describe / it — intent + assertions only             │
        └───────────────┬───────────────────────┬───────────────┘
                        │ uses                   │ uses
              ┌─────────▼─────────┐   ┌──────────▼──────────┐
              │   Page Object     │   │  Custom commands    │
              │ (pageObjects/*)   │   │ (support/commands)  │
              └─────────┬─────────┘   └──────────┬──────────┘
                        │ uses                   │ reads
              ┌─────────▼─────────┐   ┌──────────▼──────────┐
              │     Locators      │   │      Fixtures       │
              │ (support/locators)│   │  (fixtures/*.json)  │
              └───────────────────┘   └─────────────────────┘
```

### Layered design philosophy

- **Specs** describe behaviour — they never contain raw CSS selectors.
- **Page Objects** translate intent (`login`, `addProductByName`) into actions.
- **Locators** are the only place a selector string lives, so a UI change
  touches exactly one file.
- **Fixtures** hold data, never logic.
- **Commands** hold cross-cutting flows (login, session, API auth).

---

## 4. Complete Directory Structure

```
cypress-automation-framework-demo/
├── app/                          # ShopWise demo SPA (target under test)
│   ├── index.html  inventory.html  cart.html  checkout.html  confirmation.html
│   ├── dashboard.html  orders.html  reports.html  settings.html
│   ├── app.js                    # client-side logic + mock-API fetches
│   └── styles.css
├── mock-api/
│   ├── server.js                 # json-server + auth + /stats + /reports + guard
│   └── db.json                   # seed products, categories, orders, notifications
├── cypress/
│   ├── e2e/
│   │   ├── 00-loginPageTest.cy.js  01-navigationTest.cy.js
│   │   ├── api/                  # Auth, Products, Categories, Orders, Notifications, Reports, Healthcheck
│   │   ├── Inventory/  Cart/  Dashboard/  Notifications/  Configuration/  Reports/
│   ├── pageObjects/              # LoginPage, InventoryPage, CheckoutPage, NavBar, DashboardPage, SettingsPage
│   ├── support/
│   │   ├── locators/             # login, inventory, nav, dashboard, orders, reports, settings
│   │   ├── commands.js           # cy.login / cy.appSession / cy.apiLogin
│   │   └── e2e.js                # global setup + cy-grep registration
│   ├── fixtures/                 # users.json, loginPageData.json
│   └── ROUTE_COVERAGE_MATRIX.md  # mock-API route → spec coverage
├── cypress.base.config.js        # shared config factory
├── cypress.config.js             # "production" config — PLACEHOLDER urls/creds
├── cypress.local.config.js       # local/CI config → bundled app + mock API
├── .github/workflows/ci.yml      # quality-gated pipeline
└── package.json
```

---

## 5. Configuration — the config factory

`cypress.base.config.js` exports a single `buildConfig({ baseUrl, env })`
factory. Per-environment configs import it and inject **only** the differing
URLs/credentials, so timeouts, reporter options, the grep plugin and Node tasks
are defined exactly once.

- **`cypress.config.js`** — the "production" placeholder: `baseUrl: https://sw.com`,
  `email: user`, `pass: password`. Not used by CI; point it at your own
  environment.
- **`cypress.local.config.js`** — targets the bundled stack
  (`http://localhost:8080` + `http://localhost:3001`). This is what `npm test`
  and CI use.

### Reporter configuration

`cypress-mochawesome-reporter` writes per-spec JSON to
`mochawesome-report/.jsons/` and assembles a single inlined HTML report at
`mochawesome-report/index.html` at the end of the run.

### Override at runtime

```bash
npx cypress run \
  --config baseUrl=https://your-app.example.com \
  --env API_BASE_URL=https://api.example.com,email=$USER,pass=$PASS
```

---

## 6. Global Support Files

`cypress/support/e2e.js` is loaded before every spec. It imports the custom
commands and registers cy-grep:

```js
import "./commands";
const registerCypressGrep = require("@bahmutov/cy-grep");
registerCypressGrep();
```

---

## 7. Custom Cypress Commands

Defined in `cypress/support/commands.js`:

| Command           | Purpose                                                                  |
| ----------------- | ------------------------------------------------------------------------ |
| `cy.login()`      | UI login through the `LoginPage` page object using env credentials       |
| `cy.appSession()` | Cached login via `cy.session` with a `validate()` re-check               |
| `cy.apiLogin()`   | `POST /auth/login` against the mock API, yields the bearer `accessToken` |

`cy.appSession()` means each spec authenticates once; subsequent tests restore
the cached session (and a clean, empty cart) instead of logging in again.

---

## 8. The Page Object Model

Three layers, each with one job:

1. **Spec** — `loginPage.login(user, pass)` then asserts the URL.
2. **Page Object** (`pageObjects/LoginPage.js`) — turns `login()` into
   `enterUsername → enterPassword → submit`, returning `this` for chaining.
3. **Locators** (`support/locators/loginLocators.js`) — the only file holding
   `[data-test='username']` etc.

Worked example:

```js
// spec
loginPage.login(users.admin.username, users.admin.password);
cy.url().should("include", "/inventory");

// page object
login(username, password) {
  this.enterUsername(username);
  this.enterPassword(password);
  this.submit();
  return this;
}

// locators
usernameField: () => cy.get("[data-test='username']"),
```

A markup change to the username field is a **one-line** edit in the locators
file; no spec or page object changes.

---

## 9. Fixtures — Test Data Strategy

`cypress/fixtures/` holds static data, loaded in a `before()` hook:

```js
before(() => {
  cy.fixture("users").then((u) => (users = u));
  cy.fixture("loginPageData").then((d) => (loginData = d));
});
```

- **`users.json`** — `admin`, `locked`, `invalid` user records.
- **`loginPageData.json`** — expected button text, error strings, routes.

Keeping expected strings in a fixture means a copy change updates one JSON file
rather than every assertion.

---

## 10. Custom Node Tasks

`setupNodeEvents` in the config factory registers Node-side tasks (they run in
Node, not the browser):

- `writeLog({ filePath, message })` — append a timestamped line to a log file.
- `checkFileExists({ folderPath, filePattern })` — glob a folder for a file.

This is the extension point a production suite uses for Excel/CSV I/O, DB seeds,
or file-system assertions.

---

## 11. UI Spec Catalog

12 UI specs, grouped by module (mirrors the production layout).

| Spec                                    | IDs                    | Technique highlights                                             |
| --------------------------------------- | ---------------------- | ---------------------------------------------------------------- |
| `00-loginPageTest.cy.js`                | `SW-AUTH-TC01..09`     | EP/BVA on required fields, error guessing (locked user), session |
| `01-navigationTest.cy.js`               | `SW-NAV-TC01..06`      | Nav reachability across every destination                        |
| `Inventory/InventoryListTests.cy.js`    | `SW-INV-TC01..03`      | Listing + on-screen schema                                       |
| `Inventory/InventorySortingTests.cy.js` | `SW-INV-SORT-TC`       | Sorting **decision table** (4 options)                           |
| `Inventory/InventoryCartTests.cy.js`    | `SW-INV-CART-TC01..03` | Cart-badge **state transitions**                                 |
| `Cart/CartTests.cy.js`                  | `SW-CART-TC01..04`     | Cart contents, running total, empty state                        |
| `Cart/CheckoutTests.cy.js`              | `SW-CHK-TC01..04`      | E2E purchase + stubbed order POST + validation decision table    |
| `Dashboard/DashboardTests.cy.js`        | `SW-DSH-TC01..04`      | Real `/stats` + stubbed payload + error guessing                 |
| `Notifications/01-BellAndBadge.cy.js`   | `SW-NOT-TC01..04`      | **Stub-driven** bell/badge/empty-state                           |
| `Notifications/02-MarkAsRead.cy.js`     | `SW-NOT-TC05..06`      | **Stub-driven** mark-all state transition                        |
| `Configuration/SettingsTests.cy.js`     | `SW-CFG-TC01..03`      | Settings **persistence** applied on inventory                    |
| `Reports/ReportsTests.cy.js`            | `SW-RPT-TC01..03`      | Real `/reports/summary` table + stubbed payload                  |

---

## 12. API Spec Catalog

7 API specs, every mock-API route covered (see the matrix).

| Spec                     | IDs                    | Endpoints / flow                                                                         |
| ------------------------ | ---------------------- | ---------------------------------------------------------------------------------------- |
| `HealthcheckAPI.cy.js`   | `SW-HC-API-TC01..02`   | `/health` public liveness                                                                |
| `AuthAPI.cy.js`          | `SW-AUTH-API-TC01..08` | `/auth/login` (happy + negative + missing-field), role, token usability, `/auth/refresh` |
| `ProductsAPI.cy.js`      | `SW-PROD-API-TC01..09` | list/read, 404, 401, self-reverting POST/PATCH/PUT/DELETE, schema shape                  |
| `CategoriesAPI.cy.js`    | `SW-CAT-API-TC01..06`  | CRUD, 404, 401, self-reverting create→delete & PATCH                                     |
| `OrdersAPI.cy.js`        | `SW-ORD-API-TC01..05`  | list/read, 401, self-reverting create→delete, list discoverability                       |
| `NotificationsAPI.cy.js` | `SW-NOT-API-TC01..05`  | inbox read, 401, self-reverting bulk mark-as-read                                        |
| `ReportsAPI.cy.js`       | `SW-RPT-API-TC01..05`  | `/stats` + `/reports/summary` contract & cross-checks                                    |

Full route → spec mapping: [cypress/ROUTE_COVERAGE_MATRIX.md](cypress/ROUTE_COVERAGE_MATRIX.md) (23/23, 100%).

---

## 13. API Spec Code Flow — Walkthrough

Every API spec follows the same skeleton (faithful to the production project):

```js
describe("Products API", () => {
  const apiUrl = Cypress.env("API_BASE_URL");
  let token;
  const authHeaders = () => ({ Authorization: `Bearer ${token}` });

  before(() => {
    cy.apiLogin().then((t) => (token = t)); // authenticate once, reuse the token
  });

  it("SW-PROD-API-TC06: create→read→delete (self-reverting) @smoke", () => {
    cy.request({
      method: "POST",
      url: `${apiUrl}/products`,
      headers: authHeaders(),
      body: draft,
    }).then((created) => {
      // assert created, read it back, then DELETE so the dataset is untouched
    });
  });
});
```

Key conventions:

- **`failOnStatusCode: false`** on negative paths so a 401/404 is asserted as a
  status code instead of throwing.
- **Self-reverting mutations** — every create is deleted, every update is
  restored, so re-running the suite is idempotent.
- **Negative auth** — each guarded route is also hit **without** a token to
  prove the 401 contract.
- **Schema-shape assertions** — responses are checked for required keys/types,
  not just status.

---

## 14. Test IDs, Tags & Categorization

### Test ID format

- UI: `SW-<AREA>-TC<NN>` (e.g. `SW-INV-TC03`)
- API: `SW-<AREA>-API-TC<NN>` (e.g. `SW-PROD-API-TC06`)

A stable ID per test makes reports, defect reports, and traceability matrices
unambiguous.

### Tags

`@smoke` — a fast, critical-path subset. `@regression` — broader negative /
edge cases. Filter at runtime:

```bash
npm run cy:run:smoke        # grep=@smoke
npm run cy:run:regression   # grep=@regression
```

---

## 15. Test-Design Techniques

The specs deliberately exercise standard black-box techniques:

| Technique                | Where                                                         |
| ------------------------ | ------------------------------------------------------------- |
| Equivalence Partitioning | valid vs invalid login; with-token vs without-token           |
| Boundary Value Analysis  | required-field validation (empty vs filled)                   |
| Decision Table           | inventory sorting (4 options); checkout validation (3 fields) |
| State Transition         | cart badge 0→1→2; session login→logout                        |
| Error Guessing           | locked-out user; unknown id 404; missing body                 |

---

## 16. End-to-End Execution Flow

```
npm test
  └─ start-server-and-test
       ├─ npm start         → boots app (:8080) + mock API (:3001)
       ├─ wait-on           → both URLs return 200 / {status:ok}
       └─ npm run cy:run    → cypress run --config-file cypress.local.config.js
            ├─ support/e2e.js loads commands + cy-grep
            ├─ each spec: before() seeds token/fixtures
            ├─ tests execute (UI via POM, API via cy.request)
            └─ reporter writes JSON + builds mochawesome-report/index.html
```

---

## 17. Reporting Pipeline

1. **Per-spec JSON** → `mochawesome-report/.jsons/*.json`
2. **Failure screenshots** → `cypress/screenshots/` (auto-embedded in the report)
3. **Merge + HTML** → the reporter assembles `mochawesome-report/index.html`
   (a single, self-contained, inlined file). Rebuild manually with
   `npm run report`.
4. **Serve** → `npm run serve-report` (port 9000)
5. **CI** → the report is uploaded as an artifact and published to GitHub Pages.

---

## 18. CI/CD & Quality Gates

`.github/workflows/ci.yml` runs three jobs, each gating the next:

1. **`lint-and-format`** — ESLint (`eslint-plugin-cypress`) + Prettier
   `--check`. The pipeline **fails here** on any lint error or formatting drift,
   before a single test runs.
2. **`test`** — installs, boots the bundled app + mock API, runs Cypress,
   builds the Mochawesome report, uploads it (and failure screenshots) as
   artifacts.
3. **`publish-report`** — on pushes to `main`, deploys the HTML report to
   **GitHub Pages**.

Enable **Settings → Pages → Source: GitHub Actions** to receive the report URL.

---

## 19. Common Patterns Cheat Sheet

```js
// Cached login — authenticate once per spec
cy.appSession();

// API auth — reuse a token
cy.apiLogin().then((token) => { /* ... */ });

// Negative path — assert the status, don't throw
cy.request({ url, failOnStatusCode: false }).its("status").should("eq", 404);

// Data-driven — one it() per row
cases.forEach(({ input, expected }) => it(`...${input}`, () => { /* ... */ }));

// Self-reverting mutation
cy.request({ method: "POST", ... }).then(({ body }) =>
  cy.request({ method: "DELETE", url: `${api}/products/${body.id}`, headers }));
```

---

## 20. Anti-Patterns — What NOT to Do

- ❌ Raw selectors in specs — put them in `support/locators/`.
- ❌ `cy.wait(3000)` — rely on Cypress retry-ability and assertions
  (`cypress/no-unnecessary-waiting` is an **error** in this repo's ESLint).
- ❌ Tests that depend on each other's order — each test must stand alone.
- ❌ Mutations that leave state behind — always self-revert.
- ❌ Committing real URLs/credentials — use `--env`, `cypress.env.json`
  (git-ignored), or CI secrets.

---

## 21. Reference Index

| File                                                                 | What it is                     |
| -------------------------------------------------------------------- | ------------------------------ |
| [README.md](README.md)                                               | Quick start + script reference |
| [cypress.base.config.js](cypress.base.config.js)                     | Shared config factory          |
| [cypress/support/commands.js](cypress/support/commands.js)           | Custom commands                |
| [cypress/pageObjects/](cypress/pageObjects)                          | Page Object Model classes      |
| [cypress/support/locators/](cypress/support/locators)                | Selector definitions           |
| [cypress/ROUTE_COVERAGE_MATRIX.md](cypress/ROUTE_COVERAGE_MATRIX.md) | Route → spec coverage          |
| [.github/workflows/ci.yml](.github/workflows/ci.yml)                 | Quality-gated pipeline         |

```

```
