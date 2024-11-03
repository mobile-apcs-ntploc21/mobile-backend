"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageQueries = exports.serverCategoryPermissionQueries = exports.serverCategoryQueries = exports.serverChannelPermissionQueries = exports.serverChannelQueries = exports.serverRoleQueries = exports.serverBansQueries = exports.serverEmojiQueries = exports.serverMemberQueries = exports.serverQueries = exports.userStatusQueries = exports.userProfileQueries = exports.GET_BLOCKED_USERS = exports.GET_SENT_FRIEND_REQUESTS = exports.GET_RECEIVED_FRIEND_REQUESTS = exports.GET_ALL_FRIENDS = exports.GET_RELATIONSHIP_TYPE = exports.settingsQueries = exports.LOGOUT_USER = exports.LOGIN_USER = exports.GET_USER_BY_USERNAME = exports.GET_USER_BY_EMAIL = exports.GET_USER_BY_ID = void 0;
const graphql_request_1 = require("graphql-request");
exports.GET_USER_BY_ID = (0, graphql_request_1.gql) `
  query getUserById($id: ID!) {
    getUserById(id: $id) {
      id
      username
      email
      phone_number
    }
  }
`;
exports.GET_USER_BY_EMAIL = (0, graphql_request_1.gql) `
  query getUserByEmail($email: String!) {
    getUserByEmail(email: $email) {
      id
      username
      email
      phone_number
    }
  }
`;
exports.GET_USER_BY_USERNAME = (0, graphql_request_1.gql) `
  query getUserByUsername($username: String!) {
    getUserByUsername(username: $username) {
      id
      username
      email
      phone_number
    }
  }
`;
exports.LOGIN_USER = (0, graphql_request_1.gql) `
  query loginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      id
      username
      email
      phone_number
    }
  }
`;
exports.LOGOUT_USER = (0, graphql_request_1.gql) `
  query logoutUser($refresh_token: String!, $user_id: ID!) {
    logoutUser(refresh_token: $refresh_token, id: $user_id)
  }
`;
exports.settingsQueries = {
    GET_USER_SETTINGS: (0, graphql_request_1.gql) `
    query getUserSettings($user_id: ID!) {
      getUserSettings(user_id: $user_id) {
        settings
      }
    }
  `,
};
exports.GET_RELATIONSHIP_TYPE = (0, graphql_request_1.gql) `
  query getRelationshipType($user_first_id: ID!, $user_second_id: ID!) {
    getRelationshipType(
      user_first_id: $user_first_id
      user_second_id: $user_second_id
    )
  }
`;
exports.GET_ALL_FRIENDS = (0, graphql_request_1.gql) `
  query getAllFriends($user_id: ID!) {
    getAllFriends(user_id: $user_id) {
      id
      username
      display_name
      avatar_url
      banner_url
      about_me
    }
  }
`;
exports.GET_RECEIVED_FRIEND_REQUESTS = (0, graphql_request_1.gql) `
  query getReceivedFriendRequests($user_id: ID!) {
    getReceivedFriendRequests(user_id: $user_id) {
      id
      username
      display_name
      avatar_url
      banner_url
      about_me
    }
  }
`;
exports.GET_SENT_FRIEND_REQUESTS = (0, graphql_request_1.gql) `
  query getSentFriendRequests($user_id: ID!) {
    getSentFriendRequests(user_id: $user_id) {
      id
      username
      display_name
      avatar_url
      banner_url
      about_me
    }
  }
`;
exports.GET_BLOCKED_USERS = (0, graphql_request_1.gql) `
  query getBlockedUsers($user_id: ID!) {
    getBlockedUsers(user_id: $user_id) {
      id
      username
      display_name
      avatar_url
      banner_url
      about_me
    }
  }
`;
exports.userProfileQueries = {
    GET_USER_PROFILE: (0, graphql_request_1.gql) `
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
    GET_USER_PROFILE_BY_USERNAME: (0, graphql_request_1.gql) `
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
exports.userStatusQueries = {
    GET_USER_STATUS: (0, graphql_request_1.gql) `
    query getUserStatus($user_id: ID!) {
      getUserStatus(user_id: $user_id) {
        user_id
        type
        last_seen
        status_text
        is_online
      }
    }
  `,
    GET_MULTIPLE_USER_STATUS: (0, graphql_request_1.gql) `
    query getMultipleUserStatus($user_ids: [ID!]!) {
      getMultipleUserStatus(user_ids: $user_ids) {
        user_id
        type
        last_seen
        status_text
        is_online
      }
    }
  `,
};
exports.serverQueries = {
    GET_SERVER_BY_ID: (0, graphql_request_1.gql) `
    query server($server_id: ID!) {
      server(server_id: $server_id) {
        id
        owner
        name
        owner
        avatar_url
        banner_url
        totalMembers
        totalEmojis
      }
    }
  `,
    GET_SERVERS_BY_USER_ID: (0, graphql_request_1.gql) `
    query servers($user_id: ID!) {
      servers(user_id: $user_id) {
        id
        owner
        name
        avatar_url
        banner_url
        totalMembers
        totalEmojis
        is_favorite
        position
      }
    }
  `,
    GET_INVITE_CODE: (0, graphql_request_1.gql) `
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
exports.serverMemberQueries = {
    GET_SERVER_MEMBERS: (0, graphql_request_1.gql) `
    query GetServerMembers($server_id: ID!, $limit: Int) {
      getServerMembers(server_id: $server_id, limit: $limit) {
        user_id
        username
        display_name
        avatar_url
        banner_url
        about_me
        status {
          type
          last_seen
          status_text
          is_online
        }
        roleIds
      }
    }
  `,
    CHECK_SERVER_MEMBER: (0, graphql_request_1.gql) `
    query CheckServerMember($server_id: ID!, $user_id: ID!) {
      checkServerMember(server_id: $server_id, user_id: $user_id)
    }
  `,
};
exports.serverEmojiQueries = {
    GET_SERVER_EMOJI: (0, graphql_request_1.gql) `
    query serverEmoji($server_id: ID!, $emoji_id: ID!) {
      serverEmoji(server_id: $server_id, emoji_id: $emoji_id) {
        id
        name
        image_url
        uploader_id
      }
    }
  `,
    GET_SERVER_EMOJIS: (0, graphql_request_1.gql) `
    query serverEmojis($server_id: ID!) {
      serverEmojis(server_id: $server_id) {
        id
        name
        image_url
        uploader_id
      }
    }
  `,
    COUNT_SERVER_EMOJIS: (0, graphql_request_1.gql) `
    query countServerEmojis($server_id: ID!) {
      countServerEmojis(server_id: $server_id)
    }
  `,
};
exports.serverBansQueries = {
    GET_SERVER_BAN: (0, graphql_request_1.gql) `
    query getServerBan($server_id: ID!, $user_id: ID!) {
      getServerBan(server_id: $server_id, user_id: $user_id) {
        server_id
        user_id
      }
    }
  `,
    GET_SERVER_BANS: (0, graphql_request_1.gql) `
    query getServerBans($server_id: ID!, $limit: Int) {
      getServerBans(server_id: $server_id, limit: $limit) {
        id
        user_id
        username
        display_name
        avatar_url
        banner_url
        about_me
      }
    }
  `,
};
exports.serverRoleQueries = {
    GET_SERVER_ROLE: (0, graphql_request_1.gql) `
    query getServerRole($role_id: ID!) {
      getServerRole(role_id: $role_id) {
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
    GET_SERVER_ROLES: (0, graphql_request_1.gql) `
    query getServerRoles($server_id: ID!) {
      getServerRoles(server_id: $server_id) {
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
    GET_DEFAULT_SERVER_ROLE: (0, graphql_request_1.gql) `
    query getDefaultServerRole($server_id: ID!) {
      getDefaultServerRole(server_id: $server_id) {
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
    GET_SERVER_ROLE_USERS: (0, graphql_request_1.gql) `
    query getUsersAssignedWithRole($role_id: ID!) {
      getUsersAssignedWithRole(role_id: $role_id) {
        id
        username
        display_name
        avatar_url
        banner_url
        about_me
      }
    }
  `,
    GET_ROLES_ASSIGNED_WITH_USER: (0, graphql_request_1.gql) `
    query getRolesAssignedWithUser($user_id: ID!, $server_id: ID!) {
      getRolesAssignedWithUser(user_id: $user_id, server_id: $server_id) {
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
};
exports.serverChannelQueries = {
    GET_CHANNEL: (0, graphql_request_1.gql) `
    query getChannel($channel_id: ID!) {
      getChannel(channel_id: $channel_id) {
        id
        server_id
        conversation_id
        category_id

        name
        description
        position
        last_message_id

        is_nsfw
        is_archived
        is_deleted
      }
    }
  `,
    GET_CHANNELS: (0, graphql_request_1.gql) `
    query getChannels($server_id: ID!, $user_id: ID) {
      getChannels(server_id: $server_id, user_id: $user_id) {
        id
        server_id
        conversation_id
        category_id

        name
        description
        position
        last_message_id

        last_message {
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
          reactions {
            emoji_id
            count
            reactors
          }
          replied_message {
            id
            sender_id
            content
            is_deleted
          }

          is_modified
          createdAt
        }
        has_new_message
        number_of_unread_mentions

        is_nsfw
        is_archived
      }
    }
  `,
};
exports.serverChannelPermissionQueries = {
    GET_CHANNEL_ROLES_PERMISSION: (0, graphql_request_1.gql) `
    query getChannelRolesPermissions($channel_id: ID!) {
      getChannelRolesPermissions(channel_id: $channel_id) {
        id
        server_id
        name
        color
        position
        is_admin
        allow_anyone_mention
        last_modified
        number_of_users
        permissions
      }
    }
  `,
    GET_CHANNEL_USERS_PERMISSION: (0, graphql_request_1.gql) `
    query getChannelUsersPermissions($channel_id: ID!) {
      getChannelUsersPermissions(channel_id: $channel_id) {
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
    GET_CHANNEL_ROLE_PERMISSION: (0, graphql_request_1.gql) `
    query getChannelRolePermission($role_id: ID!, $channel_id: ID!) {
      getChannelRolePermission(role_id: $role_id, channel_id: $channel_id) {
        id
        server_id
        name
        color
        allow_anyone_mention
        position
        permissions
        is_admin
        last_modified
      }
    }
  `,
    GET_CHANNEL_USER_PERMISSION: (0, graphql_request_1.gql) `
    query getChannelUserPermission($user_id: ID!, $channel_id: ID!) {
      getChannelUserPermission(user_id: $user_id, channel_id: $channel_id) {
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
exports.serverCategoryQueries = {
    GET_CATEGORY: (0, graphql_request_1.gql) `
    query getCategory($category_id: ID!) {
      getCategory(category_id: $category_id) {
        id
        server_id
        name
        position
      }
    }
  `,
    GET_CATEGORIES: (0, graphql_request_1.gql) `
    query getCategories($server_id: ID!) {
      getCategories(server_id: $server_id) {
        id
        server_id
        name
        position
      }
    }
  `,
};
exports.serverCategoryPermissionQueries = {
    GET_CATEGORY_ROLES_PERMISSION: (0, graphql_request_1.gql) `
    query getCategoryRolesPermissions($category_id: ID!) {
      getCategoryRolesPermissions(category_id: $category_id) {
        id
        server_id
        name
        color
        position
        is_admin
        allow_anyone_mention
        last_modified
        number_of_users
        permissions
      }
    }
  `,
    GET_CATEGORY_USERS_PERMISSION: (0, graphql_request_1.gql) `
    query getCategoryUsersPermissions($category_id: ID!) {
      getCategoryUsersPermissions(category_id: $category_id) {
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
    GET_CATEGORY_ROLE_PERMISSION: (0, graphql_request_1.gql) `
    query getCategoryRolePermission($role_id: ID!, $category_id: ID!) {
      getCategoryRolePermission(role_id: $role_id, category_id: $category_id) {
        id
        server_id
        name
        color
        allow_anyone_mention
        position
        permissions
        is_admin
        last_modified
      }
    }
  `,
    GET_CATEGORY_USER_PERMISSION: (0, graphql_request_1.gql) `
    query getCategoryUserPermission($user_id: ID!, $category_id: ID!) {
      getCategoryUserPermission(user_id: $user_id, category_id: $category_id) {
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
exports.messageQueries = {
    GET_MESSAGE: (0, graphql_request_1.gql) `
    query message($message_id: ID!) {
      message(message_id: $message_id) {
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
        reactions {
          emoji_id
          count
          reactors
        }
        replied_message {
          id
          sender_id
          content
          is_deleted
        }

        is_pinned
        is_modified
        createdAt
      }
    }
  `,
    GET_MESSAGES: (0, graphql_request_1.gql) `
    query messages(
      $conversation_id: ID!
      $before: ID
      $after: ID
      $around: ID
      $limit: Int
    ) {
      messages(
        conversation_id: $conversation_id
        before: $before
        after: $after
        around: $around
        limit: $limit
      ) {
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
        reactions {
          emoji_id
          count
          reactors
        }
        replied_message {
          id
          sender_id
          content
          is_deleted
        }

        is_pinned
        is_modified
        createdAt
      }
    }
  `,
    SEARCH_MESSAGES: (0, graphql_request_1.gql) `
    query searchMessages($query: SearchQuery!, $offset: Int, $limit: Int) {
      searchMessages(query: $query, offset: $offset, limit: $limit) {
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

        is_modified
        createdAt
      }
    }
  `,
    GET_PINNED_MESSAGES: (0, graphql_request_1.gql) `
    query pinnedMessages($conversation_id: ID!) {
      pinnedMessages(conversation_id: $conversation_id) {
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
    GET_REACTIONS: (0, graphql_request_1.gql) `
    query reactions($message_id: ID!) {
      reactions(message_id: $message_id) {
        message_id
        sender_id
        emoji_id
      }
    }
  `,
};
