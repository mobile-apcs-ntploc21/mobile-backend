import { gql } from "graphql-request";

export const GET_USER_BY_ID = gql`
  query getUserById($id: ID!) {
    getUserById(id: $id) {
      id
      username
      email
      phone_number
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

export const LOGOUT_USER = gql`
  query logoutUser($refresh_token: String!, $user_id: ID!) {
    logoutUser(refresh_token: $refresh_token, id: $user_id)
  }
`;

export const settingsQueries = {
  GET_USER_SETTINGS: gql`
    query getUserSettings($user_id: ID!) {
      getUserSettings(user_id: $user_id) {
        settings
      }
    }
  `,
};

export const GET_RELATIONSHIP_TYPE = gql`
  query getRelationshipType($user_first_id: ID!, $user_second_id: ID!) {
    getRelationshipType(
      user_first_id: $user_first_id
      user_second_id: $user_second_id
    )
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

export const userProfileQueries = {
  GET_USER_PROFILE: gql`
    query getUserProfile($user_id: ID!, $server_id: ID) {
      getUserProfile(user_id: $user_id, server_id: $server_id) {
        user_id
        server_id
        display_name
        username
        about_me
        avatar_url
        banner_url
      }
    }
  `,

  GET_USER_PROFILE_BY_USERNAME: gql`
    query getUserProfileByUsername($username: String!) {
      getUserProfileByUsername(username: $username) {
        user_id
        server_id
        display_name
        username
        about_me
        avatar_url
        banner_url
      }
    }
  `,
};

export const GET_USER_STATUS = gql`
  query getUserStatus($user_id: ID!) {
    getUserStatus(user_id: $user_id) {
      user_id
      type
      last_seen
      status_text
      is_online
    }
  }
`;

export const GET_MULTIPLE_USER_STATUS = gql`
  query getMultipleUserStatus($user_ids: [ID!]!) {
    getMultipleUserStatus(user_ids: $user_ids) {
      user_id
      type
      last_seen
      status_text
      is_online
    }
  }
`;

export const serverQueries = {
  GET_SERVER_BY_ID: gql`
    query server($server_id: ID!) {
      server(server_id: $server_id) {
        id
        name
        avatar_url
        banner_url
        totalMembers
        totalEmojis
      }
    }
  `,
  GET_SERVERS_BY_USER_ID: gql`
    query servers($user_id: ID!) {
      servers(user_id: $user_id) {
        id
        name
        avatar_url
        banner_url
        totalMembers
        totalEmojis
      }
    }
  `,
  GET_INVITE_CODE: gql`
    query getInviteCode($server_id: ID!) {
      getInviteCode(server_id: $server_id) {
        url
        expiredAt
        maxUses
        currentUses
      }
    }
  `,
};
