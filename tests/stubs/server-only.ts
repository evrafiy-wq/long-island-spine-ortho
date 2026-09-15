/**
 * Stand-in for the `server-only` package under Vitest.
 *
 * The real package exports a module that throws unless it is resolved through
 * the `react-server` export condition, which only Next's bundler sets. Vitest
 * runs plain Node, so importing any module that guards itself with it —
 * lib/crypto/field.ts, lib/env.ts, the Server Actions — would fail at import
 * time. Aliased in vitest.config.ts.
 *
 * This weakens nothing: the guard exists to stop server code reaching a
 * browser bundle, and Vitest is not a browser bundle.
 */
export {}
