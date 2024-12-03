interface RedisKeyConfig {
  key: (params: any) => string;
  TTL: number; // Time to live in seconds
}

interface UsersConfig {
  USER_ACCOUNT: RedisKeyConfig;
  USER_PROFILE: RedisKeyConfig;
  SERVER_PROFILE: RedisKeyConfig;
  USER_SETTINGS: RedisKeyConfig;
  USER_STATUS: RedisKeyConfig;
  RELATIONSHIP: RedisKeyConfig;
  FRIEND_LIST: RedisKeyConfig;
  BLOCKED_LIST: RedisKeyConfig;
}

interface ServersConfig {
  SERVER_OVERVIEW: RedisKeyConfig;
  SERVER_MEMBERS: RedisKeyConfig;
  SERVER_INVITE_CODES: RedisKeyConfig;
  SERVER_ROLES: RedisKeyConfig;
  SERVER_ROLE: RedisKeyConfig;
  USER_ROLES: RedisKeyConfig;
  USER_PERMISSIONS: RedisKeyConfig;
  SERVER_DEFAULT_ROLES: RedisKeyConfig;
  SERVER_DEFAULT_PERMISSIONS: RedisKeyConfig;
  SERVER_ROLE_MEMBERS: RedisKeyConfig;
  SERVER_CONVERSATION: RedisKeyConfig;
  SERVER_EMOJI: RedisKeyConfig;
}

interface MiddlewareConfig {
  AUTH_MIDDLEWARE: RedisKeyConfig;
  MEMBERSHIP_MIDDLEWARE: RedisKeyConfig;
}

export const USERS: UsersConfig = {
  USER_ACCOUNT: {
    key: (params: { user_id: string }) => `USER_ACCOUNT_${params?.user_id}`,
    TTL: 60 * 60 * 24,
  },
  USER_PROFILE: {
    key: (params: { user_id: string }) => `USER_PROFILE_${params?.user_id}`,
    TTL: 60 * 60 * 1,
  },
  SERVER_PROFILE: {
    key: (params: { user_id: string; server_id: string }) =>
      `SERVER_PROFILE_${params?.user_id}_${params?.server_id}`,
    TTL: 60 * 60 * 1,
  },
  USER_SETTINGS: {
    key: (params: { user_id: string }) => `USER_SETTINGS_${params?.user_id}`,
    TTL: 60 * 60 * 12,
  },
  USER_STATUS: {
    key: (params: { user_id: string }) => `USER_STATUS_${params?.user_id}`,
    TTL: 60 * 5,
  },
  RELATIONSHIP: {
    key: (params: { user_id_1: string; user_id_2: string }) => {
      // Sort the user IDs to avoid duplicate keys
      if (params?.user_id_1 > params?.user_id_2) {
        [params.user_id_1, params.user_id_2] = [
          params.user_id_2,
          params.user_id_1,
        ];
      }
      return `USER_RELATIONSHIP_${params?.user_id_1}_${params?.user_id_2}`;
    },
    TTL: 60 * 15,
  },
  FRIEND_LIST: {
    key: (params: { user_id: string }) => `USER_FRIENDS_${params?.user_id}`,
    TTL: 60 * 10,
  },
  BLOCKED_LIST: {
    key: (params: { user_id: string }) => `USER_BLOCKS_${params?.user_id}`,
    TTL: 60 * 10,
  },
};

export const SERVERS: ServersConfig = {
  SERVER_OVERVIEW: {
    key: (params: { server_id: string }) =>
      `SERVER_OVERVIEW_${params?.server_id}`,
    TTL: 60 * 60 * 1,
  },
  SERVER_MEMBERS: {
    key: (params: { server_id: string }) =>
      `SERVER_MEMBERS_${params?.server_id}`,
    TTL: 60 * 15,
  },
  SERVER_INVITE_CODES: {
    key: (params: { server_id: string }) =>
      `SERVER_INVITE_CODES_${params?.server_id}`,
    TTL: 60 * 10,
  },
  SERVER_ROLES: {
    key: (params: { server_id: string }) => `SERVER_ROLES_${params?.server_id}`,
    TTL: 60 * 10,
  },
  SERVER_ROLE: {
    key: (params: { server_id: string; role_id: string }) =>
      `SERVER_ROLE_${params?.server_id}_${params?.role_id}`,
    TTL: 60 * 10,
  },
  USER_ROLES: {
    key: (params: { user_id: string; server_id: string }) =>
      `USER_ROLES_${params?.server_id}_${params?.user_id}`,
    TTL: 60 * 10,
  },
  USER_PERMISSIONS: {
    key: (params: { user_id: string; server_id: string }) =>
      `USER_PERMISSIONS_${params?.server_id}_${params?.user_id}`,
    TTL: 60 * 10,
  },
  SERVER_DEFAULT_ROLES: {
    key: (params: { server_id: string }) =>
      `SERVER_DEFAULT_ROLES_${params?.server_id}`,
    TTL: 60 * 10,
  },
  SERVER_DEFAULT_PERMISSIONS: {
    key: (params: { server_id: string }) =>
      `SERVER_DEFAULT_PERMISSIONS_${params?.server_id}`,
    TTL: 60 * 10,
  },
  SERVER_ROLE_MEMBERS: {
    key: (params: { server_id: string; role_id: string }) =>
      `SERVER_ROLE_MEMBERS_${params?.server_id}_${params?.role_id}`,
    TTL: 60 * 10,
  },
  SERVER_CONVERSATION: {
    key: (params: { server_id: string }) =>
      `SERVER_CONVERSATION_${params?.server_id}`,
    TTL: 60 * 15,
  },
  SERVER_EMOJI: {
    key: (params: { server_id: string }) => `SERVER_EMOJI_${params?.server_id}`,
    TTL: 60 * 60 * 1,
  },
};

export const MIDDLEWARE: MiddlewareConfig = {
  AUTH_MIDDLEWARE: {
    key: (params: { token: string }) => `AUTH_MIDDLEWARE_${params?.token}`,
    TTL: 60 * 15, // 15 minutes
  },
  MEMBERSHIP_MIDDLEWARE: {
    key: (params: { user_id: string; server_id: string }) => {
      return `MEMBERSHIP_MIDDLEWARE_${params?.user_id}_${params?.server_id}`;
    },
    TTL: 60 * 15,
  },
};
