import Vue from 'vue'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import VueApollo from 'vue-apollo'

const httpLink = new HttpLink(
  { 
    uri: process.env.GRAPHQL,
    credentials: 'same-origin',
  }
)

const dataIdFromObject = o => {
  if (o.id) { return o.id }
}

const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    dataIdFromObject,
    cacheResolvers: {},
  }),
  connectToDevTools: true,
})

Vue.use(VueApollo)

export default apolloClient
