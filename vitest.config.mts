import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const root = fileURLToPath(new URL('.', import.meta.url))

/**
 * `.mts` rather than `.ts` because Vite's native config loader reads a `.ts`
 * config as CommonJS in a package with no `"type": "module"`, and warns on
 * every run about the ESM syntax in it.
 *
 * Unit tests: the Zod schemas, the Server Actions, encryption, and the
 * formatting helpers those three share.
 *
 * Node environment, not jsdom. Everything under test here runs on the server;
 * the browser-side behaviour is covered by Playwright, against a real browser,
 * rather than by a simulated DOM.
 */
export default defineConfig({
  resolve: {
    alias: {
      // Matches tsconfig's `@/*` -> `./*`.
      '@': root.replace(/\/$/, ''),
      // See tests/stubs/server-only.ts.
      'server-only': `${root}tests/stubs/server-only.ts`,
    },
  },
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    restoreMocks: true,
    unstubEnvs: true,
  },
})
