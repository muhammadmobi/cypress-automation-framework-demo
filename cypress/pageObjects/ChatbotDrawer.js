import chatbotLocators from "../support/locators/chatbotLocators";

/** Page Object for the floating assistant drawer. */
class ChatbotDrawer {
  open() {
    chatbotLocators.fab().click();
    return this;
  }

  close() {
    chatbotLocators.close().click();
    return this;
  }

  reset() {
    chatbotLocators.reset().click();
    return this;
  }

  type(text) {
    chatbotLocators.input().clear().type(text);
    return this;
  }

  send() {
    chatbotLocators.send().click();
    return this;
  }

  ask(text) {
    return this.type(text).send();
  }

  clickSuggestion(text) {
    chatbotLocators.suggestions().contains(text).click();
    return this;
  }

  retry() {
    chatbotLocators.retry().click();
    return this;
  }

  verifyOpen() {
    chatbotLocators.drawer().should("be.visible");
    return this;
  }

  verifyClosed() {
    chatbotLocators.drawer().should("not.be.visible");
    return this;
  }

  verifySendDisabled() {
    chatbotLocators.send().should("be.disabled");
    return this;
  }

  verifySendEnabled() {
    chatbotLocators.send().should("not.be.disabled");
    return this;
  }

  verifyMessageCount(n) {
    chatbotLocators.messages().should("have.length", n);
    return this;
  }

  verifyLastReply(text) {
    chatbotLocators.messages().last().should("have.attr", "data-role", "bot").and("contain", text);
    return this;
  }

  verifyError() {
    chatbotLocators.error().should("be.visible");
    return this;
  }
}

export default ChatbotDrawer;
