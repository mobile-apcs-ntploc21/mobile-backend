import { Application } from "express";

import friendRouter from "./routes/friend";
import serverRouter from "./routes/servers/server";
import serverEmojiRouter from "./routes/servers/server_emojis";
import serverBansRouter from "./routes/servers/server_bans";
import settingsRouter from "./routes/settings";
import userRouter from "./routes/user";
import userProfileRouter from "./routes/user_profile";
import userStatusRouter from "./routes/user_status";
import paymentRouter from "@/routes/payment/payments";
import packageRouter from "@/routes/payment/packages";

import cronjobRouter from "./routes/cronjob";
import { authMiddleware } from "./utils/authMiddleware";
import { checkMembershipMiddleware } from "./utils/checkMembershipMiddleware";
import config from "@/config";
import { log } from "@/utils/log";
import swaggerRouter from "./swagger";

function routing(app: Application) {
  const userRoutes = () => {
    app.use("/api/v1/users", userRouter);
    app.use("/api/v1/settings", authMiddleware, settingsRouter);
    app.use("/api/v1/", authMiddleware, userStatusRouter);
    app.use("/api/v1/", authMiddleware, friendRouter);
    app.use("/api/v1/profile/", authMiddleware, userProfileRouter);
  };

  const serverRoutes = () => {
    app.use("/api/v1/servers", serverRouter);
    app.use(
      "/api/v1/servers/:serverId/emojis",
      authMiddleware,
      checkMembershipMiddleware,
      serverEmojiRouter
    );
    app.use("/api/v1/servers", authMiddleware, serverBansRouter);
  };

  const customRoutes = () => {
    app.use("/api/v1/payments", paymentRouter);
    app.use("/api/v1/packages", authMiddleware, packageRouter);
  };

  const cronjobRoutes = () => {
    app.use("/api/v1/cronjob", cronjobRouter);
  };

  const swagger = () => {
    app.use(swaggerRouter);
  };

  customRoutes();
  cronjobRoutes();
  userRoutes();
  serverRoutes();
  swagger();
}

export default routing;
