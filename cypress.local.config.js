const { defineConfig } = require("cypress");
const { buildConfig } = require("./cypress.base.config");

/**
 * Local / CI configuration.
 *
 * Targets the self-contained demo stack that ships with this repo:
 *   - ShopWise web app  → http://localhost:8080  (static, served by http-server)
 *   - ShopWise mock API → http://localhost:3001  (json-server)
 *
 * Boot both with `npm start`, or let `npm test` start them for you.
 */
module.exports = defineConfig(
  buildConfig({
    baseUrl: "http://localhost:8080",
    env: {
      API_BASE_URL: "http://localhost:3001",
      IDENTITY_SERVER_BASE_URL: "http://localhost:3001",
      email: "user",
      pass: "password",
    },
  })
);
