import express from "express";
import graphQLClient from "../../utils/graphql";

import { messageMutations } from "../../graphql/mutations";

// ====================

export const readMessages = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const user_id = res.locals.uid;
  const { message_id } = req.body;

  const channel = res.locals.channelObject;
  if (!channel.conversation_id) {
    return res.status(404).json({
      message:
        "Channel does not have a conversation. Please delete and create a new channel.",
    });
  }

  try {
    const requestBody = {
      user_id: user_id,
      conversation_id: channel.conversation_id,
      message_id: message_id,
    };

    const response = await graphQLClient().request(
      messageMutations.READ_MESSAGE,
      requestBody
    );

    if (!response) {
      return res.status(404).json({
        message: "Error reading messages.",
      });
    }

    return res.status(204).send();
  } catch (error: any) {
    console.error("Error reading messages: ", error.message);
    return res.status(500).json({
      message: "Error reading messages.",
    });
  }
};
