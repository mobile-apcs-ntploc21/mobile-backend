enum PermissionStates {
  ALLOWED = "ALLOWED",
  DENIED = "DENIED",
  DEFAULT = "DEFAULT",
}

export enum BaseRolePermissions {
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

enum ServerPermissions {
  // General Server Permissions
  CREATE_EXPRESSION = GeneralServerPermissions.CREATE_EXPRESSION,
  MANAGE_EXPRESSION = GeneralServerPermissions.MANAGE_EXPRESSION,
  MANAGE_SERVER = GeneralServerPermissions.MANAGE_SERVER,
  VIEW_CHANNEL = GeneralServerPermissions.VIEW_CHANNEL,
  MANAGE_CHANNEL = GeneralServerPermissions.MANAGE_CHANNEL,

  // Membership Permissions
  MANAGE_INVITE = MembershipPermissions.MANAGE_INVITE,
  KICK_MEMBER = MembershipPermissions.KICK_MEMBER,
  BAN_MEMBER = MembershipPermissions.BAN_MEMBER,

  // Text Channel Permissions
  SEND_MESSAGE = TextChannelPermissions.SEND_MESSAGE,
  ATTACH_FILE = TextChannelPermissions.ATTACH_FILE,
  ADD_REACTION = TextChannelPermissions.ADD_REACTION,
  USE_EXTERNAL_EMOJI = TextChannelPermissions.USE_EXTERNAL_EMOJI,
  MENTION_ALL = TextChannelPermissions.MENTION_ALL,
  MANAGE_MESSAGE = TextChannelPermissions.MANAGE_MESSAGE,

  // Voice Channel Permissions
  VOICE_CONNECT = VoiceChannelPermissions.VOICE_CONNECT,
  VOICE_SPEAK = VoiceChannelPermissions.VOICE_SPEAK,
  VOICE_VIDEO = VoiceChannelPermissions.VOICE_VIDEO,
  VOICE_MUTE_MEMBER = VoiceChannelPermissions.VOICE_MUTE_MEMBER,
  VOICE_DEAFEN_MEMBER = VoiceChannelPermissions.VOICE_DEAFEN_MEMBER,
}

enum CategoryPermissions {
  // General Category Permissions
  VIEW_CHANNEL = GeneralCategoryPermissions.VIEW_CHANNEL,
  MANAGE_CHANNEL = GeneralCategoryPermissions.MANAGE_CHANNEL,

  // Text Channel Permissions
  SEND_MESSAGE = TextChannelPermissions.SEND_MESSAGE,
  ATTACH_FILE = TextChannelPermissions.ATTACH_FILE,
  ADD_REACTION = TextChannelPermissions.ADD_REACTION,
  USE_EXTERNAL_EMOJI = TextChannelPermissions.USE_EXTERNAL_EMOJI,
  MENTION_ALL = TextChannelPermissions.MENTION_ALL,
  MANAGE_MESSAGE = TextChannelPermissions.MANAGE_MESSAGE,

  // Voice Channel Permissions
  VOICE_CONNECT = VoiceChannelPermissions.VOICE_CONNECT,
  VOICE_SPEAK = VoiceChannelPermissions.VOICE_SPEAK,
  VOICE_VIDEO = VoiceChannelPermissions.VOICE_VIDEO,
  VOICE_MUTE_MEMBER = VoiceChannelPermissions.VOICE_MUTE_MEMBER,
  VOICE_DEAFEN_MEMBER = VoiceChannelPermissions.VOICE_DEAFEN_MEMBER,
}

enum ChannelPermissions {
  // General Channel Permissions
  VIEW_CHANNEL = GeneralChannelPermissions.VIEW_CHANNEL,
  MANAGE_CHANNEL = GeneralChannelPermissions.MANAGE_CHANNEL,

  // Text Channel Permissions
  SEND_MESSAGE = TextChannelPermissions.SEND_MESSAGE,
  ATTACH_FILE = TextChannelPermissions.ATTACH_FILE,
  ADD_REACTION = TextChannelPermissions.ADD_REACTION,
  USE_EXTERNAL_EMOJI = TextChannelPermissions.USE_EXTERNAL_EMOJI,
  MENTION_ALL = TextChannelPermissions.MENTION_ALL,
  MANAGE_MESSAGE = TextChannelPermissions.MANAGE_MESSAGE,

  // Voice Channel Permissions
  VOICE_CONNECT = VoiceChannelPermissions.VOICE_CONNECT,
  VOICE_SPEAK = VoiceChannelPermissions.VOICE_SPEAK,
  VOICE_VIDEO = VoiceChannelPermissions.VOICE_VIDEO,
  VOICE_MUTE_MEMBER = VoiceChannelPermissions.VOICE_MUTE_MEMBER,
  VOICE_DEAFEN_MEMBER = VoiceChannelPermissions.VOICE_DEAFEN_MEMBER,
}

export { ServerPermissions, CategoryPermissions, ChannelPermissions };
