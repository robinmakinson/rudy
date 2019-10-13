const path = require('path')
const {
  configs: {
    recommended: { env, ...jestConfig },
  },
  environments: {
    globals: { globals: jestGlobals },
  },
} = require('eslint-plugin-jest')

module.exports = {
  extends: [
    'eslint-config-airbnb',
    'plugin:prettier/recommended',
    'prettier/react',
  ],
  overrides: [
    {
      files: ['*.tsx', '*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
      },
      extends: [
        'plugin:@typescript-eslint/recommended',
        'prettier/@typescript-eslint',
      ],
      rules: {
        '@typescript-eslint/explicit-function-return-type': [
          'error',
          {
            allowExpressions: true,
          },
        ],
      },
    },
    {
      files: ['*.jsx', '**/*.js'],
      parser: 'babel-eslint',
      extends: ['plugin:flowtype/recommended', 'prettier/flowtype'],
    },
    {
      files: ['*.test.js', '*.test.jsx', '*.test.ts', '*.test.tsx'],
      ...jestConfig,
      globals: jestGlobals,
    },
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
      },
      webpack: {
        config: {
          resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx'],
            mainFields: ['rudy-src-main'],
          },
        },
      },
    },
    'import/extensions': ['.ts', '.tsx', '.js', '.jsx'],
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
      'babel-eslint': ['.js', '.jsx'],
    },
  },
  rules: {
    'prettier/prettier': 'warn',
    'no-use-before-define': [
      'error',
      { functions: false, classes: false, variables: false },
    ],
    'no-underscore-dangle': 0,
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'no-nested-ternary': 0,
    'import/no-extraneous-dependencies': [
      2,
      {
        devDependencies: ['config/**', 'lint-staged.config.js'],
      },
    ],
    'import/no-unresolved': [
      'error',
      {
        ignore: ['./buildClient/stats.json$', './buildServer/h$'],
      },
    ],
  },
}
