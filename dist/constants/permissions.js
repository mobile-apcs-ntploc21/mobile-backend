"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelPermissions = exports.CategoryPermissions = exports.ServerPermissions = exports.BaseRolePermissions = void 0;
var PermissionStates;
(function (PermissionStates) {
    PermissionStates["ALLOWED"] = "ALLOWED";
    PermissionStates["DENIED"] = "DENIED";
    PermissionStates["DEFAULT"] = "DEFAULT";
})(PermissionStates || (PermissionStates = {}));
var BaseRolePermissions;
(function (BaseRolePermissions) {
    BaseRolePermissions["CREATE_EXPRESSION"] = "CREATE_EXPRESSION";
    BaseRolePermissions["MANAGE_EXPRESSION"] = "MANAGE_EXPRESSION";
    BaseRolePermissions["MANAGE_SERVER"] = "MANAGE_SERVER";
    BaseRolePermissions["MANAGE_INVITE"] = "MANAGE_INVITE";
    BaseRolePermissions["KICK_MEMBER"] = "KICK_MEMBER";
    BaseRolePermissions["BAN_MEMBER"] = "BAN_MEMBER";
    BaseRolePermissions["VIEW_CHANNEL"] = "VIEW_CHANNEL";
    BaseRolePermissions["MANAGE_CHANNEL"] = "MANAGE_CHANNEL";
    BaseRolePermissions["SEND_MESSAGE"] = "SEND_MESSAGE";
    BaseRolePermissions["ATTACH_FILE"] = "ATTACH_FILE";
    BaseRolePermissions["ADD_REACTION"] = "ADD_REACTION";
    BaseRolePermissions["USE_EXTERNAL_EMOJI"] = "USE_EXTERNAL_EMOJI";
    BaseRolePermissions["MENTION_ALL"] = "MENTION_ALL";
    BaseRolePermissions["MANAGE_MESSAGE"] = "MANAGE_MESSAGE";
    BaseRolePermissions["VOICE_CONNECT"] = "VOICE_CONNECT";
    BaseRolePermissions["VOICE_SPEAK"] = "VOICE_SPEAK";
    BaseRolePermissions["VOICE_VIDEO"] = "VOICE_VIDEO";
    BaseRolePermissions["VOICE_MUTE_MEMBER"] = "VOICE_MUTE_MEMBER";
    BaseRolePermissions["VOICE_DEAFEN_MEMBER"] = "VOICE_DEAFEN_MEMBER";
})(BaseRolePermissions || (exports.BaseRolePermissions = BaseRolePermissions = {}));
var GeneralServerPermissions;
(function (GeneralServerPermissions) {
    GeneralServerPermissions["CREATE_EXPRESSION"] = "CREATE_EXPRESSION";
    GeneralServerPermissions["MANAGE_EXPRESSION"] = "MANAGE_EXPRESSION";
    GeneralServerPermissions["MANAGE_SERVER"] = "MANAGE_SERVER";
    GeneralServerPermissions["VIEW_CHANNEL"] = "VIEW_CHANNEL";
    GeneralServerPermissions["MANAGE_CHANNEL"] = "MANAGE_CHANNEL";
})(GeneralServerPermissions || (GeneralServerPermissions = {}));
var MembershipPermissions;
(function (MembershipPermissions) {
    MembershipPermissions["MANAGE_INVITE"] = "MANAGE_INVITE";
    MembershipPermissions["KICK_MEMBER"] = "KICK_MEMBER";
    MembershipPermissions["BAN_MEMBER"] = "BAN_MEMBER";
})(MembershipPermissions || (MembershipPermissions = {}));
var GeneralCategoryPermissions;
(function (GeneralCategoryPermissions) {
    GeneralCategoryPermissions["VIEW_CHANNEL"] = "VIEW_CHANNEL";
    GeneralCategoryPermissions["MANAGE_CHANNEL"] = "MANAGE_CHANNEL";
})(GeneralCategoryPermissions || (GeneralCategoryPermissions = {}));
var GeneralChannelPermissions;
(function (GeneralChannelPermissions) {
    GeneralChannelPermissions["VIEW_CHANNEL"] = "VIEW_CHANNEL";
    GeneralChannelPermissions["MANAGE_CHANNEL"] = "MANAGE_CHANNEL";
})(GeneralChannelPermissions || (GeneralChannelPermissions = {}));
var TextChannelPermissions;
(function (TextChannelPermissions) {
    TextChannelPermissions["SEND_MESSAGE"] = "SEND_MESSAGE";
    TextChannelPermissions["ATTACH_FILE"] = "ATTACH_FILE";
    TextChannelPermissions["ADD_REACTION"] = "ADD_REACTION";
    TextChannelPermissions["USE_EXTERNAL_EMOJI"] = "USE_EXTERNAL_EMOJI";
    TextChannelPermissions["MENTION_ALL"] = "MENTION_ALL";
    TextChannelPermissions["MANAGE_MESSAGE"] = "MANAGE_MESSAGE";
})(TextChannelPermissions || (TextChannelPermissions = {}));
var VoiceChannelPermissions;
(function (VoiceChannelPermissions) {
    VoiceChannelPermissions["VOICE_CONNECT"] = "VOICE_CONNECT";
    VoiceChannelPermissions["VOICE_SPEAK"] = "VOICE_SPEAK";
    VoiceChannelPermissions["VOICE_VIDEO"] = "VOICE_VIDEO";
    VoiceChannelPermissions["VOICE_MUTE_MEMBER"] = "VOICE_MUTE_MEMBER";
    VoiceChannelPermissions["VOICE_DEAFEN_MEMBER"] = "VOICE_DEAFEN_MEMBER";
})(VoiceChannelPermissions || (VoiceChannelPermissions = {}));
var ServerPermissions;
(function (ServerPermissions) {
    ServerPermissions["CREATE_EXPRESSION"] = "CREATE_EXPRESSION";
    ServerPermissions["MANAGE_EXPRESSION"] = "MANAGE_EXPRESSION";
    ServerPermissions["MANAGE_SERVER"] = "MANAGE_SERVER";
    ServerPermissions["VIEW_CHANNEL"] = "VIEW_CHANNEL";
    ServerPermissions["MANAGE_CHANNEL"] = "MANAGE_CHANNEL";
    ServerPermissions["MANAGE_INVITE"] = "MANAGE_INVITE";
    ServerPermissions["KICK_MEMBER"] = "KICK_MEMBER";
    ServerPermissions["BAN_MEMBER"] = "BAN_MEMBER";
    ServerPermissions["SEND_MESSAGE"] = "SEND_MESSAGE";
    ServerPermissions["ATTACH_FILE"] = "ATTACH_FILE";
    ServerPermissions["ADD_REACTION"] = "ADD_REACTION";
    ServerPermissions["USE_EXTERNAL_EMOJI"] = "USE_EXTERNAL_EMOJI";
    ServerPermissions["MENTION_ALL"] = "MENTION_ALL";
    ServerPermissions["MANAGE_MESSAGE"] = "MANAGE_MESSAGE";
    ServerPermissions["VOICE_CONNECT"] = "VOICE_CONNECT";
    ServerPermissions["VOICE_SPEAK"] = "VOICE_SPEAK";
    ServerPermissions["VOICE_VIDEO"] = "VOICE_VIDEO";
    ServerPermissions["VOICE_MUTE_MEMBER"] = "VOICE_MUTE_MEMBER";
    ServerPermissions["VOICE_DEAFEN_MEMBER"] = "VOICE_DEAFEN_MEMBER";
})(ServerPermissions || (exports.ServerPermissions = ServerPermissions = {}));
var CategoryPermissions;
(function (CategoryPermissions) {
    CategoryPermissions["VIEW_CHANNEL"] = "VIEW_CHANNEL";
    CategoryPermissions["MANAGE_CHANNEL"] = "MANAGE_CHANNEL";
    CategoryPermissions["SEND_MESSAGE"] = "SEND_MESSAGE";
    CategoryPermissions["ATTACH_FILE"] = "ATTACH_FILE";
    CategoryPermissions["ADD_REACTION"] = "ADD_REACTION";
    CategoryPermissions["USE_EXTERNAL_EMOJI"] = "USE_EXTERNAL_EMOJI";
    CategoryPermissions["MENTION_ALL"] = "MENTION_ALL";
    CategoryPermissions["MANAGE_MESSAGE"] = "MANAGE_MESSAGE";
    CategoryPermissions["VOICE_CONNECT"] = "VOICE_CONNECT";
    CategoryPermissions["VOICE_SPEAK"] = "VOICE_SPEAK";
    CategoryPermissions["VOICE_VIDEO"] = "VOICE_VIDEO";
    CategoryPermissions["VOICE_MUTE_MEMBER"] = "VOICE_MUTE_MEMBER";
    CategoryPermissions["VOICE_DEAFEN_MEMBER"] = "VOICE_DEAFEN_MEMBER";
})(CategoryPermissions || (exports.CategoryPermissions = CategoryPermissions = {}));
var ChannelPermissions;
(function (ChannelPermissions) {
    ChannelPermissions["VIEW_CHANNEL"] = "VIEW_CHANNEL";
    ChannelPermissions["MANAGE_CHANNEL"] = "MANAGE_CHANNEL";
    ChannelPermissions["SEND_MESSAGE"] = "SEND_MESSAGE";
    ChannelPermissions["ATTACH_FILE"] = "ATTACH_FILE";
    ChannelPermissions["ADD_REACTION"] = "ADD_REACTION";
    ChannelPermissions["USE_EXTERNAL_EMOJI"] = "USE_EXTERNAL_EMOJI";
    ChannelPermissions["MENTION_ALL"] = "MENTION_ALL";
    ChannelPermissions["MANAGE_MESSAGE"] = "MANAGE_MESSAGE";
    ChannelPermissions["VOICE_CONNECT"] = "VOICE_CONNECT";
    ChannelPermissions["VOICE_SPEAK"] = "VOICE_SPEAK";
    ChannelPermissions["VOICE_VIDEO"] = "VOICE_VIDEO";
    ChannelPermissions["VOICE_MUTE_MEMBER"] = "VOICE_MUTE_MEMBER";
    ChannelPermissions["VOICE_DEAFEN_MEMBER"] = "VOICE_DEAFEN_MEMBER";
})(ChannelPermissions || (exports.ChannelPermissions = ChannelPermissions = {}));
