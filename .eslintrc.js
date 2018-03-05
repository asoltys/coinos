module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
  },
  plugins: [
    'html',
  ],
  globals: {
    'Clipboard': true,
    'cordova': true,
    'hce': true,
    'nfc': true
  },
  settings: {
    // if you have .vue active for eslint-html-plugin settings
    // linting will not progress through all subdirectories
    // it conflicts with eslint-plugin-vue (latest v3.5.0)
    // it will stop at the main entry point.
    "html/html-extensions": [".html", /* ".vue" */],  // consider .html files as XML
    "html/report-bad-indent": "error",
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/recommended' // or 'plugin:vue/base'
  ],
  parserOptions: {
    parser: "babel-eslint",
    sourceType: 'module'
  },
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
    'no-unused-vars': ['warn'],
    'no-console': 0,
    'no-debugger': 0,
    'generator-star-spacing': 0,
    'vue/order-in-components': [2, {
      order: [
        ['name', 'delimiters', 'functional', 'model'],
        ['components', 'directives', 'filters'],
        ['parent', 'mixins', 'extends', 'provide', 'inject'],
        'el',
        'template',
        'props',
        'propsData',
        'data',
        'computed',
        'watch',
        'lifecycle_hooks',
        'methods',
        'render',
        'renderError'
      ]
    }] // END order
  },
};
