import { Server } from 'socket.io';

import { PORT } from './lib/config';
import {
  addSocket,
  getOnlineUsers,
  pingSocket,
  removeSocket,
} from './onlineUsers';

const io = new Server({ cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);

  // Add new user to the online users list
  socket.on('add-new-socket', (userId) => addSocket(userId, socket.id));

  // Get all online users
  socket.on('get-online-users', () => {
    socket.emit('online-users', getOnlineUsers());
  });

  // Receive heart beat from the client
  socket.on('ping', () => {
    pingSocket(socket.id);
  });

  socket.on('disconnect', () => {
    console.log(`Disconnect id: ${socket.id}`);
    removeSocket(socket.id);
  });
});

io.listen(PORT);

console.log(`Socket is listening on port ${PORT}...`);
