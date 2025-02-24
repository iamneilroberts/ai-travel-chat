import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals'),
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: [
      'plugin:@typescript-eslint/recommended',
      'plugin:react-hooks/recommended'
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off', // Temporarily disable until we can properly type everything
      '@typescript-eslint/no-unused-vars': ['error', {
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_',
      }],
      'react-hooks/exhaustive-deps': 'warn', // Downgrade to warning for now
      'no-var': 'error',
      'prefer-const': 'error'
    }
  },
  {
    // Less strict rules for test files
    files: ['**/*.test.ts', '**/*.test.tsx', '**/tests/**/*'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn'
    }
  },
  {
    // Special case for prismaClient.ts which needs var for global declaration
    files: ['**/prismaClient.ts'],
    rules: {
      'no-var': 'off'
    }
  }
];

export default eslintConfig;
