import inventoryLocators from "../support/locators/inventoryLocators";

/** Page Object for the Inventory (product listing) screen. */
class InventoryPage {
  visit() {
    cy.visit("/inventory.html");
    return this;
  }

  productCount() {
    return inventoryLocators.products().its("length");
  }

  sortBy(value) {
    inventoryLocators.sortDropdown().select(value);
    return this;
  }

  addFirstProductToCart() {
    inventoryLocators.addToCartButtons().first().click();
    return this;
  }

  addProductByName(name) {
    inventoryLocators
      .products()
      .contains("[data-test='product']", name)
      .find("[data-test='add-to-cart']")
      .click();
    return this;
  }

  verifyCartBadge(count) {
    inventoryLocators.cartBadge().should("be.visible").and("have.text", String(count));
    return this;
  }

  goToCart() {
    inventoryLocators.cartLink().click();
    return this;
  }
}

export default InventoryPage;
