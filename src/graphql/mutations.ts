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
      removeServerMembers(input: $input) {
        server_id
        user_id
      }
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

// Channels (and its Permission) Mutation
export const channelMutations = {
  // Channels
  CREATE_CHANNEL: gql`
    mutation createChannel($server_id: ID!, $input: createChannelInput!) {
      createChannel(server_id: $server_id, input: $input) {
        id
        server_id
        conversation_id
        category_id
        name
        description
        last_message_id
        position
        is_nsfw
        is_archived
        is_deleted
      }
    }
  `,
  UPDATE_CHANNEL: gql`
    mutation updateChannel($channel_id: ID!, $input: updateChannelInput!) {
      updateChannel(channel_id: $channel_id, input: $input) {
        id
        server_id
        conversation_id
        category_id

        name
        description
        last_message_id
        position

        is_nsfw
        is_archived
        is_deleted
      }
    }
  `,
  DELETE_CHANNEL: gql`
    mutation deleteChannel($channel_id: ID!) {
      deleteChannel(channel_id: $channel_id)
    }
  `,
  HARD_DELETE_CHANNEL: gql`
    mutation hardDeleteChannel($channel_id: ID!) {
      hardDeleteChannel(channel_id: $channel_id)
    }
  `,

  MOVE_CHANNEL: gql`
    mutation moveChannel(
      $channel_id: ID!
      $category_id: ID
      $new_position: Int
    ) {
      moveChannel(
        channel_id: $channel_id
        category_id: $category_id
        new_position: $new_position
      ) {
        id
        server_id
        conversation_id
        category_id

        name
        description
        last_message_id
        position

        is_nsfw
        is_archived
        is_deleted
      }
    }
  `,

  MOVE_ALL_CHANNEL: gql`
    mutation moveAllChannel($server_id: ID!, $input: [moveChannelInput!]!) {
      moveAllChannel(server_id: $server_id, input: $input) {
        id
        server_id
        conversation_id
        category_id

        name
        description
        last_message_id
        position

        is_nsfw
        is_archived
        is_deleted
      }
    }
  `,
};

export const categoryMutations = {
  CREATE_CATEGORY: gql`
    mutation createCategory($server_id: ID!, $input: createCategoryInput!) {
      createCategory(server_id: $server_id, input: $input) {
        id
        server_id
        name
        position
      }
    }
  `,
  UPDATE_CATEGORY: gql`
    mutation updateCategory($category_id: ID!, $input: updateCategoryInput!) {
      updateCategory(category_id: $category_id, input: $input) {
        id
        server_id
        name
        position
      }
    }
  `,
  DELETE_CATEGORY: gql`
    mutation deleteCategory($category_id: ID!) {
      deleteCategory(category_id: $category_id)
    }
  `,

  MOVE_CATEGORY: gql`
    mutation moveCategory($category_id: ID!, $new_position: Int!) {
      moveCategory(category_id: $category_id, new_position: $new_position) {
        id
        server_id
        name
        position
      }
    }
  `,

  MOVE_ALL_CATEGORY: gql`
    mutation moveAllCategory(
      $server_id: ID!
      $input: [moveAllCategoryInput!]!
    ) {
      moveAllCategory(server_id: $server_id, input: $input) {
        id
        server_id
        name
        position
      }
    }
  `,
};

export const serverBansMutations = {
  CREATE_SERVER_BAN: gql`
    mutation createServerBan($server_id: ID!, $user_id: ID!) {
      createServerBan(server_id: $server_id, user_id: $user_id) {
        server_id
        user_id
      }
    }
  `,
  CREATE_SERVER_BULK_BAN: gql`
    mutation createServerBulkBan($server_id: ID!, $user_ids: [ID]!) {
      createServerBulkBan(server_id: $server_id, user_ids: $user_ids) {
        server_id
        user_id
      }
    }
  `,
  DELETE_SERVER_BAN: gql`
    mutation deleteServerBan($server_id: ID!, $user_id: ID!) {
      deleteServerBan(server_id: $server_id, user_id: $user_id)
    }
  `,
  CREATE_SERVER_KICK: gql`
    mutation createServerKick($server_id: ID!, $user_id: ID!) {
      createServerKick(server_id: $server_id, user_id: $user_id)
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

export const serverCategoryPermissionMutations = {
  CREATE_CATEGORY_ROLE_PERMISSION: gql`
    mutation createCategoryRolePermission(
      $role_id: ID!
      $category_id: ID!
      $permissions: String!
    ) {
      createCategoryRolePermission(
        role_id: $role_id
        category_id: $category_id
        permissions: $permissions
      ) {
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
  CREATE_CATEGORY_USER_PERMISSION: gql`
    mutation createCategoryUserPermission(
      $user_id: ID!
      $category_id: ID!
      $permissions: String!
    ) {
      createCategoryUserPermission(
        user_id: $user_id
        category_id: $category_id
        permissions: $permissions
      ) {
        id
        username
        display_name
        avatar_url
        banner_url
        about_me
        permissions
      }
    }
  `,
  UPDATE_CATEGORY_ROLE_PERMISSION: gql`
    mutation updateCategoryRolePermission(
      $role_id: ID!
      $category_id: ID!
      $permissions: String!
    ) {
      updateCategoryRolePermission(
        role_id: $role_id
        category_id: $category_id
        permissions: $permissions
      ) {
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
  UPDATE_CATEGORY_USER_PERMISSION: gql`
    mutation updateCategoryUserPermission(
      $user_id: ID!
      $category_id: ID!
      $permissions: String!
    ) {
      updateCategoryUserPermission(
        user_id: $user_id
        category_id: $category_id
        permissions: $permissions
      ) {
        id
        username
        display_name
        avatar_url
        banner_url
        about_me
        permissions
      }
    }
  `,
  DELETE_CATEGORY_ROLE_PERMISSION: gql`
    mutation deleteCategoryRolePermission($role_id: ID!, $category_id: ID!) {
      deleteCategoryRolePermission(
        role_id: $role_id
        category_id: $category_id
      ) {
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
  DELETE_CATEGORY_USER_PERMISSION: gql`
    mutation deleteCategoryUserPermission($user_id: ID!, $category_id: ID!) {
      deleteCategoryUserPermission(
        user_id: $user_id
        category_id: $category_id
      ) {
        id
        username
        display_name
        avatar_url
        banner_url
        about_me
        permissions
      }
    }
  `,
};

export const serverChannelPermissionMutations = {
  CREATE_CHANNEL_ROLE_PERMISSION: gql`
    mutation createChannelRolePermission(
      $role_id: ID!
      $channel_id: ID!
      $permissions: String!
    ) {
      createChannelRolePermission(
        role_id: $role_id
        channel_id: $channel_id
        permissions: $permissions
      ) {
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
  CREATE_CHANNEL_USER_PERMISSION: gql`
    mutation createChannelUserPermission(
      $user_id: ID!
      $channel_id: ID!
      $permissions: String!
    ) {
      createChannelUserPermission(
        user_id: $user_id
        channel_id: $channel_id
        permissions: $permissions
      ) {
        id
        username
        display_name
        avatar_url
        banner_url
        about_me
        permissions
      }
    }
  `,
  UPDATE_CHANNEL_ROLE_PERMISSION: gql`
    mutation updateChannelRolePermission(
      $role_id: ID!
      $channel_id: ID!
      $permissions: String!
    ) {
      updateChannelRolePermission(
        role_id: $role_id
        channel_id: $channel_id
        permissions: $permissions
      ) {
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
  UPDATE_CHANNEL_USER_PERMISSION: gql`
    mutation updateChannelUserPermission(
      $user_id: ID!
      $channel_id: ID!
      $permissions: String!
    ) {
      updateChannelUserPermission(
        user_id: $user_id
        channel_id: $channel_id
        permissions: $permissions
      ) {
        id
        username
        display_name
        avatar_url
        banner_url
        about_me
        permissions
      }
    }
  `,
  DELETE_CHANNEL_ROLE_PERMISSION: gql`
    mutation deleteChannelRolePermission($role_id: ID!, $channel_id: ID!) {
      deleteChannelRolePermission(role_id: $role_id, channel_id: $channel_id) {
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
  DELETE_CHANNEL_USER_PERMISSION: gql`
    mutation deleteChannelUserPermission($user_id: ID!, $channel_id: ID!) {
      deleteChannelUserPermission(user_id: $user_id, channel_id: $channel_id) {
        id
        username
        display_name
        avatar_url
        banner_url
        about_me
        permissions
      }
    }
  `,
};

export const messageMutations = {
  CREATE_MESSAGE: gql`
    mutation createMessage($conversation_id: ID!, $input: AddMessageInput!) {
      createMessage(conversation_id: $conversation_id, input: $input) {
        id
        conversation_id
        sender_id
        author {
          user_id
          username
          display_name
          avatar_url
        }

        content
        replied_message_id
        forwarded_message_id
        mention_users
        mention_roles
        mention_channels
        emojis

        replied_message {
          id
          sender_id
          content
          is_deleted
        }

        reactions {
          emoji_id
          count
          reactors
        }

        is_deleted
        is_pinned
        createdAt
      }
    }
  `,
  UPDATE_MESSAGE: gql`
    mutation editMessage($message_id: ID!, $input: EditMessageInput!) {
      editMessage(message_id: $message_id, input: $input) {
        id
        conversation_id
        sender_id
        author {
          user_id
          username
          display_name
          avatar_url
        }

        content
        replied_message_id
        forwarded_message_id

        mention_users
        mention_roles
        mention_channels
        emojis

        replied_message {
          id
          sender_id
          content
          is_deleted
        }

        reactions {
          emoji_id
          count
          reactors
        }

        is_modified
      }
    }
  `,
  DELETE_MESSAGE: gql`
    mutation deleteMessage($message_id: ID!) {
      deleteMessage(message_id: $message_id)
    }
  `,
  PIN_MESSAGE: gql`
    mutation pinMessage($message_id: ID!) {
      pinMessage(message_id: $message_id) {
        id
        conversation_id
        sender_id
        author {
          user_id
          username
          display_name
          avatar_url
        }

        content
        replied_message_id
        forwarded_message_id

        mention_users
        mention_roles
        mention_channels
        emojis

        createdAt
      }
    }
  `,
  UNPIN_MESSAGE: gql`
    mutation unpinMessage($message_id: ID!) {
      unpinMessage(message_id: $message_id) {
        id
        conversation_id
        sender_id
        author {
          user_id
          username
          display_name
          avatar_url
        }

        content
        replied_message_id
        forwarded_message_id

        mention_users
        mention_roles
        mention_channels
        emojis

        createdAt
      }
    }
  `,

  REACT_MESSAGE: gql`
    mutation reactMessage($message_id: ID!, $input: ReactMessageInput!) {
      reactMessage(message_id: $message_id, input: $input) {
        message_id
        sender_id
        emoji_id
      }
    }
  `,
  UNREACT_MESSAGE: gql`
    mutation unreactMessage($message_id: ID!, $input: ReactMessageInput!) {
      unreactMessage(message_id: $message_id, input: $input) {
        message_id
        sender_id
        emoji_id
      }
    }
  `,

  READ_MESSAGE: gql`
    mutation readMessage($input: LastReadInput!) {
      updateLastRead(input: $input) {
        user_id
        conversation_id
        last_message_read_id
      }
    }
  `,
};
