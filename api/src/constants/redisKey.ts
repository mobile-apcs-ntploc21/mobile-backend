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
  SERVER_LIST: RedisKeyConfig;
  SERVER_INVITE_CODES: RedisKeyConfig;
  SERVER_ROLES: RedisKeyConfig;
  SERVER_ROLE: RedisKeyConfig;
  SERVER_PERMISSIONS: RedisKeyConfig;
  SERVER_CONVERSATION: RedisKeyConfig;
  SERVER_EMOJI: RedisKeyConfig;
}

interface MiddlewareConfig {
  AUTH_MIDDLEWARE: RedisKeyConfig;
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

export const MIDDLEWARE: MiddlewareConfig = {
  AUTH_MIDDLEWARE: {
    key: (params: { token: string }) => `AUTH_MIDDLEWARE_${params?.token}`,
    TTL: 60 * 15, // 15 minutes
  },
};
