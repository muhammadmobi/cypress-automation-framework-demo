/**
 * Assistant — loading, error and retry (SW-CHAT-TC09..TC12)
 * =============================================================================
 * The local mock answers in a few milliseconds, so the loading indicator is only
 * observable with a delayed intercept. These specs pin the timing deliberately
 * rather than racing the real response.
 */
import ChatbotDrawer from "../../pageObjects/ChatbotDrawer";
import chatbotLocators from "../../support/locators/chatbotLocators";

describe("Assistant — loading and error handling", () => {
  const drawer = new ChatbotDrawer();

  beforeEach(() => {
    cy.appSession();
    cy.visit("/inventory.html");
  });

  it("SW-CHAT-TC09: a pending request shows the loading bubble @regression", () => {
    cy.intercept("POST", "**/chat", (req) => {
      req.reply({ delay: 700, statusCode: 200, body: { reply: "Done", suggestions: [] } });
    }).as("slowChat");
    drawer.open().ask("What is low on stock?");
    chatbotLocators.loading().should("be.visible");
    cy.wait("@slowChat");
    chatbotLocators.loading().should("not.exist");
  });

  it("SW-CHAT-TC10: the input is locked while a reply is in flight @regression", () => {
    cy.intercept("POST", "**/chat", (req) => {
      req.reply({ delay: 700, statusCode: 200, body: { reply: "Done", suggestions: [] } });
    }).as("slowChat");
    drawer.open().ask("What is low on stock?");
    chatbotLocators.input().should("be.disabled");
    cy.wait("@slowChat");
    chatbotLocators.input().should("not.be.disabled");
  });

  it("SW-CHAT-TC11: a failed request shows an error with a retry @smoke", () => {
    cy.intercept("POST", "**/chat", { statusCode: 500, body: {} }).as("failedChat");
    drawer.open().ask("What is low on stock?");
    cy.wait("@failedChat");
    drawer.verifyError();
    chatbotLocators.retry().should("be.visible");
  });

  it("SW-CHAT-TC12: retry re-sends the same question and clears the error", () => {
    let call = 0;
    cy.intercept("POST", "**/chat", (req) => {
      call += 1;
      if (call === 1) return req.reply({ statusCode: 500, body: {} });
      return req.reply({ statusCode: 200, body: { reply: "Recovered", suggestions: [] } });
    }).as("chat");

    drawer.open().ask("What is low on stock?");
    cy.wait("@chat");
    drawer.verifyError();

    drawer.retry();
    cy.wait("@chat");
    chatbotLocators.error().should("not.exist");
    drawer.verifyLastReply("Recovered");
  });
});
