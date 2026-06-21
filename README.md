# Cypress Automation Framework — Demo

[![CI](https://github.com/your-org/cypress-automation-framework-demo/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/cypress-automation-framework-demo/actions/workflows/ci.yml)
[![Cypress](https://img.shields.io/badge/tested%20with-Cypress-04C38E?logo=cypress&logoColor=white)](https://www.cypress.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A production-style **Cypress (JavaScript)** end-to-end **and** API automation framework, built to demonstrate the things that matter in a real test suite: a clean Page Object Model, data-driven specs, tag-based smoke/regression filtering, rich HTML reporting, and a fully **quality-gated CI/CD pipeline**.

To keep it runnable by anyone with zero setup, the repo ships its **own target**: a tiny self-contained _ShopWise_ web app and a mock REST API. The whole suite runs offline, in CI, with **no real URLs or credentials**.

> **Note on configuration.** The "production" config (`cypress.config.js`) ships with deliberately generic placeholders — `baseUrl: https://sw.com`, user `user` / password `password`. Point it at your own environment and inject real credentials from CI secrets. **Never commit real secrets.**

---

## What this demonstrates

| Area                           | How                                                                                                          |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| **Page Object Model**          | `cypress/pageObjects/` with selectors isolated in `cypress/support/locators/` — a UI change touches one file |
| **Custom commands & sessions** | `cy.login`, `cy.appSession` (cached `cy.session`), `cy.apiLogin` in `cypress/support/commands.js`            |
| **Data-driven testing**        | Fixtures (`cypress/fixtures/`) + decision-table loops (sorting, checkout validation)                         |
| **API testing**                | Pure `cy.request` specs with auth, self-reverting CRUD, negative-auth and schema-shape assertions            |
| **Test tagging**               | `@smoke` / `@regression` via `@bahmutov/cy-grep`                                                             |
| **Reporting**                  | `cypress-mochawesome-reporter` → merged single-file HTML report, published to GitHub Pages                   |
| **Quality gates**              | ESLint (+ `eslint-plugin-cypress`) and Prettier must pass before tests run in CI                             |
| **CI/CD**                      | GitHub Actions: `lint-and-format → test → publish-report`                                                    |
| **Config strategy**            | One `cypress.base.config.js` factory; per-environment configs inject only URLs/creds                         |

---

## Project structure

```
cypress-automation-framework-demo/
├── app/                       # ShopWise demo SPA (target under test) — served on :8080
│                              #   login, inventory, cart, checkout, dashboard, orders, reports, settings
├── mock-api/                  # json-server REST API (auth + CRUD + computed) — served on :3001
├── cypress/
│   ├── e2e/                   # module-grouped specs (mirrors the production layout)
│   │   ├── 00-loginPageTest.cy.js
│   │   ├── 01-navigationTest.cy.js
│   │   ├── api/               # AuthAPI, ProductsAPI, CategoriesAPI, OrdersAPI, NotificationsAPI, ReportsAPI, HealthcheckAPI
│   │   ├── Inventory/         # listing, sorting, add-to-cart
│   │   ├── Cart/              # cart + checkout
│   │   ├── Dashboard/         # KPI cards (real + stubbed)
│   │   ├── Notifications/     # stub-driven bell/badge/mark-as-read
│   │   ├── Configuration/     # settings persistence
│   │   └── Reports/           # category report (real + stubbed)
│   ├── pageObjects/           # Page Object Model classes
│   ├── support/
│   │   ├── locators/          # Selectors, isolated per screen
│   │   ├── commands.js        # cy.login / cy.appSession / cy.apiLogin
│   │   └── e2e.js             # global setup + cy-grep registration
│   ├── fixtures/              # static test data
│   └── ROUTE_COVERAGE_MATRIX.md  # mock-API route → spec coverage (23/23)
├── cypress.base.config.js     # shared config factory
├── cypress.config.js          # "production" config (PLACEHOLDER urls/creds)
├── cypress.local.config.js    # local/CI config → bundled app + mock API
├── cypress-framework-documentation.md  # full master documentation
├── .github/workflows/ci.yml   # quality-gated pipeline
├── .eslintrc.json / .prettierrc.json
└── package.json
```

---

## Getting started

```bash
# 1. Install (also downloads the Cypress binary)
npm install

# 2. Run the whole suite (boots the app + mock API, runs Cypress, builds the report)
npm test
```

`npm test` uses [`start-server-and-test`](https://github.com/bahmutov/start-server-and-test) to start both servers, wait for them, and run Cypress. To drive Cypress interactively instead:

```bash
npm start          # in one terminal: boots app (:8080) + mock API (:3001)
npm run cy:open    # in another: opens the Cypress Test Runner
```

---

## NPM scripts

| Script                            | Description                                                 |
| --------------------------------- | ----------------------------------------------------------- |
| `npm start`                       | Boot the demo app + mock API together                       |
| `npm test`                        | Boot servers, run the full suite headless                   |
| `npm run test:smoke`              | Boot servers, run only `@smoke` tests                       |
| `npm run test:ci`                 | Clean → run → merge + generate the HTML report (used by CI) |
| `npm run cy:open`                 | Open the Cypress Test Runner (servers must be running)      |
| `npm run cy:run`                  | Run all specs headless                                      |
| `npm run cy:run:smoke`            | Run only `@smoke`-tagged specs                              |
| `npm run cy:run:regression`       | Run only `@regression`-tagged specs                         |
| `npm run report`                  | Merge Mochawesome JSON → single-file HTML report            |
| `npm run serve-report`            | Serve the generated HTML report on `:9000`                  |
| `npm run lint` / `lint:fix`       | ESLint                                                      |
| `npm run format` / `format:check` | Prettier                                                    |

---

## Test inventory

**19 spec files · 91 tests** (all green). Test IDs follow `SW-<AREA>-TC<NN>`
(UI) and `SW-<AREA>-API-TC<NN>` (API). Tags: `@smoke`, `@regression`.

**UI**

| Spec                                    | IDs                    | Covers                                                                                            |
| --------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------- |
| `00-loginPageTest.cy.js`                | `SW-AUTH-TC01..09`     | Rendering, required-field validation, invalid creds, locked-out user, happy path, session, logout |
| `01-navigationTest.cy.js`               | `SW-NAV-TC01..06`      | Every nav destination reachable from the top bar                                                  |
| `Inventory/InventoryListTests.cy.js`    | `SW-INV-TC01..03`      | Product listing + on-screen schema                                                                |
| `Inventory/InventorySortingTests.cy.js` | `SW-INV-SORT-TC`       | Sorting decision table (4 options)                                                                |
| `Inventory/InventoryCartTests.cy.js`    | `SW-INV-CART-TC01..03` | Cart-badge state transitions                                                                      |
| `Cart/CartTests.cy.js`                  | `SW-CART-TC01..04`     | Cart contents, running total, removal, empty state                                                |
| `Cart/CheckoutTests.cy.js`              | `SW-CHK-TC01..04`      | Full checkout, stubbed order POST, validation decision table                                      |
| `Dashboard/DashboardTests.cy.js`        | `SW-DSH-TC01..04`      | KPI cards (real `/stats`) + stubbed + error state                                                 |
| `Notifications/01-BellAndBadge.cy.js`   | `SW-NOT-TC01..04`      | Stub-driven bell, badge count, empty state                                                        |
| `Notifications/02-MarkAsRead.cy.js`     | `SW-NOT-TC05..06`      | Stub-driven mark-all state transition + bearer header                                             |
| `Configuration/SettingsTests.cy.js`     | `SW-CFG-TC01..03`      | Default-sort persistence + applied on inventory                                                   |
| `Reports/ReportsTests.cy.js`            | `SW-RPT-TC01..03`      | Category report table (real `/reports/summary`) + stubbed                                         |

**API** (`cypress/e2e/api/`)

| Spec                     | IDs                    | Covers                                                                   |
| ------------------------ | ---------------------- | ------------------------------------------------------------------------ |
| `HealthcheckAPI.cy.js`   | `SW-HC-API-TC01..02`   | Public liveness probe                                                    |
| `AuthAPI.cy.js`          | `SW-AUTH-API-TC01..08` | Login happy/negative, role, token usability, refresh-token flow          |
| `ProductsAPI.cy.js`      | `SW-PROD-API-TC01..09` | List, read, 404, 401, self-reverting POST/PATCH/PUT/DELETE, schema shape |
| `CategoriesAPI.cy.js`    | `SW-CAT-API-TC01..06`  | CRUD, 404, 401, self-reverting create→delete & PATCH                     |
| `OrdersAPI.cy.js`        | `SW-ORD-API-TC01..05`  | List/read, 401, self-reverting create→delete, list discoverability       |
| `NotificationsAPI.cy.js` | `SW-NOT-API-TC01..05`  | Inbox read, 401, self-reverting bulk mark-as-read                        |
| `ReportsAPI.cy.js`       | `SW-RPT-API-TC01..05`  | `/stats` + `/reports/summary` contract & cross-checks                    |

Full route → spec mapping: [cypress/ROUTE_COVERAGE_MATRIX.md](cypress/ROUTE_COVERAGE_MATRIX.md) (23/23 routes, 100%).

> **Roadmap to full parity.** This demo is a focused slice of a much larger
> production suite. [PARITY_BACKLOG.md](PARITY_BACKLOG.md) maps every spec in the
> source framework (190 files / ~2,565 tests) to its demo status and lists
> exactly what to add next, module by module.

---

## CI/CD pipeline & quality gates

`.github/workflows/ci.yml` runs three jobs, each gating the next:

1. **`lint-and-format`** — ESLint + Prettier. The build fails here on any lint error or formatting drift.
2. **`test`** — installs, boots the bundled app + mock API, runs Cypress, builds the Mochawesome report, and uploads it (plus failure screenshots) as artifacts.
3. **`publish-report`** — on pushes to `main`, deploys the HTML report to **GitHub Pages**.

To publish the report, enable **Settings → Pages → Source: GitHub Actions** in your repository.

---

## Pointing it at a real application

The framework is environment-agnostic. To run against your own app:

```bash
npx cypress run \
  --config baseUrl=https://your-app.example.com \
  --env API_BASE_URL=https://api.your-app.example.com,email=$USER,pass=$PASS
```

Or edit `cypress.config.js`. Keep real credentials out of source control — pass them via `--env`, a git-ignored `cypress.env.json`, or CI secrets.

---

## License

[MIT](LICENSE)
