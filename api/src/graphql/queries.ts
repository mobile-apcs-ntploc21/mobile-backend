import { gql } from "graphql-request";

export const GET_USER_BY_ID = gql`
  query getUserById($id: ID!) {
    getUserById(id: $id) {
      id
      username
      email
      phone_number
      token
    }
  }
`;

export const GET_USER_BY_EMAIL = gql`
  query getUserByEmail($email: String!) {
    getUserByEmail(email: $email) {
      id
      username
      email
      phone_number
      token
    }
  }
`;

export const GET_USER_BY_USERNAME = gql`
  query getUserByUsername($username: String!) {
    getUserByUsername(username: $username) {
      id
      username
      email
      phone_number
      token
    }
  }
`;

export const LOGIN_USER = gql`
  query loginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      id
      username
      email
      phone_number
    }
  }
`;

export const GET_RELATIONSHIP_TYPE = gql`
  query getRelationshipType($user_first_id: ID!, $user_second_id: ID!) {
    getRelationshipType(user_first_id: $user_first_id, user_second_id: $user_second_id)
  }
`;

export const GET_ALL_FRIENDS = gql`
  query getAllFriends($user_id: ID!) {
    getAllFriends(user_id: $user_id) {
      id
      username
    }
  }
`;

export const GET_RECEIVED_FRIEND_REQUESTS = gql`
  query getReceivedFriendRequests($user_id: ID!) {
    getReceivedFriendRequests(user_id: $user_id) {
      id
      username
    }
  }
`;

export const GET_SENT_FRIEND_REQUESTS = gql`
  query getSentFriendRequests($user_id: ID!) {
    getSentFriendRequests(user_id: $user_id) {
      id
      username
    }
  }
`;

export const GET_BLOCKED_USERS = gql`
  query getBlockedUsers($user_id: ID!) {
    getBlockedUsers(user_id: $user_id) {
      id
      username
    }
  }
`;