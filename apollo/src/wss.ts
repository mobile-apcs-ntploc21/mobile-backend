import http from 'http';
import { useServer } from 'graphql-ws/lib/use/ws';
import { WebSocketServer } from 'ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import ShortUniqueId from 'short-unique-id';
import { GraphQLError } from 'graphql';
import { WebSocket } from 'ws';

import { wsTypeDefs } from './graphql/typedefs';
import { wsResolvers } from './graphql/resolvers';
import { config } from './config';
import { getUserIdByToken } from './utils/auth';
import { wsLogger } from './utils';
import { userComeBack, userLeave, userSendPong } from './utils/user_status';
import { CloseCode } from 'graphql-ws';

const startWsServer = (server: http.Server) => {
  const wss = new WebSocketServer({ server, path: config.WEBSOCKET_ROUTE });

  wss.on('connection', (ws) => {
    const socketId = new ShortUniqueId().rnd();
    // @ts-ignore
    ws.socketId = socketId;

    wsLogger(`New client ${socketId} connected.`);

    let isAlive = true;
    const checkAlive = setInterval(() => {
      wsLogger(`Checking if client ${socketId} is alive...`);
      if (!isAlive) {
        // @ts-ignore
        userLeave(ws.thisUserId);
        wsLogger(
          `Terminating connection ${socketId} due to no ping after ${
            config.PING_INTERVAL / 1000
          } seconds...`
        );
        return ws.close(4000, 'Client did not send ping in time.');
      }
      isAlive = false;
      wsLogger(`Sending ping to client ${socketId}...`);
      ws.ping();
    }, config.PING_INTERVAL);

    // Listen for messages from the client
    ws.on('message', async (data) => {
      // Ensure the message is treated as a string
      const message = data.toString();
      wsLogger(`Received message from client ${socketId}: ${message}`);
    });

    ws.on('pong', () => {
      // @ts-ignore
      wsLogger(`Received pong from client ${ws.socketId}.`);

      // @ts-ignore
      userSendPong(ws.thisUserId);
      isAlive = true;
    });

    ws.on('close', () => {
      // @ts-ignore
      wsLogger(`Client ${ws.socketId} disconnected.`);
      // @ts-ignore
      userLeave(ws.thisUserId);
      clearInterval(checkAlive);
    });
  });

  const schema = makeExecutableSchema({
    typeDefs: wsTypeDefs,
    resolvers: wsResolvers,
  });
  return useServer(
    {
      schema,
      onConnect: async (ctx) => {
        // Simplified token extraction logic
        const rawHeaderToken = ctx?.extra?.request?.rawHeaders.find((header) =>
          header.startsWith('Bearer ')
        );
        const rawToken = (rawHeaderToken ||
          ctx.connectionParams?.authorization) as string;

        wsLogger(`Raw token: ${rawToken}`);

        try {
          const thisUserId = await getUserIdByToken(rawToken?.split(' ')[1]);

          wsLogger(`User ID: ${thisUserId} authenticated.`);

          // Assuming ctx.extra.socket is correctly typed to allow assignment to thisUserId
          // @ts-ignore
          ctx.thisUserId = ctx.extra.socket.thisUserId = thisUserId;
          userComeBack(thisUserId);
        } catch (error) {
          console.error('Authentication failed', error);
          ctx.extra.socket.close(CloseCode.Unauthorized, error);
        }
      },
    },
    wss
  );
};

export default startWsServer;
