import { Server } from 'socket.io';

import { PORT, THRESHOLD_HEARTBEAT } from './lib/config';
import {
  addSocket,
  cleanUp,
  getOnlineUsers,
  pingSocket,
  removeSocket,
} from './onlineUsers';
import EVENTS from './constants/events';

const io = new Server({ cors: { origin: '*' } });

const handleChange = (flag: boolean) => {
  if (flag) {
    console.log('Number of online users changed!');
    io.emit(EVENTS.onlineUsers, getOnlineUsers());
  } else console.log('Number of online users not changed!');
};

io.on(EVENTS.connection, (socket) => {
  console.log(`New connection: ${socket.id}`);

  // Add new user to the online users list
  socket.on(EVENTS.addNewSocket, (userId) =>
    handleChange(addSocket(userId, socket.id))
  );

  // Receive heart beat from the client
  socket.on(EVENTS.ping, () => pingSocket(socket.id));

  socket.on(EVENTS.disconnect, () => handleChange(removeSocket(socket.id)));
});

setInterval(() => handleChange(cleanUp()), THRESHOLD_HEARTBEAT);

io.listen(PORT);

console.log(`Socket is listening on port ${PORT}...`);
