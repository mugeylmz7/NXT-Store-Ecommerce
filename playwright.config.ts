import { defineConfig, devices } from '@playwright/test';

import dotenv from "dotenv";
import path from "node:path";


dotenv.config({ path: path.resolve(__dirname, ".env.local") });
dotenv.config({ path: path.resolve(__dirname, ".env") });

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },


    /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000, // 2 minutes
  },

  /* Configure projects for major browsers */
  projects: [
    // 1. Admin Girişi Setup'ı
    {
      name: "setup-admin",
      testDir: "./e2e/setup",
      testMatch: /auth\.setup\.ts/,
      timeout: 60_000,
    },
    // 2. Standart Kullanıcı Girişi Setup'ı
    {
      name: "setup-user",
      testDir: "./e2e/setup",
      testMatch: /user\.auth\.setup\.ts/,
      timeout: 60_000,
    },
    // Admin Testleri (Yalnızca Admin Oturumuyla)
    {
      name: "chromium-logged-in-admin",
      testDir: "./e2e/logged-in-admin",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/admin.json",
      },
      dependencies: ["setup-admin"],
    },

    // Kullanıcı Testleri (Yalnızca Kullanıcı Oturumuyla)
    {
      name: "chromium-logged-in-user",
      testDir: "./e2e/logged-in-user",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/user.json",
      },
      dependencies: ["setup-user"],
    },

    // Giriş Yapmamış (Anonim) Kullanıcı Testleri
    {
      name: "chromium-logged-out",
      testDir: "./e2e/logged-out",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

});
