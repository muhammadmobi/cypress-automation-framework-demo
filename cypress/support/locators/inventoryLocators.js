// Element selectors for the Inventory, Cart, Checkout and Confirmation screens.
const inventoryLocators = {
  // Inventory
  grid: () => cy.get("[data-test='inventory-grid']"),
  products: () => cy.get("[data-test='product']"),
  productName: () => cy.get("[data-test='product-name']"),
  sortDropdown: () => cy.get("[data-test='sort']"),
  addToCartButtons: () => cy.get("[data-test='add-to-cart']"),
  cartBadge: () => cy.get("[data-test='cart-badge']"),
  cartLink: () => cy.get("[data-test='cart-link']"),
  logout: () => cy.get("[data-test='logout']"),

  // Cart
  cartItems: () => cy.get("[data-test='cart-item']"),
  cartItemName: () => cy.get("[data-test='cart-item-name']"),
  emptyCart: () => cy.get("[data-test='empty-cart']"),
  removeButtons: () => cy.get("[data-test='remove-from-cart']"),
  checkoutButton: () => cy.get("[data-test='checkout']"),

  // Checkout
  firstName: () => cy.get("[data-test='first-name']"),
  lastName: () => cy.get("[data-test='last-name']"),
  postalCode: () => cy.get("[data-test='postal-code']"),
  finishButton: () => cy.get("[data-test='finish']"),
  checkoutError: () => cy.get("[data-test='checkout-error']"),

  // Confirmation
  confirmation: () => cy.get("[data-test='confirmation']"),
  confirmationMessage: () => cy.get("[data-test='confirmation-message']"),
};

export default inventoryLocators;
