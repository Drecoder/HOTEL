import { ApolloClient, InMemoryCache, createHttpLink, split } from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";

const httpLink = createHttpLink({
  uri: "http://localhost:8080/graphql", // your GraphQL gateway
});

const wsLink = new WebSocketLink({
  uri: "ws://localhost:8081/subscriptions",
  options: {
    reconnect: true,
  },
});

// Split based on operation type (query/mutation vs subscription)
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === "OperationDefinition" && definition.operation === "subscription";
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export default client;
