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

export const userStatusMutations = {
  UPDATE_USER_STATUS_TYPE: gql`
    mutation updateStatusType($user_id: ID!, $type: CustomStatus!) {
      updateStatusType(user_id: $user_id, type: $type) {
        user_id
        type
      }
    }
  `,
  UPDATE_USER_STATUS_TEXT: gql`
    mutation updateStatusText($user_id: ID!, $status_text: String!) {
      updateStatusText(user_id: $user_id, status_text: $status_text) {
        user_id
        status_text
      }
    }
  `,
};

export const serverMutations = {
  CREATE_SERVER: gql`
    mutation createServer($input: CreateServerInput!) {
      createServer(input: $input) {
        id
        owner
        name
        avatar_url
        banner_url
        totalMembers
        totalEmojis
      }
    }
  `,
  UPDATE_SERVER: gql`
    mutation updateServer($server_id: ID!, $input: UpdateServerInput!) {
      updateServer(server_id: $server_id, input: $input) {
        id
        owner
        name
        avatar_url
        banner_url
        totalMembers
        totalEmojis
      }
    }
  `,
  DELETE_SERVER: gql`
    mutation deleteServer($server_id: ID!) {
      deleteServer(server_id: $server_id)
    }
  `,

  TRANSFER_OWNERSHIP: gql`
    mutation transferOwnership($server_id: ID!, $user_id: ID!) {
      transferOwnership(server_id: $server_id, user_id: $user_id)
    }
  `,

  CREATE_INVITE_CODE: gql`
    mutation createInviteCode($server_id: ID!, $input: CreateInviteCodeInput!) {
      createInviteCode(server_id: $server_id, input: $input) {
        url
        expiredAt
        maxUses
        currentUses
      }
    }
  `,
  DELETE_INVITE_CODE: gql`
    mutation deleteInviteCode($server_id: ID!, $url: String!) {
      deleteInviteCode(server_id: $server_id, url: $url)
    }
  `,

  MOVE_SERVER: gql`
    mutation moveServer($user_id: ID!, $input: [MoveServerInput!]!) {
      moveServer(user_id: $user_id, input: $input)
    }
  `,

  SET_FAVORITE_SERVER: gql`
    mutation setFavoriteServer(
      $user_id: ID!
      $server_id: ID!
      $is_favorite: Boolean
    ) {
      setFavoriteServer(
        user_id: $user_id
        server_id: $server_id
        is_favorite: $is_favorite
      )
    }
  `,
};

export const serverMemberMutations = {
  JOIN_SERVER: gql`
    mutation JoinServer($url: String!, $user_id: ID!) {
      joinServer(url: $url, user_id: $user_id) {
        server_id
        user_id
      }
    }
  `,
  ADD_SERVER_MEMBERS: gql`
    mutation AddServerMembers($input: ServerMembersInput!) {
      addServerMembers(input: $input) {
        server_id
        user_id
      }
    }
  `,
  REMOVE_SERVER_MEMBERS: gql`
    mutation RemoveServerMembers($input: ServerMembersInput!) {
      removeServerMembers(input: $input)
    }
  `,
};

export const serverEmojiMutations = {
  CREATE_SERVER_EMOJI: gql`
    mutation createServerEmoji($input: CreateServerEmojiInput!) {
      createServerEmoji(input: $input) {
        id
        name
        image_url
        uploader_id
      }
    }
  `,
  UPDATE_SERVER_EMOJI: gql`
    mutation updateServerEmoji($emoji_id: ID!, $name: String!) {
      updateServerEmoji(emoji_id: $emoji_id, name: $name) {
        id
        name
        image_url
        uploader_id
      }
    }
  `,
  DELETE_SERVER_EMOJI: gql`
    mutation deleteServerEmoji($emoji_id: ID!) {
      deleteServerEmoji(emoji_id: $emoji_id)
    }
  `,
};

export const serverRoleMutations = {
  CREATE_SERVER_ROLE: gql`
    mutation createServerRole($server_id: ID!, $input: CreateServerRoleInput!) {
      createServerRole(server_id: $server_id, input: $input) {
        id
        server_id
        name
        color
        allow_anyone_mention
        position
        permissions
        is_admin
        default
        last_modified
        number_of_users
      }
    }
  `,
  UPDATE_SERVER_ROLE: gql`
    mutation updateServerRole($role_id: ID!, $input: UpdateServerRoleInput!) {
      updateServerRole(role_id: $role_id, input: $input) {
        id
        server_id
        name
        color
        allow_anyone_mention
        position
        permissions
        is_admin
        default
        last_modified
        number_of_users
      }
    }
  `,
  UPDATE_DEFAULT_SERVER_ROLE: gql`
    mutation updateDefaultServerRole(
      $server_id: ID!
      $input: UpdateServerRoleInput!
    ) {
      updateDefaultServerRole(server_id: $server_id, input: $input) {
        id
        server_id
        name
        color
        allow_anyone_mention
        position
        permissions
        is_admin
        default
        last_modified
        number_of_users
      }
    }
  `,
  DELETE_SERVER_ROLE: gql`
    mutation deleteServerRole($role_id: ID!) {
      deleteServerRole(role_id: $role_id) {
        id
        server_id
        name
        color
        allow_anyone_mention
        position
        permissions
        is_admin
        default
        last_modified
        number_of_users
      }
    }
  `,

  ADD_USER_TO_ROLE: gql`
    mutation addUserToRole($role_id: ID!, $user_id: ID!) {
      addUserToRole(role_id: $role_id, user_id: $user_id) {
        id
        username
        display_name
        avatar_url
        banner_url
        about_me
      }
    }
  `,

  REMOVE_USER_FROM_ROLE: gql`
    mutation removeUserFromRole($role_id: ID!, $user_id: ID!) {
      removeUserFromRole(role_id: $role_id, user_id: $user_id) {
        id
        username
        display_name
        avatar_url
        banner_url
        about_me
      }
    }
  `,
};
