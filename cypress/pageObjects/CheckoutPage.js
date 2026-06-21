import inventoryLocators from "../support/locators/inventoryLocators";

/** Page Object covering the Cart → Checkout → Confirmation flow. */
class CheckoutPage {
  visitCart() {
    cy.visit("/cart.html");
    return this;
  }

  removeFirstItem() {
    inventoryLocators.removeButtons().first().click();
    return this;
  }

  cartItemCount() {
    return inventoryLocators.cartItems().its("length");
  }

  proceedToCheckout() {
    inventoryLocators.checkoutButton().click();
    return this;
  }

  fillDetails({ firstName, lastName, postalCode }) {
    if (firstName) inventoryLocators.firstName().clear().type(firstName);
    if (lastName) inventoryLocators.lastName().clear().type(lastName);
    if (postalCode) inventoryLocators.postalCode().clear().type(postalCode);
    return this;
  }

  finish() {
    inventoryLocators.finishButton().click();
    return this;
  }

  verifyCheckoutError(expectedMessage) {
    inventoryLocators.checkoutError().should("be.visible").and("contain", expectedMessage);
    return this;
  }

  verifyOrderComplete() {
    inventoryLocators.confirmation().should("be.visible");
    inventoryLocators.confirmationMessage().should("contain", "Thank you");
    return this;
  }
}

export default CheckoutPage;
