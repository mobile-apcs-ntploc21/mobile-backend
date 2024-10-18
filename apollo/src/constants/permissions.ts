enum PermissionStates {
  ALLOWED = "ALLOWED",
  DENIED = "DENIED",
  DEFAULT = "DEFAULT",
}

enum BaseRolePermissions {
  CREATE_EXPRESSION = "CREATE_EXPRESSION",
  MANAGE_EXPRESSION = "MANAGE_EXPRESSION",
  MANAGE_SERVER = "MANAGE_SERVER",
  MANAGE_INVITE = "MANAGE_INVITE",
  KICK_MEMBER = "KICK_MEMBER",
  BAN_MEMBER = "BAN_MEMBER",
  VIEW_CHANNEL = "VIEW_CHANNEL",
  MANAGE_CHANNEL = "MANAGE_CHANNEL",
  SEND_MESSAGE = "SEND_MESSAGE",
  ATTACH_FILE = "ATTACH_FILE",
  ADD_REACTION = "ADD_REACTION",
  USE_EXTERNAL_EMOJI = "USE_EXTERNAL_EMOJI",
  MENTION_ALL = "MENTION_ALL",
  MANAGE_MESSAGE = "MANAGE_MESSAGE",
  VOICE_CONNECT = "VOICE_CONNECT",
  VOICE_SPEAK = "VOICE_SPEAK",
  VOICE_VIDEO = "VOICE_VIDEO",
  VOICE_MUTE_MEMBER = "VOICE_MUTE_MEMBER",
  VOICE_DEAFEN_MEMBER = "VOICE_DEAFEN_MEMBER",
}

enum GeneralServerPermissions {
  CREATE_EXPRESSION = BaseRolePermissions.CREATE_EXPRESSION,
  MANAGE_EXPRESSION = BaseRolePermissions.MANAGE_EXPRESSION,
  MANAGE_SERVER = BaseRolePermissions.MANAGE_SERVER,
  VIEW_CHANNEL = BaseRolePermissions.VIEW_CHANNEL,
  MANAGE_CHANNEL = BaseRolePermissions.MANAGE_CHANNEL,
}

enum MembershipPermissions {
  MANAGE_INVITE = BaseRolePermissions.MANAGE_INVITE,
  KICK_MEMBER = BaseRolePermissions.KICK_MEMBER,
  BAN_MEMBER = BaseRolePermissions.BAN_MEMBER,
}

enum GeneralCategoryPermissions {
  VIEW_CHANNEL = BaseRolePermissions.VIEW_CHANNEL,
  MANAGE_CHANNEL = BaseRolePermissions.MANAGE_CHANNEL,
}

enum GeneralChannelPermissions {
  VIEW_CHANNEL = BaseRolePermissions.VIEW_CHANNEL,
  MANAGE_CHANNEL = BaseRolePermissions.MANAGE_CHANNEL,
}

enum TextChannelPermissions {
  SEND_MESSAGE = BaseRolePermissions.SEND_MESSAGE,
  ATTACH_FILE = BaseRolePermissions.ATTACH_FILE,
  ADD_REACTION = BaseRolePermissions.ADD_REACTION,
  USE_EXTERNAL_EMOJI = BaseRolePermissions.USE_EXTERNAL_EMOJI,
  MENTION_ALL = BaseRolePermissions.MENTION_ALL,
  MANAGE_MESSAGE = BaseRolePermissions.MANAGE_MESSAGE,
}

enum VoiceChannelPermissions {
  VOICE_CONNECT = BaseRolePermissions.VOICE_CONNECT,
  VOICE_SPEAK = BaseRolePermissions.VOICE_SPEAK,
  VOICE_VIDEO = BaseRolePermissions.VOICE_VIDEO,
  VOICE_MUTE_MEMBER = BaseRolePermissions.VOICE_MUTE_MEMBER,
  VOICE_DEAFEN_MEMBER = BaseRolePermissions.VOICE_DEAFEN_MEMBER,
}

export {
  PermissionStates,
  BaseRolePermissions,
  GeneralServerPermissions,
  MembershipPermissions,
  GeneralCategoryPermissions,
  GeneralChannelPermissions,
  TextChannelPermissions,
  VoiceChannelPermissions,
};
