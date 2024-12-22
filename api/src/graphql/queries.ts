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
  query loginUser($email: String!, $password: String!, $device_token: String!) {
    loginUser(email: $email, password: $password, device_token: $device_token) {
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

  GET_SERVERS_EMOJIS: gql`
    query serversEmojis($user_id: ID!) {
      serversEmojis(user_id: $user_id) {
        name
        server_id
        emojis {
          id
          name
          image_url
          uploader_id
        }
      }
    }
  `,

  GET_UNICODE_EMOJIS: gql`
    query unicodeEmojis($confirm: Boolean) {
      unicodeEmojis(confirm: $confirm) {
        name
        emojis {
          id
          name
          unicode
        }
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

  GET_CHANNELS: gql`
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
          attachments {
            type
            url
            filename
            size
          }

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
  GET_CATEGORIES: gql`
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

export const messageQueries = {
  GET_MESSAGE: gql`
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
        attachments {
          type
          url
          filename
          size
        }

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
  GET_MESSAGES: gql`
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
        attachments {
          type
          url
          filename
          size
        }

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
  SEARCH_MESSAGES: gql`
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
        attachments {
          type
          url
          filename
          size
        }

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
  GET_PINNED_MESSAGES: gql`
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
        attachments {
          type
          url
          filename
          size
        }

        mention_users
        mention_roles
        mention_channels
        emojis

        createdAt
      }
    }
  `,

  GET_REACTIONS: gql`
    query reactions($message_id: ID!) {
      reactions(message_id: $message_id) {
        message_id
        sender_id
        emoji_id
      }
    }
  `,

  GET_REACTIONS_IN_DM: gql`
    query reactionsInDM($message_id: ID!, $conversation_id: ID!) {
      reactionsInDM(
        message_id: $message_id
        conversation_id: $conversation_id
      ) {
        message_id
        sender_id
        emoji_id
      }
    }
  `,

  SEARCH_DIRECT_MESSAGES: gql`
    query searchDirectMessages(
      $query: DirectMessageSearchQuery!
      $offset: Int
      $limit: Int
    ) {
      searchDirectMessages(query: $query, offset: $offset, limit: $limit) {
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
        attachments {
          type
          url
          filename
          size
        }

        mention_users
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
};

export const cronjobQueries = {
  GET_AVAILABLE_ATTACHMENTS: gql`
    query availableAttachments {
      availableAttachments {
        url
      }
    }
  `,
  GET_DELETED_EMOJIS: gql`
    query deletedEmojis {
      deletedEmojis {
        id
        name
        image_url
      }
    }
  `,
};

export const ordersQueries = {
  GET_ORDER: gql`
    query order($order_id: ID!) {
      order(order_id: $order_id) {
        id
        user_id
        package_id
        amount
        status
        transaction_id
        createdAt
      }
    }
  `,
  GET_ORDERS: gql`
    query orders() {
      orders() {
        id
        user_id
        package_id
        amount
        status
        transaction_id
        createdAt
      }
    }
  `,
  GET_ORDERS_BY_USER: gql`
    query ordersByUser($user_id: ID!) {
      ordersByUser(user_id: $user_id) {
        id
        user_id
        package_id
        amount
        status
        transaction_id
        createdAt
      }
    }
  `,
  GET_ORDER_BY_TRANSACTION: gql`
    query orderByTransaction($transaction_id: String!) {
      orderByTransaction(transaction_id: $transaction_id) {
        id
        user_id
        package_id
        amount
        status
        transaction_id
        createdAt
      }
    }
  `,
};

export const paymentLogQueries = {
  GET_PAYMENT_LOG: gql`
    query paymentLog($log_id: ID!) {
      paymentLog(log_id: $log_id) {
        id
        user_id
        order_id
        request
        response
        transaction_id
        log_type
        data
      }
    }
  `,
  GET_PAYMENT_LOGS: gql`
    query paymentLogs($user_id: ID!) {
      paymentLogs(user_id: $user_id) {
        id
        user_id
        order_id
        request
        response
        transaction_id
        log_type
        data
      }
    }
  `,
};

export const packagesQueries = {
  GET_PACKAGE: gql`
    query package($package_id: ID!) {
      package(id: $package_id) {
        id
        name
        description
        base_price
        is_on_sale
        sale_details {
          discount
          end_date
        }
        duration
        features_list
      }
    }
  `,
  GET_PACKAGES: gql`
    query Packages {
      packages {
        id
        name
        description
        base_price
        is_on_sale
        sale_details {
          discount
          end_date
        }
        duration
        features_list
      }
    }
  `,
};

export const userSubscriptionQueries = {
  GET_USER_SUBSCRIPTION: gql`
    query userSubscription($user_id: ID!) {
      userSubscription(user_id: $user_id) {
        user_id
        package_id
        is_active
        startDate
        endDate

        package_ {
          id
          name
          description
          base_price
          is_on_sale
          sale_details {
            discount
            end_date
          }
          duration
          features_list
        }
      }
    }
  `,
};

export const directMessageQueries = {
  GET_DIRECT_MESSAGE: gql`
    query getDirectMessage($user_first_id: ID!, $user_second_id: ID!) {
      getDirectMessage(
        user_first_id: $user_first_id
        user_second_id: $user_second_id
      ) {
        conversation_id
        latest_message {
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
          attachments {
            type
            url
            filename
            size
          }

          mention_users

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
      }
    }
  `,
  GET_DIRECT_MESSAGES: gql`
    query getDirectMessages($user_id: ID!) {
      getDirectMessages(user_id: $user_id) {
        direct_message {
          conversation_id
          latest_message {
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
            attachments {
              type
              url
              filename
              size
            }

            mention_users

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
        }
        other_user {
          user_id
          username
          display_name
          avatar_url
        }
      }
    }
  `,
};

export const directMessageQueries = {
  GET_DIRECT_MESSAGE: gql`
    query getDirectMessage($user_first_id: ID!, $user_second_id: ID!) {
      getDirectMessage(
        user_first_id: $user_first_id
        user_second_id: $user_second_id
      ) {
        conversation_id
        latest_message {
          id
          conversation_id
          sender_id
          author {
            user_id
            username
            display_name
            avatar_url
          }
        }
        has_new_message
        number_of_unread_mentions
      }
    }
  `,
  GET_DIRECT_MESSAGES: gql`
    query getDirectMessages($user_id: ID!) {
      getDirectMessages(user_id: $user_id) {
        direct_message {
          conversation_id
          latest_message {
            id
            conversation_id
            sender_id
            author {
              user_id
              username
              display_name
              avatar_url
            }
          }
          has_new_message
          number_of_unread_mentions
        }
        other_user {
          user_id
          username
          display_name
          avatar_url
        }
      }
    }
  `,
};
