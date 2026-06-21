/**
 * Configuration — Settings Tests (SW-CFG-TC01..TC03)
 * =============================================================================
 * The default-sort preference is persisted (localStorage) and applied on the
 * inventory screen — a state-persistence / state-transition scenario.
 */
import SettingsPage from "../../pageObjects/SettingsPage";
import InventoryPage from "../../pageObjects/InventoryPage";

describe("Configuration — Settings", () => {
  const settings = new SettingsPage();
  const inventory = new InventoryPage();

  beforeEach(() => {
    cy.appSession();
  });

  it("SW-CFG-TC01: saving the default sort shows a confirmation @smoke", () => {
    settings.visit().selectDefaultSort("hilo").save().verifySaved();
  });

  it("SW-CFG-TC02: the saved default sort persists across a reload @regression", () => {
    settings.visit().selectDefaultSort("za").save();
    settings.visit().verifyDefaultSort("za");
  });

  it("SW-CFG-TC03: the saved default sort is applied on the inventory screen", () => {
    settings.visit().selectDefaultSort("lohi").save();
    inventory.visit();
    cy.get("[data-test='sort']").should("have.value", "lohi");
    cy.get("[data-test='product-name']").first().should("have.text", "Stackable Storage Bin");
  });

  afterEach(() => {
    // restore the default so other specs see the canonical A→Z ordering
    cy.window().then((win) =>
      win.localStorage.setItem("shopwise.settings", JSON.stringify({ defaultSort: "az" }))
    );
  });
});
