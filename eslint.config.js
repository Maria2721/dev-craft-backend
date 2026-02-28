const js = require('@eslint/js');
const globals = require('globals');
const tseslint = require('typescript-eslint');
const simpleImportSort = require('eslint-plugin-simple-import-sort');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = [
  { ignores: ['dist', 'node_modules', 'eslint.config.js', 'jest.config.js'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.node,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
];
