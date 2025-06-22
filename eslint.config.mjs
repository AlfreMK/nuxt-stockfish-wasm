import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Your custom configs here
  {
    rules: {
      '@stylistic/eol-last': ['error', 'always'],
      'no-console': ['error', { allow: ['error'] }],
    },
  },
).overrides({
  'nuxt/typescript/rules': {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['error', {
        args: 'all',
        argsIgnorePattern: '^_',
        caughtErrors: 'all',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      }],
    },
  },
  'nuxt/vue/rules': {
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/block-order': ['error', {
        order: ['script[setup]', 'template', 'style'],
      }],
    },
  },
})
