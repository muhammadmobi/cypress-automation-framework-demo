// Assistant drawer selectors.
const chatbotLocators = {
  fab: () => cy.get("[data-test='chat-fab']"),
  drawer: () => cy.get("[data-test='chat-drawer']"),
  close: () => cy.get("[data-test='chat-close']"),
  reset: () => cy.get("[data-test='chat-reset']"),
  log: () => cy.get("[data-test='chat-log']"),
  messages: () => cy.get("[data-test='chat-message']"),
  input: () => cy.get("[data-test='chat-input']"),
  send: () => cy.get("[data-test='chat-send']"),
  form: () => cy.get("[data-test='chat-form']"),
  suggestions: () => cy.get("[data-test='chat-suggestion']"),
  loading: () => cy.get("[data-test='chat-loading']"),
  error: () => cy.get("[data-test='chat-error']"),
  retry: () => cy.get("[data-test='chat-retry']"),
};

export default chatbotLocators;
