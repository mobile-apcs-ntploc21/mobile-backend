import { gql } from "apollo-server-express";

const gqlAPI = gql`
  extend type Query {
    deletedEmojis: [Emoji]
    availableAttachments: [MessageAttachment]
  }

  extend type Mutation {
    cleanupSubscriptions: [UserSubscription]
  }
`;

const API = [gqlAPI];
export default { API };
