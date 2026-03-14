import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';

const config = [
  {
    ignores: ['**/.next/*', '**/node_modules/*', '**/out/*', '**/dist/*'],
  },
  ...nextCoreWebVitals,
  {
    name: 'prettier-overrides',
    rules: {
      ...eslintConfigPrettier.rules,
    },
  },
  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];

export default config;
