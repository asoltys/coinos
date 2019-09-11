module.exports = {
  root: true,
  env: {
    node: true,
  },
  globals: {
    cordova: true,
  },
  extends: ['plugin:vue/essential', '@vue/prettier'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'vuetify/no-deprecated-classes': 'error',
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
  plugins: ['graphql', 'vuetify'],
};
