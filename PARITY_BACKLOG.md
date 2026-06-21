# Parity Backlog — Demo vs. Production Framework

**Purpose.** This document enumerates **every** spec in the source
`stockwise-cypress-tests` framework (190 spec files, ~2,565 tests) and maps each
to its status in this demo, so you can see exactly **what still needs to be
added** to reach module-by-module parity — and what each addition requires.

> **Important — why specs can't just be copied.** The source specs target the
> real StockWise app + backend (its pages, routes, locators, seed data, and
> credentials). This demo targets a bundled _ShopWise_ app + mock API with no
> real URLs/secrets. Every ported spec must be **adapted** to the demo target,
> which usually means first building the matching **app screen** and **mock-API
> route**. The "Prerequisite" column below names that surface.

**Legend**

| Mark | Meaning                                                                                                              |
| ---- | -------------------------------------------------------------------------------------------------------------------- |
| ✅   | Done — an adapted equivalent exists in the demo                                                                      |
| 🟡   | Partial — some coverage exists; more cases/screens to add                                                            |
| ➕   | To add — no demo equivalent yet; build the prerequisite, then the spec                                               |
| ⚪   | Out of scope — StockWise-specific (hardware, Excel-engine, LLM, AccountWise); port only if you want a stub-only mock |

---

## 1. Headline numbers

| Suite        | Spec files | Tests (`it`) |
| ------------ | ---------: | -----------: |
| **Source**   |    **190** |   **~2,565** |
| **Demo now** |     **19** |       **91** |
| Gap          |        171 |       ~2,474 |

The demo is a **proof-of-capability slice**: it already exercises every
_framework technique_ (POM, locators, fixtures, sessions, tags, reporting, CI,
quality gates, stub-driven specs, self-reverting API CRUD, route-coverage
matrix). The backlog below is about _breadth of coverage_, not new techniques.

---

## 2. Module summary — where the gap is

| Module               | Source specs | Source tests | Demo specs | Demo tests | Status        |
| -------------------- | -----------: | -----------: | ---------: | ---------: | ------------- |
| Root (login/nav/etc) |           23 |          432 |          2 |         15 | 🟡 partial    |
| `api/`               |           58 |          635 |          7 |         40 | 🟡 partial    |
| `Configuration/`     |           14 |          523 |          1 |          3 | ➕ mostly new |
| `IncomingInventory/` |           32 |          413 |          0 |          0 | ➕ new module |
| `Inventory/`         |           22 |          293 |          3 |         10 | 🟡 partial    |
| `InventoryActions/`  |           24 |          220 |          0 |          0 | ➕ new module |
| `Notifications/`     |            6 |           27 |          2 |          6 | 🟡 partial    |
| `Chatbot/`           |           11 |           22 |          0 |          0 | ➕ new module |
| `Cart/` (demo-only)  |            — |            — |          2 |         10 | ✅ demo extra |
| `Dashboard/` (demo)  |            — |            — |          1 |          4 | ✅ demo extra |
| `Reports/` (demo)    |            — |            — |          1 |          3 | ✅ demo extra |

---

## 3. Prerequisites — app & mock-API surface to build first

Most of the backlog is blocked on **feature surface** that doesn't exist in the
ShopWise demo yet. Build these once, and dozens of specs become portable.

| Capability to add                                                                        | Unlocks (source modules)                                          | Effort |
| ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | -----: |
| **Attributes** admin UI + `/attributes` CRUD                                             | Configuration 01–04, 14; api Attribute\* (5 specs)                |  large |
| **Product create/edit/delete** UI                                                        | 05-AddProduct, Inventory Add/Edit/Delete; api Product\*           | medium |
| **Purchase Orders + Incoming Inventory** screens + `/incoming-items`, `/purchase-orders` | all of IncomingInventory (32); StockIn/Scan; api PO/IncomingItems |  large |
| **Inventory grid** filters/sort/pagination/group-by/columns                              | Inventory (22)                                                    | medium |
| **Inventory Actions (mobile)** landing + destination screens                             | InventoryActions (24); api StockIn/Out/Restock                    |  large |
| **Work Orders** module + `/work-orders`                                                  | 20-WorkOrderTests (97); api WorkOrder\*                           |  large |
| **WMS** Locations + Containers screens + `/locations`,`/containers`                      | 25, 26; api Wms\* (4 specs)                                       |  large |
| **Reports** (cost/PO/custom) + filters                                                   | 21, 22; api CostReport/CustomReports/PurchaseOrderReport          | medium |
| **Inventory Audit** flow + `/inventory-audits`                                           | Inventory Audit\*; api InventoryAuditAPI                          | medium |
| **Chatbot** FAB + drawer widget (stub-driven)                                            | Chatbot (11); api ChatbotAPI                                      |  small |
| **Notifications** filter + virtual scroll + loading states                               | Notifications 02–06                                               |  small |
| **CSV/Excel export** Node task + download verify                                         | 09-ExportExcel; Inventory/Incoming export specs                   |  small |
| **Teardown** spec pattern                                                                | ZZ_TeardownAPI; Configuration 11                                  |  small |

---

## 4. Suggested roadmap (incremental, stays green at each step)

**Phase 1 — round out what already exists (low effort, high parity %)**

- Notifications: add `03-ListAndLoading`, `04-Filter`, `06-VirtualScroll` (stub-driven).
- Inventory: add `Pagination`, `CategoryFilter`, `CustomizeColumns`, `Delete`, `EditProduct`, `Refresh`, `StatsClickable`, `Threshold`, `GroupBy`, `ItemsView`, `ProductDetail`.
- Dashboard: expand to widget/chart cases (source has 29).
- api: add `ProductsExtended`-style negative/edge specs; add a demo `ZZ_TeardownAPI`.

**Phase 2 — new stub-driven modules (small surface)**

- Chatbot module (FAB + drawer, fully `cy.intercept`) — 11 specs.
- Attributes-config (stub the `/attributes` schema) — Configuration 01–04.

**Phase 3 — new real modules (build app + API surface)**

- Purchase Orders + Incoming Inventory (unlocks 32 + api PO/IncomingItems).
- Work Orders (expand demo Orders into a full WO lifecycle).
- WMS Locations + Containers.

**Phase 4 — file/IO & long-tail**

- CSV/Excel export Node task + download-verify specs.
- Cost/PO/Custom report filters.

---

## 5. Full appendix — every source spec, mapped

> `Tests` = `it()` count in the source spec. `Demo` = current status.

### Root-level (`cypress/e2e/*.cy.js`) — 23 specs / 432 tests

| Spec                              | Tests | Demo | Action / prerequisite                          |
| --------------------------------- | ----: | ---- | ---------------------------------------------- |
| 00-ensureAttrsOptional            |     1 | ⚪   | Attribute-schema precondition — skip           |
| 00-loginPageTest                  |    15 | ✅   | `00-loginPageTest.cy.js`                       |
| 01-navigationTest                 |    70 | 🟡   | Demo covers 6 routes; add more as screens grow |
| 03-catagoryCRUDTest               |     2 | 🟡   | API done; add UI category CRUD (Config screen) |
| 04-catagoryAttribCRUDTest         |     3 | ➕   | Needs Attributes UI + `/attributes`            |
| 05-AddProductTests                |     9 | ➕   | Needs product-create UI                        |
| 07-StockInTests                   |     2 | ➕   | Needs Incoming Inventory + PO                  |
| 08-InventoryActionStockIn         |     2 | ➕   | Needs Inventory Actions (mobile)               |
| 09-ExportExcelFileTests           |     2 | ➕   | Needs export Node task + download verify       |
| 10-ScanTests                      |     1 | ➕   | Needs scan input simulation                    |
| 11-StockOutTests                  |     3 | ➕   | Needs stock-out flow                           |
| 12-InventoryActionStockOut        |     1 | ➕   | Inventory Actions                              |
| 13-InventoryActionScanDamaged     |     1 | ➕   | Inventory Actions                              |
| 14-InventoryActionCheckItemStatus |     1 | ➕   | Inventory Actions                              |
| 15-InvActionRestock               |     1 | ➕   | Inventory Actions                              |
| 16-InventoryActionStockOutBTO     |     2 | ➕   | Inventory Actions (build-to-order)             |
| 17-InventoryActionProductListing  |     2 | ➕   | Inventory Actions                              |
| 19-DashboardTests                 |    29 | 🟡   | Demo Dashboard has 4; add widgets/charts       |
| 20-WorkOrderTests                 |    97 | ➕   | Needs Work Orders module                       |
| 21-PurchaseOrderReportTests       |    22 | ➕   | Needs PO report screen                         |
| 22-CostReportTests                |    27 | ➕   | Needs cost report + filters                    |
| 25-WarehouseLocationsTests        |    89 | ➕   | Needs WMS Locations module                     |
| 26-WarehouseContainersTests       |    50 | ➕   | Needs WMS Containers module                    |

### `api/` — 58 specs / 635 tests

| Spec                            | Tests | Demo | Action / prerequisite                           |
| ------------------------------- | ----: | ---- | ----------------------------------------------- |
| LoginAPI                        |    10 | ✅   | `AuthAPI.cy.js`                                 |
| HealthcheckAPI                  |     2 | ✅   | `HealthcheckAPI.cy.js`                          |
| CategoryAPI                     |    17 | 🟡   | `CategoriesAPI` (add sort/pagination/hierarchy) |
| CreateCategoryAPI               |     8 | 🟡   | `CategoriesAPI` (add validation variants)       |
| NotificationsAPI                |    10 | ✅   | `NotificationsAPI.cy.js`                        |
| ReportsAPI                      |    12 | 🟡   | `ReportsAPI` (add report types)                 |
| DashboardAPI                    |    32 | 🟡   | `ReportsAPI` `/stats` (add KPI endpoints)       |
| ProductAPI                      |    12 | 🟡   | `ProductsAPI` (add update/variant paths)        |
| ProductListingAPI               |    10 | 🟡   | `ProductsAPI` (add search/grouped)              |
| ProductsExtendedAPI             |    25 | 🟡   | add asset/threshold/bulk routes                 |
| ProductsExtraAPI                |    16 | 🟡   | add item/variant/shift routes                   |
| WorkOrderAPI                    |    12 | 🟡   | `OrdersAPI` partial → build WO routes           |
| WorkOrderExtendedAPI            |    14 | 🟡   | build WO routes                                 |
| CostReportAPI                   |     8 | 🟡   | add cost-report endpoint                        |
| CustomReportsAPI                |     7 | ➕   | add `/custom-reports`                           |
| PurchaseOrderAPI                |    18 | ➕   | add `/purchase-orders`                          |
| PurchaseOrderExtraAPI           |     6 | ➕   | `/purchase-orders` extras                       |
| PurchaseOrderReportAPI          |     6 | ➕   | PO report endpoint                              |
| AttributesExtendedAPI           |    13 | ➕   | add `/attributes`                               |
| CommonAttributeAPI              |     8 | ➕   | `/attributes` matrix                            |
| ProductCategoryAttributeAPI     |     8 | ➕   | `/attributes` per category                      |
| ProductItemCategoryAttributeAPI |     4 | ➕   | `/attributes` item-level                        |
| AttributeDeletionRestrictionAPI |     4 | ➕   | `/attributes` delete guard                      |
| ProductNameAPI                  |     7 | ➕   | `/product-name-config`                          |
| ManageHierarchyAPI              |     7 | ➕   | category hierarchy `PATCH /attributes`          |
| ScanAPI                         |     8 | ➕   | `/incoming-items/scan`                          |
| ScanConfigAPI                   |     7 | ➕   | `/scan-config`                                  |
| ScanDamagedAPI                  |     8 | ➕   | `/incoming-items/scan-damaged`                  |
| StockInAPI                      |    10 | ➕   | `/incoming-items/check-in`                      |
| StockOutAPI                     |     2 | ➕   | `/products/stock-out`                           |
| StockoutBTOAPI                  |    19 | ➕   | build-to-order stockout                         |
| RestockAPI                      |     8 | ➕   | `/products/restock-product`                     |
| CheckItemStatusAPI              |     6 | ➕   | `/products/check-status`                        |
| InventoryActionStockOutAPI      |    10 | ➕   | `/products/mark-status`                         |
| IncomingItemsExtendedAPI        |    18 | ➕   | `/incoming-items` (extended)                    |
| IncomingItemsExtraAPI           |     8 | ➕   | `/incoming-items` (extra)                       |
| InventoryAuditAPI               |    15 | ➕   | `/inventory-audits`                             |
| GeneralConfigAPI                |    34 | ➕   | `/configs`                                      |
| ConfigsPoAssignmentAPI          |     7 | ➕   | `/configs/po-assignment`                        |
| ViewConfigsAPI                  |     6 | ➕   | `/view-configs`                                 |
| ImportMappingTemplatesAPI       |     7 | ➕   | `/import-mapping`                               |
| ExportInventoryAPI              |     8 | ➕   | export endpoint                                 |
| AuditAPI                        |     5 | ➕   | `/audit`                                        |
| AuditTrailAPI                   |     6 | ➕   | `/audittrail`                                   |
| ErrorLogAPI                     |     6 | ➕   | `/errorlog`                                     |
| MiscExtraAPI                    |     7 | ➕   | misc routes                                     |
| WmsLocationAPI                  |    16 | ➕   | `/locations`                                    |
| WmsLocationAssignmentAPI        |    12 | ➕   | `/location-assignments`                         |
| WmsContainerAPI                 |    25 | ➕   | `/containers`                                   |
| WmsContainerTypeAPI             |     6 | ➕   | `/container-types`                              |
| ChatbotAPI                      |     8 | ➕   | `/chatbot` (stubbable)                          |
| ChatbotAccuracyAPI              |    21 | ⚪   | LLM accuracy — N/A for a mock                   |
| BrainBoxConfigAPI               |     9 | ⚪   | Hardware integration — N/A                      |
| BrainboxStockInAPI              |    21 | ⚪   | Hardware integration — N/A                      |
| BrainboxStockOutAPI             |    13 | ⚪   | Hardware integration — N/A                      |
| ImportAPI                       |    10 | ⚪   | Excel multipart + backend defect — N/A          |
| ExcelImportAPI                  |     7 | ⚪   | Excel engine — N/A                              |
| ZZ_TeardownAPI                  |     6 | ➕   | Add a demo teardown spec (cleanup pattern)      |

### `Configuration/` — 14 specs / 523 tests

| Spec                                | Tests | Demo | Action / prerequisite            |
| ----------------------------------- | ----: | ---- | -------------------------------- |
| 01-common-attribute-tests           |   118 | ➕   | Attributes UI + `/attributes`    |
| 02-product-cat-attribute-tests      |    54 | ➕   | Attributes UI                    |
| 03-product-Item-cat-attribute-tests |   124 | ➕   | Attributes UI                    |
| 04-attribute-deletion-restriction   |    52 | ➕   | Attributes UI                    |
| 05-categoryTests                    |    43 | ➕   | Category admin UI (API exists)   |
| 06-productNameTests                 |    14 | ➕   | Product-name config screen       |
| 07-manageHierarchyTests             |     9 | ➕   | Hierarchy drag/drop              |
| 08-scan-config-tests                |    10 | ➕   | Scan-config screen               |
| 09-BrainBoxConfigTests              |     9 | ⚪   | Hardware — N/A                   |
| 10-generalConfigTests               |    34 | 🟡   | `SettingsTests` (expand toggles) |
| 11-zz-teardownConfiguration         |     2 | ➕   | Teardown pattern                 |
| 12-generalConfigExtendedTests       |    27 | 🟡   | Expand `SettingsTests`           |
| 13-printersPageTests                |    15 | ⚪   | Printer hardware — N/A (or stub) |
| 14-attributeExtrasTests             |    12 | ➕   | Attributes UI                    |

### `Inventory/` — 22 specs / 293 tests

| Spec                           | Tests | Demo | Action / prerequisite             |
| ------------------------------ | ----: | ---- | --------------------------------- |
| InventorySortingTests          |     5 | ✅   | `Inventory/InventorySortingTests` |
| (listing/schema)               |     — | ✅   | `Inventory/InventoryListTests`    |
| InventoryAddProductTests       |    11 | ➕   | Product-create UI                 |
| InventoryEditProductTests      |     6 | ➕   | Product-edit UI                   |
| InventoryDeleteTests           |     4 | ➕   | Product-delete UI                 |
| InventoryAdvancedSearchTests   |    22 | ➕   | Advanced-search panel             |
| InventoryCategoryFilterTests   |    73 | ➕   | Category filter                   |
| InventoryChangeStatusTests     |    25 | ➕   | Status change                     |
| InventoryGroupByTests          |    25 | ➕   | Group-by                          |
| InventoryStockOutTests         |    21 | ➕   | Stock-out                         |
| InventoryAuditScanTests        |    18 | ➕   | Inventory audit                   |
| InventoryStatsClickableTests   |    14 | ➕   | Clickable stats                   |
| InventoryAuditListTests        |    13 | ➕   | Inventory audit                   |
| InventoryAuditReportTests      |    12 | ➕   | Inventory audit                   |
| InventoryCustomizeColumnsTests |     6 | ➕   | Column customizer                 |
| InventoryProductDetailTests    |     6 | ➕   | Product detail                    |
| InventoryRestockTests          |     6 | ➕   | Restock                           |
| InventoryItemsViewTests        |     5 | ➕   | Items view                        |
| InventoryBulkStockOutTests     |     4 | ➕   | Bulk stock-out                    |
| InventoryThresholdTests        |     4 | ➕   | Threshold                         |
| InventoryPaginationTests       |     3 | ➕   | Pagination (needs >1 page)        |
| InventoryRefreshTests          |     2 | ➕   | Refresh                           |
| InventoryExcelExportTests      |     8 | ➕   | Export task                       |

### `IncomingInventory/` — 32 specs / 413 tests — **new module**

All ➕. Prerequisite: a Purchase-Order + Incoming-Inventory section in the app
plus `/purchase-orders` and `/incoming-items` in the mock API. Highest-value
files first: `ImportTests` (69), `IncInvStatsClickTests` (53), `ChangeStatusTests`
(26), `ExportTests` (21), `UpdateCostPrice` (20), `AddProduct` (16),
`ItemSearchTests` (15), `AuditTrailTests` (14), then the rest (Add/Move/Scan/
Sort/Pagination/Delete/etc.).

### `InventoryActions/` — 24 specs / 220 tests — **new module**

All ➕. Prerequisite: a mobile `/MobileViewScreen`-style landing + destination
screens (StockIn/StockOut/Restock/CheckStatus/MarkDamaged/Assign/Unassign/
Containers/Assets). Largest: `01-LandingScreen` (28), `17-ContainerLocation`
(24), `19-ViewContents` (23), `13-AssignItems` (19), `20-PrintLabels` (18).

### `Notifications/` — 6 specs / 27 tests

| Spec                   | Tests | Demo | Action / prerequisite                      |
| ---------------------- | ----: | ---- | ------------------------------------------ |
| 01-BellAndPopover      |     3 | ✅   | `Notifications/01-BellAndBadge`            |
| 05-MarkAsRead          |     5 | ✅   | `Notifications/02-MarkAsRead`              |
| 02-Badge               |     7 | 🟡   | Add BVA on badge cap (`max=99`)            |
| 04-FilterAndEmptyState |     5 | 🟡   | Empty-state done; add "unread only" filter |
| 03-ListAndLoading      |     6 | ➕   | Add skeleton/loading + list-content        |
| 06-VirtualScroll       |     1 | ➕   | Add virtual-scroll viewport case           |

### `Chatbot/` — 11 specs / 22 tests — **new module (stub-driven)**

All ➕. Prerequisite: a small chat FAB + drawer widget in the app; every test is
`cy.intercept`-stubbed (no real LLM). Cheapest new module to add — mirrors the
source's fully stub-driven approach. Files: FabAndRoleGate, DrawerOpenClose,
Suggestions, SendFlow, SendButtonStates, LoadingState, InlinePayloads, Feedback,
ConversationReset, ErrorAndRetry, ErrorBoundary.

---

## 6. What is intentionally _not_ ported (⚪)

These depend on StockWise-specific infrastructure and add little to a public
framework demo. Port only as **stub-only** mocks if you want the file count:

- **BrainBox** hardware stock-in/out + config (api + Configuration 09).
- **Chatbot accuracy** (LLM quality scoring).
- **Excel import engine** (multipart upload + a documented backend defect).
- **Printers** page (label-printer hardware).
- **AccountWise** work-order/invoice integration (cross-service).

Everything else is portable to the demo target with the prerequisite surface
listed in §3.
