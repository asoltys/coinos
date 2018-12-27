var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  GRAPHQL: '"/graphql"',
  BASEURL: '"/api"',
  SOCKETIO: 'null',
  PORT: 8085,
  FACEBOOK: "'290368338058652'",
  STRIPE: '"pk_test_hGki6lIOnbfnRDnKNoeZxlxA"',
})
