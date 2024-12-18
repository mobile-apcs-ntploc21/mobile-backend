import { gql } from "apollo-server-express";

const gqlTypes = gql`
  enum LogType {
    authorize
    IPN
    redirect
  }

  type PaymentLog {
    id: ID!
    user_id: ID!
    order_id: ID!

    request: String
    response: String
    transaction_id: String!

    log_type: LogType!
    data: JSON
  }
`;

const gqlAPI = gql`
  extend type Query {
    paymentLog(log_id: ID!): PaymentLog
    paymentLogs(user_id: ID!): [PaymentLog]
  }

  extend type Mutation {
    createPaymentLog(
      user_id: ID!
      order_id: ID!
      request: String
      response: String
      transaction_id: String!
      log_type: LogType!
      data: JSON
    ): PaymentLog!
  }
`;

const API = [gqlTypes, gqlAPI];

export default { API };
