# ShopWise Mock API — Route Coverage Matrix

**Scope:** ShopWise mock REST API (`mock-api/server.js` + json-server) vs. the
Cypress API specs in `cypress/e2e/api/*.cy.js`.
**Method:** Each route exposed by the mock API (the custom Express handlers in
`mock-api/server.js` plus the json-server CRUD routes for the `products`,
`categories`, `orders` and `notifications` resources) is listed, then every API
spec was checked for a `cy.request` call hitting that route. Multiple specs may
cover the same route; all are listed.

> This demo is a sanitized, self-contained mirror of a production framework.
> The numbers here are real for **this repo's bundled API** — produced the same
> way the production project produces its 300-route matrix, just at demo scale.

---

## Summary

| Metric       |    Value |
| ------------ | -------: |
| Route groups |        5 |
| Total routes |   **23** |
| Covered      |   **23** |
| Uncovered    |    **0** |
| Coverage     | **100%** |

### Per-group breakdown

| Group                    | Total | Covered | Uncovered |    % | Primary spec(s)                           |
| ------------------------ | ----: | ------: | --------: | ---: | ----------------------------------------- |
| auth / health / computed |     5 |       5 |         0 | 100% | `AuthAPI`, `HealthcheckAPI`, `ReportsAPI` |
| products                 |     6 |       6 |         0 | 100% | `ProductsAPI`, `AuthAPI`                  |
| categories               |     5 |       5 |         0 | 100% | `CategoriesAPI`                           |
| orders                   |     4 |       4 |         0 | 100% | `OrdersAPI`                               |
| notifications            |     3 |       3 |         0 | 100% | `NotificationsAPI`                        |

---

## Uncovered routes

None — every route exposed by the mock API has at least one Cypress API spec
hitting it via `cy.request`. (Several routes are _additionally_ exercised
through the UI: `/stats`, `/reports/summary`, `/notifications` and the order /
notification write paths are driven from the Dashboard, Reports, Notifications
and Checkout specs — some stubbed with `cy.intercept`.)

---

# Detailed per-route matrix

> Notation: `Auth` = `Y` if the route requires a bearer token (enforced by the
> mutation guard in `mock-api/server.js`), otherwise `N`. `Covering spec(s)`
> lists every API spec that hits the route.

## auth / health / computed (public)

Defined in [`mock-api/server.js`](../mock-api/server.js).

| #   | Method | Full path        | Auth | Covering spec(s)                                                                             |
| --- | ------ | ---------------- | ---- | -------------------------------------------------------------------------------------------- |
| 1   | GET    | /health          | N    | [HealthcheckAPI.cy.js](e2e/api/HealthcheckAPI.cy.js), [AuthAPI.cy.js](e2e/api/AuthAPI.cy.js) |
| 2   | POST   | /auth/login      | N    | [AuthAPI.cy.js](e2e/api/AuthAPI.cy.js) (`TC02-TC07`), `cy.apiLogin` in every CRUD spec       |
| 3   | POST   | /auth/refresh    | N    | [AuthAPI.cy.js](e2e/api/AuthAPI.cy.js) (`SW-AUTH-API-TC08`)                                  |
| 4   | GET    | /stats           | N    | [ReportsAPI.cy.js](e2e/api/ReportsAPI.cy.js) (`TC01-TC02`) — UI mirror: Dashboard            |
| 5   | GET    | /reports/summary | N    | [ReportsAPI.cy.js](e2e/api/ReportsAPI.cy.js) (`TC03-TC05`) — UI mirror: Reports              |

## products

| #   | Method | Full path     | Auth | Covering spec(s)                                                                                                     |
| --- | ------ | ------------- | ---- | -------------------------------------------------------------------------------------------------------------------- |
| 1   | GET    | /products     | N    | [ProductsAPI.cy.js](e2e/api/ProductsAPI.cy.js) (`TC01`, `TC02`)                                                      |
| 2   | GET    | /products/:id | N    | [ProductsAPI.cy.js](e2e/api/ProductsAPI.cy.js) (`TC03`, `TC04` 404)                                                  |
| 3   | POST   | /products     | Y    | [ProductsAPI.cy.js](e2e/api/ProductsAPI.cy.js) (`TC05` 401, `TC06`), [AuthAPI.cy.js](e2e/api/AuthAPI.cy.js) (`TC04`) |
| 4   | PATCH  | /products/:id | Y    | [ProductsAPI.cy.js](e2e/api/ProductsAPI.cy.js) (`TC07` self-reverting)                                               |
| 5   | PUT    | /products/:id | Y    | [ProductsAPI.cy.js](e2e/api/ProductsAPI.cy.js) (`TC09` self-reverting)                                               |
| 6   | DELETE | /products/:id | Y    | [ProductsAPI.cy.js](e2e/api/ProductsAPI.cy.js) (`TC06` revert, `TC08` 401)                                           |

## categories

| #   | Method | Full path       | Auth | Covering spec(s)                                                                |
| --- | ------ | --------------- | ---- | ------------------------------------------------------------------------------- |
| 1   | GET    | /categories     | N    | [CategoriesAPI.cy.js](e2e/api/CategoriesAPI.cy.js) (`TC01`, `TC02`)             |
| 2   | GET    | /categories/:id | N    | [CategoriesAPI.cy.js](e2e/api/CategoriesAPI.cy.js) (`TC03` 404, `TC05`, `TC06`) |
| 3   | POST   | /categories     | Y    | [CategoriesAPI.cy.js](e2e/api/CategoriesAPI.cy.js) (`TC04` 401, `TC05`)         |
| 4   | PATCH  | /categories/:id | Y    | [CategoriesAPI.cy.js](e2e/api/CategoriesAPI.cy.js) (`TC06` self-reverting)      |
| 5   | DELETE | /categories/:id | Y    | [CategoriesAPI.cy.js](e2e/api/CategoriesAPI.cy.js) (`TC05` revert)              |

## orders

| #   | Method | Full path   | Auth | Covering spec(s)                                                                              |
| --- | ------ | ----------- | ---- | --------------------------------------------------------------------------------------------- |
| 1   | GET    | /orders     | N    | [OrdersAPI.cy.js](e2e/api/OrdersAPI.cy.js) (`TC01`, `TC02`, `TC05`)                           |
| 2   | GET    | /orders/:id | N    | [OrdersAPI.cy.js](e2e/api/OrdersAPI.cy.js) (`TC04`)                                           |
| 3   | POST   | /orders     | Y    | [OrdersAPI.cy.js](e2e/api/OrdersAPI.cy.js) (`TC03` 401, `TC04`, `TC05`) — UI mirror: Checkout |
| 4   | DELETE | /orders/:id | Y    | [OrdersAPI.cy.js](e2e/api/OrdersAPI.cy.js) (`TC04`, `TC05` revert)                            |

## notifications

| #   | Method | Full path               | Auth | Covering spec(s)                                                                                             |
| --- | ------ | ----------------------- | ---- | ------------------------------------------------------------------------------------------------------------ |
| 1   | GET    | /notifications          | N    | [NotificationsAPI.cy.js](e2e/api/NotificationsAPI.cy.js) (`TC01`, `TC02`, `TC05`) — UI mirror: Notifications |
| 2   | PATCH  | /notifications/:id      | Y    | [NotificationsAPI.cy.js](e2e/api/NotificationsAPI.cy.js) (`TC04` restore step)                               |
| 3   | PATCH  | /notifications/read-all | Y    | [NotificationsAPI.cy.js](e2e/api/NotificationsAPI.cy.js) (`TC03` 401, `TC04`)                                |

---

## How to reproduce this audit

```bash
# 1. List the routes the mock API exposes
#    - custom handlers:
grep -nE "server\.(get|post|put|patch|delete)\(" mock-api/server.js
#    - json-server resources come from the top-level keys in db.json
#      (products, categories, orders, notifications) with full REST CRUD

# 2. List every endpoint exercised by the API specs
grep -rEn "method:|cy\.request\(" cypress/e2e/api/

# 3. Diff the two lists — every route above maps to at least one spec.
```
