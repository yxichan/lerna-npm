module.exports = {
  parser: '@typescript-eslint/parser',

  plugins: ['@typescript-eslint'],

  rules: {
    'no-unused-vars': 'error',
    '@typescript-eslint/no-unused-expressions': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }
    ]
  }
}
