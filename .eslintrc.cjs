/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  root: true,
  extends: [
    'plugin:vue/essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript/recommended',
    '@vue/eslint-config-prettier',
  ],
  plugins: ['import'],
  rules: {
    'prettier/prettier': 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': 'warn',
    'import/extensions': [
      'warn',
      'always',
      {
        js: 'never',
        vue: 'never',
      },
    ],
    'space-before-function-paren': 0,
    'object-curly-newline': 'off',
    'global-require': 0,
    'linebreak-style': 'off',
    'func-names': ['error', 'never'],
    'no-plusplus': 'off',
    'no-prototype-builtins': 'off',
    'no-param-reassign': 'off',
    'no-underscore-dangle': 'off',
    'no-alert': 'error',
    radix: ['error', 'as-needed'],
    'no-nested-ternary': 'off',
    'no-use-before-define': ['error', { functions: false, classes: true }],
    'no-unused-expressions': ['error', { allowShortCircuit: true }],
    'no-restricted-globals': 'off',
    'vuejs-accessibility/form-control-has-label': 'off',
    'vuejs-accessibility/click-events-have-key-events': 'off',
    'vuejs-accessibility/media-has-caption': 'off',
    'no-bitwise': 'off',
    'default-param-last': 'off',
    'import/no-cycle': 'off',
  },
};
