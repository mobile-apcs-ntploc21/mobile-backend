import { Server } from 'socket.io';

import { PORT } from './lib/config';

const io = new Server({ cors: { origin: '*' } });

io.listen(PORT);

console.log(`Socket is listening on port ${PORT}...`);
