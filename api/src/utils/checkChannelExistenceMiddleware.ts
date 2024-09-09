import { Request, Response, NextFunction } from "express";
import graphQLClient from "../utils/graphql";
import { serverChannelQueries } from "../graphql/queries";

export const checkChannelExistenceMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { channelId } = req.params;

  // We already have the channel_id in res.locals, so we skip fetching it again
  if (res.locals?.channel_id === channelId) {
    return next();
  }

  try {
    const { getChannel: channel } = await graphQLClient().request(
      serverChannelQueries.GET_CHANNEL,
      {
        channel_id: channelId,
      }
    );

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    res.locals.channel_id = channelId;
    res.locals.channelObject = channel;

    next();
  } catch (error) {
    return next(error);
  }
};
