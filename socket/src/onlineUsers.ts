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

export const getUser = (socketId: string) => {
  return onlineUsers.find(({ infos }) =>
    infos.some((info) => info.socketId === socketId)
  );
};

export const addSocket = (userId: string, socketId: string) => {
  console.log('Add user:', userId);
  const user = onlineUsers.find((user) => user.userId === userId);
  const newInfo = { socketId, lastSeen: new Date() };
  let flag = false;
  if (user) user.infos.push(newInfo);
  else {
    flag = true;
    onlineUsers.push({ userId, infos: [newInfo] });
  }
  return flag;
};

export const removeSocket = (socketId: string) => {
  console.log('Remove socket id:', socketId);
  const user = getUser(socketId);
  if (!user) throw new Error(`Remove socket id ${socketId} but not found!`);
  user.infos = user.infos.filter((info) => info.socketId !== socketId);
  let flag = false;
  if (user.infos.length === 0) {
    onlineUsers = onlineUsers.filter((user) => user.userId !== user.userId);
    flag = true;
  }
  return flag;
};

export const pingSocket = (socketId: string) => {
  console.log('Ping socket id:', socketId);
  const user = getUser(socketId);
  if (!user) throw new Error(`Ping socket id ${socketId} but not found!`);
  user.infos = user.infos.map((info) => {
    if (info.socketId === socketId) info.lastSeen = new Date();
    return info;
  });
};

export const getOnlineUsers = () => onlineUsers.map((user) => user.userId);

export const cleanUp = () => {
  const now = new Date();
  const oldLength = onlineUsers.length;
  onlineUsers = onlineUsers
    .map((user) => {
      user.infos = user.infos.filter(
        (info) => now.getTime() - info.lastSeen.getTime() < THRESHOLD_HEARTBEAT
      );
      return user;
    })
    .filter((user) => user.infos.length > 0);
  return oldLength !== onlineUsers.length;
};
