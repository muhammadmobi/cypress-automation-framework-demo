const { defineConfig } = require("cypress");
const { buildConfig } = require("./cypress.base.config");

/**
 * "Production"-style configuration (PLACEHOLDER).
 *
 * These values are intentionally generic — point them at your own environment.
 * They are NOT used by `npm test` or by CI; the pipeline runs against the
 * bundled demo app via `cypress.local.config.js`.
 *
 * Override per-run without editing this file:
 *   npx cypress run --config baseUrl=https://your-app.example.com \
 *     --env email=you,pass=secret
 *
 * In CI, inject real credentials from secrets — never commit them.
 */
module.exports = defineConfig(
  buildConfig({
    baseUrl: "https://sw.com",
    env: {
      API_BASE_URL: "https://api.sw.com",
      IDENTITY_SERVER_BASE_URL: "https://identity.sw.com",
      email: "user",
      pass: "password",
    },
  })
);
