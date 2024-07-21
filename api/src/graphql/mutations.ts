import { gql } from "graphql-request";

// Create user
export const CREATE_USER = gql`
  mutation createUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      username
      email
      phone_number
      created_at
      last_modified
    }
  }
`;

// Update refreshToken
export const UPDATE_REFRESH_TOKEN = gql`
  mutation updateRefreshToken($input: UpdateRefreshTokenInput!) {
    updateRefreshToken(input: $input) {
      id
      email
      token
    }
  }
`;

export const settingsMutations = {
  CREATE_USER_SETTINGS: gql`
    mutation createUserSettings($input: CreateUserSettingsInput!) {
      createUserSettings(input: $input) {
        settings
      }
    }
  `,
  UPDATE_USER_SETTINGS: gql`
    mutation updateUserSettings($input: UpdateUserSettingsInput!) {
      updateUserSettings(input: $input) {
        settings
      }
    }
  `,
  DELETE_USER_SETTINGS: gql`
    mutation deleteUserSettings($user_id: ID!) {
      deleteUserSettings(user_id: $user_id) {
        settings
      }
    }
  `,
  RESTORE_USER_SETTINGS: gql`
    mutation restoreUserSettings($user_id: ID!) {
      restoreUserSettings(user_id: $user_id) {
        settings
      }
    }
  `,
};

export const CREATE_RELATIONSHIP = gql`
  mutation createRelationship(
    $user_first_id: ID!
    $user_second_id: ID!
    $type: RelationshipType!
  ) {
    createRelationship(
      user_first_id: $user_first_id
      user_second_id: $user_second_id
      type: $type
    ) {
      _id {
        user_first_id
        user_second_id
      }
      type
      created_at
      last_modified
    }
  }
`;

export const UPDATE_RELATIONSHIP = gql`
  mutation updateRelationship(
    $user_first_id: ID!
    $user_second_id: ID!
    $type: RelationshipType!
  ) {
    updateRelationship(
      user_first_id: $user_first_id
      user_second_id: $user_second_id
      type: $type
    ) {
      _id {
        user_first_id
        user_second_id
      }
      type
      created_at
      last_modified
    }
  }
`;

export const DELETE_RELATIONSHIP = gql`
  mutation deleteRelationship($user_first_id: ID!, $user_second_id: ID!) {
    deleteRelationship(
      user_first_id: $user_first_id
      user_second_id: $user_second_id
    ) {
      _id {
        user_first_id
        user_second_id
      }
      type
      created_at
      last_modified
    }
  }
`;

export const userProfileMutation = {
  CREATE_USER_PROFILE: gql`
    mutation createUserProfile($input: UserProfileInput!) {
      createUserProfile(input: $input) {
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
  UPDATE_USER_PROFILE: gql`
    mutation updateUserProfile($input: UserProfileInput!) {
      updateUserProfile(input: $input) {
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
  DELETE_USER_PROFILE: gql`
    mutation deleteUserProfile($user_id: ID!, $server_id: ID!) {
      deleteUserProfile(user_id: $user_id, server_id: $server_id) {
        user_id
        server_id
      }
    }
  `,
};
