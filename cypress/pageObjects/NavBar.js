import navLocators from "../support/locators/navLocators";

/** Page Object for the shared top navigation + notifications bell. */
class NavBar {
  goToDashboard() {
    navLocators.dashboard().click();
    return this;
  }
  goToOrders() {
    navLocators.orders().click();
    return this;
  }
  goToReports() {
    navLocators.reports().click();
    return this;
  }
  goToSettings() {
    navLocators.settings().click();
    return this;
  }
  goToCart() {
    navLocators.cartLink().click();
    return this;
  }
  logout() {
    navLocators.logout().click();
    return this;
  }
  openNotifications() {
    navLocators.bell().click();
    return this;
  }
  markAllNotificationsRead() {
    navLocators.markAll().click();
    return this;
  }
}

export default NavBar;
