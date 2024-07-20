import http from "http";
import { useServer } from "graphql-ws/lib/use/ws";
import { WebSocketServer } from "ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import ShortUniqueId from "short-unique-id";

import { wsTypedefs } from "./graphql/typedefs";
import { wsResolvers } from "./graphql/resolvers";
import { config } from "./config";
import { AuthStatus, validateToken } from "./utils/auth";

const startWsServer = (server: http.Server) => {
  const wss = new WebSocketServer({
    server,
    path: config.WEBSOCKET_ROUTE,
  });

  wss.on("connection", (ws: WebSocketServer) => {
    ws.socketId = new ShortUniqueId().randomUUID();
    console.log(`New client ${ws.socketId} connected.`);

    // Listen for messages from the client
    ws.on("message", async (data) => {
      // Ensure the message is treated as a string
      const message = data.toString();
      console.log(`Received message from client ${ws.socketId}: ${message}`);

      // If the message is expected to be a JSON string, you can parse it
      try {
        const { payload, type } = JSON.parse(message);
        if (type !== "connection_init") return;
        // Now 'payload' is the object sent by the client
        // You can perform your logic here, for example, validating a token
        const authResult = await validateToken(payload?.token);

        ws.send(
          JSON.stringify({
            status: authResult.status,
            token: payload?.token,
            message: authResult.message,
          })
        );

        if (authResult.status === AuthStatus.FAILED) {
          ws.close(4403, authResult.message);
          return;
        }
      } catch (error) {
        console.error(
          `Error parsing message from client ${ws.socketId}:`,
          error
        );
        ws.close(4500, "Internal Server Error");
      }
    });

    ws.on("close", () => {
      console.log(`Client ${ws.socketId} disconnected.`);
    });
  });

  const schema = makeExecutableSchema({
    typeDefs: wsTypedefs,
    resolvers: wsResolvers,
  });

  return useServer(
    {
      schema,
    },
    wss
  );
};

export default startWsServer;
