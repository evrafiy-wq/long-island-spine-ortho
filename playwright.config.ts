import { defineConfig, devices } from '@playwright/test'

/**
 * End-to-end tests for the appointment flow.
 *
 * RUNS AGAINST `next dev`, NOT A PRODUCTION BUILD, and that is a deliberate
 * safety property rather than a convenience. The suite needs `E2E_TEST_MODE=1`
 * to swap Postgres and Resend for in-process doubles, and lib/env.ts honours
 * that flag only when `NODE_ENV !== 'production'`. `next build` sets
 * NODE_ENV=production, so a production bundle physically cannot resolve the
 * doubles — which is what stops an environment variable ever turning a live
 * medical form into a black hole. The cost is a slower first page load.
 *
 * Port 3100 so it never collides with a `npm run dev` already on 3000.
 *
 * Each `describe` sets its own `x-forwarded-for`. The forms are rate limited
 * per IP, and without distinct addresses the suite would exhaust one bucket
 * partway through and start failing on submissions that are perfectly valid.
 */
const PORT = 3100
const BASE_URL = `http://127.0.0.1:${PORT}`

export default defineConfig({
  testDir: './tests/e2e',
  // Serial: the in-process store and the rate limiter are shared module state
  // in a single dev server. Parallel workers would race on both.
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  timeout: 30_000,

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    /**
     * `prefers-reduced-motion: reduce`, which app/styles/reset.css answers by
     * forcing `scroll-behavior: auto`.
     *
     * Without it the suite is flaky in a way that is entirely the test
     * harness's fault: Playwright scrolls an element into view before clicking
     * it, the site's smooth scrolling starts animating, Playwright sees the
     * box move and waits for it to settle, then scrolls again on the next
     * retry — and the click never lands. Nothing about the site is broken.
     *
     * It also means every assertion here runs through the reduced-motion path,
     * which is the one an accessibility-conscious visitor gets.
     */
    reducedMotion: 'reduce',
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  webServer: {
    command: `npx next dev --port ${PORT}`,
    url: `${BASE_URL}/visit`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      E2E_TEST_MODE: '1',
      NEXT_PUBLIC_SITE_URL: BASE_URL,
      // Left unset on purpose: with no Turnstile keys the widget does not
      // render and the server reports `skipped`, which is the configuration
      // the tests are written against.
    },
  },
})
