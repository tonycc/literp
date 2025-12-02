import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['dist', 'vitest.config.ts'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: new URL('.', import.meta.url).pathname,
        allowDefaultProject: true,
      },
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true }],
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXOpeningElement[name.name='ProTable']:not([typeArguments])",
          message: 'ProTable 必须声明泛型，如 <ProTable<MyRow> />',
        },
        {
          selector: "JSXOpeningElement[name.name='ProForm']:not([typeArguments])",
          message: 'ProForm 必须声明泛型，如 <ProForm<MyFormValues> />',
        }
      ],
    },
  },
)
