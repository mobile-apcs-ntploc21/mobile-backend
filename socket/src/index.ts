import { Server } from 'socket.io';

import { PORT } from './lib/config';
import { addUser, getOnlineUsers, pingUser, removeUser } from './onlineUsers';

const io = new Server({ cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);

  // Add new user to the online users list
  socket.on('add-user', addUser);

  // Get all online users
  socket.on('get-online-users', () => {
    socket.emit('online-users', getOnlineUsers());
  });

  // Receive heart beat from the client
  socket.on('ping', (userId: string) => {
    pingUser(userId, socket.id);
  });

  socket.on('disconnect', (userId: string) => {
    console.log(`Disconnect id: ${socket.id}`);
    removeUser(userId, socket.id);
  });
});

io.listen(PORT);

console.log(`Socket is listening on port ${PORT}...`);
