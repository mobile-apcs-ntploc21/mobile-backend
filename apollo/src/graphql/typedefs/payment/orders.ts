import { gql } from "apollo-server-express";

const typeDefs = gql`
  type Order {
    id: ID!
    user_id: ID!
    package_id: ID!

    amount: Int!
    status: String!
    transaction_id: String!

    createdAt: String!
  }
`;

const gqlAPI = gql`
  extend type Query {
    orders: [Order]
    order(id: ID!): Order
    ordersByUser(user_id: ID!): [Order]
    orderByTransaction(transaction_id: String!): Order
  }

  extend type Mutation {
    createOrder(
      user_id: ID!
      package_id: ID!
      amount: Int!
      status: String!
      transaction_id: String!
    ): Order!
    updateOrder(
      id: ID!
      amount: Int
      status: String
      transaction_id: String
    ): Order!
    updateOrderStatus(id: ID!, status: String!): Order!
    deleteOrder(id: ID!): Boolean!
  }
`;

const API = [typeDefs, gqlAPI];

export default { API };
