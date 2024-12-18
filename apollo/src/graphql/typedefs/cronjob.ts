import { gql } from "apollo-server-express";

const gqlAPI = gql`
  extend type Query {
    deletedEmojis: [Emoji]
    availableAttachments: [MessageAttachment]
  }
`;

const API = [gqlAPI];
export default { API };
