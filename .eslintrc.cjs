module.exports = {
  root: true,
  env: { 
    browser: true, 
    es2020: true, 
    node: true 
  },
  extends: [
    'eslint:recommended'
  ],
  ignorePatterns: [
    'dist',
    'coverage',
    'node_modules', 
    'test-results',
    'playwright-report',
    '.eslintrc.cjs',
    '*.config.js',
    '*.config.ts'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react-refresh', '@typescript-eslint'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true, allowExportNames: ['useDataPrism'] },
    ],
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_' }
    ],
    'prefer-const': 'error',
    'no-var': 'error',
    'no-console': 'warn',
    'no-undef': 'off' // Disable because TypeScript handles this
  },
  overrides: [
    {
      files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/test-setup.ts'],
      env: { jest: true },
      rules: {
        'no-console': 'off',
      }
    }
  ]
};