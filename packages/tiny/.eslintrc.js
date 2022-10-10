module.exports = {
  parser: '@typescript-eslint/parser',

  plugins: ['@typescript-eslint'],

  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
    '@typescript-eslint/no-unused-vars': [
      'off',
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
