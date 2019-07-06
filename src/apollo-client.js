import Vue from 'vue';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { setContext } from 'apollo-link-context';
import VueApollo from 'vue-apollo';

const httpLink = new HttpLink({
  uri: process.env.VUE_APP_GRAPHQL,
  credentials: 'same-origin',
});

const authLink = setContext((_, { headers }) => {
  const token = sessionStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const dataIdFromObject = o => {
  if (o.id) {
    return o.id;
  }
};

const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    dataIdFromObject,
    cacheRedirects: {},
  }),
  connectToDevTools: true,
});

Vue.use(VueApollo);

export default apolloClient;
