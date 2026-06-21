/**
 * Inventory — Sorting Tests (SW-INV-SORT-TC01..TC04)
 * =============================================================================
 * Decision-table coverage of the four sort options. Login cached via cy.appSession.
 */
import InventoryPage from "../../pageObjects/InventoryPage";

describe("Inventory — Sorting", () => {
  const inventory = new InventoryPage();

  const sortCases = [
    { option: "az", label: "Name A→Z", expectFirst: "Barcode Scanner Pro" },
    { option: "za", label: "Name Z→A", expectFirst: "Warehouse Shelving Unit" },
    { option: "lohi", label: "Price low→high", expectFirst: "Stackable Storage Bin" },
    { option: "hilo", label: "Price high→low", expectFirst: "Pallet Jack 2.5T" },
  ];

  beforeEach(() => {
    cy.appSession();
    inventory.visit();
  });

  sortCases.forEach(({ option, label, expectFirst }) => {
    it(`SW-INV-SORT-TC: "${label}" puts ${expectFirst} first @regression`, () => {
      inventory.sortBy(option);
      cy.get("[data-test='product-name']").first().should("have.text", expectFirst);
    });
  });
});
