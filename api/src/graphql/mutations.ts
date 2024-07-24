import { gql } from 'graphql-request';

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
    mutation deleteUserSettings($userId: ID!) {
      deleteUserSettings(userId: $userId) {
        settings
      }
    }
  `,
  RESTORE_USER_SETTINGS: gql`
    mutation restoreUserSettings($userId: ID!) {
      restoreUserSettings(userId: $userId) {
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

export const UPDATE_USER_STATUS_TYPE = gql`
  mutation updateStatusType($user_id: ID!, $type: CustomStatus!) {
    updateStatusType(user_id: $user_id, type: $type) {
      user_id
      type
    }
  }
`;

export const UPDATE_USER_STATUS_TEXT = gql`
  mutation updateStatusText($user_id: ID!, $status_text: String!) {
    updateStatusText(user_id: $user_id, status_text: $status_text) {
      user_id
      status_text
    }
  }
`;
