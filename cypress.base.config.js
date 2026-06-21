const fs = require("fs");
const path = require("path");

/**
 * Shared Cypress configuration factory.
 *
 * Per-environment configs import this and inject only the environment-specific
 * URLs / credentials:
 *   - cypress.config.js        → "production" placeholder (https://sw.com)
 *   - cypress.local.config.js  → bundled demo app + mock API (used by CI & `npm test`)
 *
 * Keeping one factory means timeouts, reporter options, the grep plugin and the
 * Node-side tasks are defined exactly once.
 */
function buildConfig({ baseUrl, env: envOverrides }) {
  return {
    reporter: "cypress-mochawesome-reporter",
    reporterOptions: {
      reportDir: "mochawesome-report",
      charts: true,
      reportPageTitle: "ShopWise Automation — Test Report",
      embeddedScreenshots: true,
      inlineAssets: true,
      saveAllAttempts: false,
      overwrite: false,
      html: true,
      json: true,
    },
    viewportWidth: 1280,
    viewportHeight: 800,
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 30000,
    pageLoadTimeout: 60000,
    video: false,
    env: {
      // Environment-specific URLs/creds injected by the per-env config
      ...envOverrides,
      // grep flags (identical across environments)
      grepFilterSpecs: true,
      grepOmitFiltered: true,
    },
    e2e: {
      baseUrl,
      watchForFileChanges: false,
      retries: {
        runMode: 1,
        openMode: 0,
      },
      screenshotOnRunFailure: true,
      specPattern: "cypress/e2e/**/*.cy.js",
      setupNodeEvents(on, config) {
        require("cypress-mochawesome-reporter/plugin")(on);
        require("@bahmutov/cy-grep/src/plugin")(config);

        on("task", {
          // Append a line to a log file (used to demonstrate Node-side tasks).
          writeLog({ filePath, message }) {
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.appendFileSync(filePath, `[${new Date().toISOString()}] ${message}\n`, "utf8");
            return null;
          },
          // Return true if a file matching the pattern exists in a folder.
          checkFileExists({ folderPath, filePattern }) {
            try {
              if (!fs.existsSync(folderPath)) return null;
              const regex = new RegExp(`^${filePattern.replace(/\*/g, ".*")}$`);
              const match = fs.readdirSync(folderPath).find((file) => regex.test(file));
              return match ? path.join(folderPath, match) : null;
            } catch {
              return null;
            }
          },
        });

        return config;
      },
    },
  };
}

module.exports = { buildConfig };
