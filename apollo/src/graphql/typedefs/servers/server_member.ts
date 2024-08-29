import { gql } from 'apollo-server-express';

const gqlTypes = gql`
  type ServerMember {
    server_id: ID!
    user_id: ID!
  }
`;

const gqlAPI = gql`
  input ServerMembersInput {
    server_id: ID!
    user_ids: [ID!]!
  }

  extend type Query {
    getServerMembers(server_id: ID!): [ServerMember]
    checkServerMember(server_id: ID!, user_id: ID!): Boolean
  }

  extend type Mutation {
    joinServer(url: String!, user_id: ID!): ServerMember
    addServerMembers(input: ServerMembersInput!): [ServerMember]
    removeServerMembers(input: ServerMembersInput!): Boolean
  }
`;

export default { API: [gqlTypes, gqlAPI] };
