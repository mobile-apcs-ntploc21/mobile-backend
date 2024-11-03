"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageMutations = exports.serverChannelPermissionMutations = exports.serverCategoryPermissionMutations = exports.serverRoleMutations = exports.serverBansMutations = exports.categoryMutations = exports.channelMutations = exports.serverEmojiMutations = exports.serverMemberMutations = exports.serverMutations = exports.userStatusMutations = exports.userProfileMutation = exports.DELETE_RELATIONSHIP = exports.UPDATE_RELATIONSHIP = exports.CREATE_RELATIONSHIP = exports.settingsMutations = exports.UPDATE_REFRESH_TOKEN = exports.CREATE_USER = void 0;
const graphql_request_1 = require("graphql-request");
exports.CREATE_USER = (0, graphql_request_1.gql) `
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
exports.UPDATE_REFRESH_TOKEN = (0, graphql_request_1.gql) `
  mutation updateRefreshToken($input: UpdateRefreshTokenInput!) {
    updateRefreshToken(input: $input) {
      id
      email
    }
  }
`;
exports.settingsMutations = {
    CREATE_USER_SETTINGS: (0, graphql_request_1.gql) `
    mutation createUserSettings($input: CreateUserSettingsInput!) {
      createUserSettings(input: $input) {
        settings
      }
    }
  `,
    UPDATE_USER_SETTINGS: (0, graphql_request_1.gql) `
    mutation updateUserSettings($input: UpdateUserSettingsInput!) {
      updateUserSettings(input: $input) {
        settings
      }
    }
  `,
    DELETE_USER_SETTINGS: (0, graphql_request_1.gql) `
    mutation deleteUserSettings($user_id: ID!) {
      deleteUserSettings(user_id: $user_id) {
        settings
      }
    }
  `,
    RESTORE_USER_SETTINGS: (0, graphql_request_1.gql) `
    mutation restoreUserSettings($user_id: ID!) {
      restoreUserSettings(user_id: $user_id) {
        settings
      }
    }
  `,
};
exports.CREATE_RELATIONSHIP = (0, graphql_request_1.gql) `
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
exports.UPDATE_RELATIONSHIP = (0, graphql_request_1.gql) `
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
exports.DELETE_RELATIONSHIP = (0, graphql_request_1.gql) `
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
exports.userProfileMutation = {
    CREATE_USER_PROFILE: (0, graphql_request_1.gql) `
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
    UPDATE_USER_PROFILE: (0, graphql_request_1.gql) `
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
    DELETE_USER_PROFILE: (0, graphql_request_1.gql) `
    mutation deleteUserProfile($user_id: ID!, $server_id: ID!) {
      deleteUserProfile(user_id: $user_id, server_id: $server_id) {
        user_id
        server_id
      }
    }
  `,
};
exports.userStatusMutations = {
    UPDATE_USER_STATUS_TYPE: (0, graphql_request_1.gql) `
    mutation updateStatusType($user_id: ID!, $type: CustomStatus!) {
      updateStatusType(user_id: $user_id, type: $type) {
        user_id
        type
      }
    }
  `,
    UPDATE_USER_STATUS_TEXT: (0, graphql_request_1.gql) `
    mutation updateStatusText($user_id: ID!, $status_text: String!) {
      updateStatusText(user_id: $user_id, status_text: $status_text) {
        user_id
        status_text
      }
    }
  `,
};
exports.serverMutations = {
    CREATE_SERVER: (0, graphql_request_1.gql) `
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
    UPDATE_SERVER: (0, graphql_request_1.gql) `
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
    DELETE_SERVER: (0, graphql_request_1.gql) `
    mutation deleteServer($server_id: ID!) {
      deleteServer(server_id: $server_id)
    }
  `,
    TRANSFER_OWNERSHIP: (0, graphql_request_1.gql) `
    mutation transferOwnership($server_id: ID!, $user_id: ID!) {
      transferOwnership(server_id: $server_id, user_id: $user_id)
    }
  `,
    CREATE_INVITE_CODE: (0, graphql_request_1.gql) `
    mutation createInviteCode($server_id: ID!, $input: CreateInviteCodeInput!) {
      createInviteCode(server_id: $server_id, input: $input) {
        url
        expiredAt
        maxUses
        currentUses
      }
    }
  `,
    DELETE_INVITE_CODE: (0, graphql_request_1.gql) `
    mutation deleteInviteCode($server_id: ID!, $url: String!) {
      deleteInviteCode(server_id: $server_id, url: $url)
    }
  `,
    MOVE_SERVER: (0, graphql_request_1.gql) `
    mutation moveServer($user_id: ID!, $input: [MoveServerInput!]!) {
      moveServer(user_id: $user_id, input: $input)
    }
  `,
    SET_FAVORITE_SERVER: (0, graphql_request_1.gql) `
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
exports.serverMemberMutations = {
    JOIN_SERVER: (0, graphql_request_1.gql) `
    mutation JoinServer($url: String!, $user_id: ID!) {
      joinServer(url: $url, user_id: $user_id) {
        server_id
        user_id
      }
    }
  `,
    ADD_SERVER_MEMBERS: (0, graphql_request_1.gql) `
    mutation AddServerMembers($input: ServerMembersInput!) {
      addServerMembers(input: $input) {
        server_id
        user_id
      }
    }
  `,
    REMOVE_SERVER_MEMBERS: (0, graphql_request_1.gql) `
    mutation RemoveServerMembers($input: ServerMembersInput!) {
      removeServerMembers(input: $input) {
        server_id
        user_id
      }
    }
  `,
};
exports.serverEmojiMutations = {
    CREATE_SERVER_EMOJI: (0, graphql_request_1.gql) `
    mutation createServerEmoji($input: CreateServerEmojiInput!) {
      createServerEmoji(input: $input) {
        id
        name
        image_url
        uploader_id
      }
    }
  `,
    UPDATE_SERVER_EMOJI: (0, graphql_request_1.gql) `
    mutation updateServerEmoji($emoji_id: ID!, $name: String!) {
      updateServerEmoji(emoji_id: $emoji_id, name: $name) {
        id
        name
        image_url
        uploader_id
      }
    }
  `,
    DELETE_SERVER_EMOJI: (0, graphql_request_1.gql) `
    mutation deleteServerEmoji($emoji_id: ID!) {
      deleteServerEmoji(emoji_id: $emoji_id)
    }
  `,
};
exports.channelMutations = {
    CREATE_CHANNEL: (0, graphql_request_1.gql) `
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
    UPDATE_CHANNEL: (0, graphql_request_1.gql) `
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
    DELETE_CHANNEL: (0, graphql_request_1.gql) `
    mutation deleteChannel($channel_id: ID!) {
      deleteChannel(channel_id: $channel_id)
    }
  `,
    HARD_DELETE_CHANNEL: (0, graphql_request_1.gql) `
    mutation hardDeleteChannel($channel_id: ID!) {
      hardDeleteChannel(channel_id: $channel_id)
    }
  `,
    MOVE_CHANNEL: (0, graphql_request_1.gql) `
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
    MOVE_ALL_CHANNEL: (0, graphql_request_1.gql) `
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
exports.categoryMutations = {
    CREATE_CATEGORY: (0, graphql_request_1.gql) `
    mutation createCategory($server_id: ID!, $input: createCategoryInput!) {
      createCategory(server_id: $server_id, input: $input) {
        id
        server_id
        name
        position
      }
    }
  `,
    UPDATE_CATEGORY: (0, graphql_request_1.gql) `
    mutation updateCategory($category_id: ID!, $input: updateCategoryInput!) {
      updateCategory(category_id: $category_id, input: $input) {
        id
        server_id
        name
        position
      }
    }
  `,
    DELETE_CATEGORY: (0, graphql_request_1.gql) `
    mutation deleteCategory($category_id: ID!) {
      deleteCategory(category_id: $category_id)
    }
  `,
    MOVE_CATEGORY: (0, graphql_request_1.gql) `
    mutation moveCategory($category_id: ID!, $new_position: Int!) {
      moveCategory(category_id: $category_id, new_position: $new_position) {
        id
        server_id
        name
        position
      }
    }
  `,
    MOVE_ALL_CATEGORY: (0, graphql_request_1.gql) `
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
exports.serverBansMutations = {
    CREATE_SERVER_BAN: (0, graphql_request_1.gql) `
    mutation createServerBan($server_id: ID!, $user_id: ID!) {
      createServerBan(server_id: $server_id, user_id: $user_id) {
        server_id
        user_id
      }
    }
  `,
    CREATE_SERVER_BULK_BAN: (0, graphql_request_1.gql) `
    mutation createServerBulkBan($server_id: ID!, $user_ids: [ID]!) {
      createServerBulkBan(server_id: $server_id, user_ids: $user_ids) {
        server_id
        user_id
      }
    }
  `,
    DELETE_SERVER_BAN: (0, graphql_request_1.gql) `
    mutation deleteServerBan($server_id: ID!, $user_id: ID!) {
      deleteServerBan(server_id: $server_id, user_id: $user_id)
    }
  `,
    CREATE_SERVER_KICK: (0, graphql_request_1.gql) `
    mutation createServerKick($server_id: ID!, $user_id: ID!) {
      createServerKick(server_id: $server_id, user_id: $user_id)
    }
  `,
};
exports.serverRoleMutations = {
    CREATE_SERVER_ROLE: (0, graphql_request_1.gql) `
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
    UPDATE_SERVER_ROLE: (0, graphql_request_1.gql) `
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
    UPDATE_DEFAULT_SERVER_ROLE: (0, graphql_request_1.gql) `
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
    DELETE_SERVER_ROLE: (0, graphql_request_1.gql) `
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
    ADD_USER_TO_ROLE: (0, graphql_request_1.gql) `
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
    REMOVE_USER_FROM_ROLE: (0, graphql_request_1.gql) `
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
exports.serverCategoryPermissionMutations = {
    CREATE_CATEGORY_ROLE_PERMISSION: (0, graphql_request_1.gql) `
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
    CREATE_CATEGORY_USER_PERMISSION: (0, graphql_request_1.gql) `
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
    UPDATE_CATEGORY_ROLE_PERMISSION: (0, graphql_request_1.gql) `
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
    UPDATE_CATEGORY_USER_PERMISSION: (0, graphql_request_1.gql) `
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
    DELETE_CATEGORY_ROLE_PERMISSION: (0, graphql_request_1.gql) `
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
    DELETE_CATEGORY_USER_PERMISSION: (0, graphql_request_1.gql) `
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
exports.serverChannelPermissionMutations = {
    CREATE_CHANNEL_ROLE_PERMISSION: (0, graphql_request_1.gql) `
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
    CREATE_CHANNEL_USER_PERMISSION: (0, graphql_request_1.gql) `
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
    UPDATE_CHANNEL_ROLE_PERMISSION: (0, graphql_request_1.gql) `
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
    UPDATE_CHANNEL_USER_PERMISSION: (0, graphql_request_1.gql) `
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
    DELETE_CHANNEL_ROLE_PERMISSION: (0, graphql_request_1.gql) `
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
    DELETE_CHANNEL_USER_PERMISSION: (0, graphql_request_1.gql) `
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
exports.messageMutations = {
    CREATE_MESSAGE: (0, graphql_request_1.gql) `
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
    UPDATE_MESSAGE: (0, graphql_request_1.gql) `
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
    DELETE_MESSAGE: (0, graphql_request_1.gql) `
    mutation deleteMessage($message_id: ID!) {
      deleteMessage(message_id: $message_id)
    }
  `,
    PIN_MESSAGE: (0, graphql_request_1.gql) `
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
    UNPIN_MESSAGE: (0, graphql_request_1.gql) `
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
    REACT_MESSAGE: (0, graphql_request_1.gql) `
    mutation reactMessage($message_id: ID!, $input: ReactMessageInput!) {
      reactMessage(message_id: $message_id, input: $input) {
        message_id
        sender_id
        emoji_id
      }
    }
  `,
    UNREACT_MESSAGE: (0, graphql_request_1.gql) `
    mutation unreactMessage($message_id: ID!, $input: ReactMessageInput!) {
      unreactMessage(message_id: $message_id, input: $input) {
        message_id
        sender_id
        emoji_id
      }
    }
  `,
    READ_MESSAGE: (0, graphql_request_1.gql) `
    mutation readMessage($input: LastReadInput!) {
      updateLastRead(input: $input) {
        user_id
        conversation_id
        last_message_read_id
      }
    }
  `,
};
