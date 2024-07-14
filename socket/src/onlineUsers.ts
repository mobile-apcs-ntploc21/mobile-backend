import { THRESHOLD_HEARTBEAT } from './lib/config';

type Info = {
  socketId: string;
  lastSeen: Date;
};

export type OnlineUser = {
  userId: string;
  infos: Info[];
};

let onlineUsers: OnlineUser[] = [];

const genInfo = (socketId: string) => {
  return { socketId, lastSeen: new Date() };
};

export const addUser = (userId: string, socketId: string) => {
  let user = onlineUsers.find((user) => user.userId === userId);
  if (user) user.infos.push(genInfo(socketId));
  else onlineUsers.push({ userId, infos: [genInfo(socketId)] });
};

export const removeUser = (userId: string, socketId: string) => {
  let user = onlineUsers.find((user) => user.userId === userId);
  if (user) {
    user.infos = user.infos.filter((info) => info.socketId !== socketId);
    if (user.infos.length === 0)
      onlineUsers = onlineUsers.filter((user) => user.userId !== userId);
  }
};

export const pingUser = (userId: string, socketId: string) => {
  let user = onlineUsers.find((user) => user.userId === userId);
  if (user) {
    let info = user.infos.find((info) => info.socketId === socketId);
    if (info) info.lastSeen = new Date();
  }
};

export const getOnlineUsers = () => onlineUsers.map((user) => user.userId);

setInterval(() => {
  onlineUsers = onlineUsers.filter((user) => {
    let now = new Date();
    user.infos = user.infos.filter(
      (info) => now.getTime() - info.lastSeen.getTime() < THRESHOLD_HEARTBEAT
    );
    return user.infos.length > 0;
  });
  console.log('After clean up:', onlineUsers);
}, THRESHOLD_HEARTBEAT);
