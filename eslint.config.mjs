import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({ baseDirectory: __dirname })

const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'next-env.d.ts',
      // Pre-migration static site, kept until the cleanup list is confirmed.
      '*.html',
      'script.js',
      'scripts/**',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
  {
    rules: {
      // Practice content is medical: an unescaped entity is a copy bug, not a style nit.
      'react/no-unescaped-entities': 'error',
    },
  },
]

export default eslintConfig
