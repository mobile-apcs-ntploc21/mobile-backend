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
      display_name
      avatar_url
      banner_url
      about_me
    }
  }
`;

export const GET_RECEIVED_FRIEND_REQUESTS = gql`
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

export const GET_SENT_FRIEND_REQUESTS = gql`
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

export const GET_BLOCKED_USERS = gql`
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

export const userStatusQueries = {
  GET_USER_STATUS: gql`
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

  GET_MULTIPLE_USER_STATUS: gql`
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

export const serverQueries = {
  GET_SERVER_BY_ID: gql`
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
  GET_SERVERS_BY_USER_ID: gql`
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

export const serverMemberQueries = {
  GET_SERVER_MEMBERS: gql`
    query GetServerMembers($server_id: ID!, $limit: Int) {
      getServerMembers(server_id: $server_id, limit: $limit) {
        id
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
      }
    }
  `,
  CHECK_SERVER_MEMBER: gql`
    query CheckServerMember($server_id: ID!, $user_id: ID!) {
      checkServerMember(server_id: $server_id, user_id: $user_id)
    }
  `,
};

export const serverEmojiQueries = {
  GET_SERVER_EMOJI: gql`
    query serverEmoji($server_id: ID!, $emoji_id: ID!) {
      serverEmoji(server_id: $server_id, emoji_id: $emoji_id) {
        id
        name
        image_url
        uploader_id
      }
    }
  `,

  GET_SERVER_EMOJIS: gql`
    query serverEmojis($server_id: ID!) {
      serverEmojis(server_id: $server_id) {
        id
        name
        image_url
        uploader_id
      }
    }
  `,

  COUNT_SERVER_EMOJIS: gql`
    query countServerEmojis($server_id: ID!) {
      countServerEmojis(server_id: $server_id)
    }
  `,
};

export const serverBansQueries = {
  GET_SERVER_BAN: gql`
    query getServerBan($server_id: ID!, $user_id: ID!) {
      getServerBan(server_id: $server_id, user_id: $user_id) {
        server_id
        user_id
      }
    }
  `,
  GET_SERVER_BANS: gql`
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

export const serverRoleQueries = {
  GET_SERVER_ROLE: gql`
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
  GET_SERVER_ROLES: gql`
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

  GET_DEFAULT_SERVER_ROLE: gql`
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

  GET_SERVER_ROLE_USERS: gql`
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

  GET_ROLES_ASSIGNED_WITH_USER: gql`
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

export const serverChannelQueries = {
  GET_CHANNEL: gql`
    query getChannel($channel_id: ID!) {
      getChannel(channel_id: $channel_id) {
        id
        server_id
        name
        position
      }
    }
  `,
};

export const serverChannelPermissionQueries = {
  GET_CHANNEL_ROLES_PERMISSION: gql`
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
  GET_CHANNEL_USERS_PERMISSION: gql`
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
  GET_CHANNEL_ROLE_PERMISSION: gql`
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
  GET_CHANNEL_USER_PERMISSION: gql`
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

export const serverCategoryQueries = {
  GET_CATEGORY: gql`
    query getCategory($category_id: ID!) {
      getCategory(category_id: $category_id) {
        id
        server_id
        name
        position
      }
    }
  `,
};

export const serverCategoryPermissionQueries = {
  GET_CATEGORY_ROLES_PERMISSION: gql`
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
  GET_CATEGORY_USERS_PERMISSION: gql`
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
  GET_CATEGORY_ROLE_PERMISSION: gql`
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
  GET_CATEGORY_USER_PERMISSION: gql`
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
