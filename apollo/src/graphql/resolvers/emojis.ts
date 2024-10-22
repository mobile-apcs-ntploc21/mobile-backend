import mongoose, { Error } from "mongoose";
import { IResolvers } from "@graphql-tools/utils";
import { UserInputError, ValidationError } from "apollo-server";

import ServerEmojiModel from "@/models/servers/serverEmoji";
import ServerModel from "@/models/servers/server";
import EmojiModel from "@/models/emojis";
import { publishEvent, ServerEvents } from "../pubsub/pubsub";

// Declare maximum number of emojis in a server
const SERVER_MAX_EMOJI = 20;
const SERVER_PREMIUM_MAX_EMOJI = 100;

const createEmojiTransaction = async (
  emoji_name: string,
  image_url: string,
  server_id: string,
  uploader_id: string
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Initialize new opts
    const opts = { session, new: true };

    // Check if that server exists
    const serverObj = await ServerModel.findById(server_id).session(session);
    if (!serverObj) {
      throw new UserInputError(
        "Server with given server_id was not found on the database."
      );
    }

    // Upload the emoji into the database
    const [emoji] = await EmojiModel.create(
      [
        {
          name: emoji_name,
          image_url: image_url,
          server_id: server_id,
          uploader_id: uploader_id,
          type: "server",
        },
      ],
      opts
    );

    // Check if the server has reached the emoji limit
    if (serverObj.totalEmojis ?? 0 >= SERVER_MAX_EMOJI) {
      throw new ValidationError(
        "Server with given server_id has reached maximum nubmer of emojis allowed."
      );
    }

    // Increment the emoji count
    // @ts-ignore
    serverObj.totalEmojis += 1;
    await serverObj.save({ session });

    await session.commitTransaction();
    session.endSession();

    return emoji;
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const updateEmojiTransaction = async (emoji_id: string, emoji_name: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const opts = { session, new: true };

    // Search for the emoji
    const emojiObj = await EmojiModel.findByIdAndUpdate(
      emoji_id,
      {
        name: emoji_name,
      },
      opts
    );

    if (!emojiObj) {
      throw new UserInputError(
        "Emoji with given emoji_id was not found on the database"
      );
    }

    await session.commitTransaction();
    session.endSession();

    return emojiObj;
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const deleteEmojiTransaction = async (emoji_id: string): Promise<any> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if the emoji has been deleted
    const emoji = await ServerEmojiModel.findById(emoji_id).session(session);
    if (!emoji) {
      throw new UserInputError("Emoji not found.");
    }

    if (emoji.is_deleted) {
      throw new UserInputError("Emoji has been deleted.");
    }

    // Create a new name for the emojis to avoid conflict.
    // Example: deleted_1663877070_123
    const new_name = `deleted_${Date.now()}_${Math.floor(
      Math.random() * 1000
    )}`;

    // Update the emoji
    emoji.name = new_name;
    emoji.is_deleted = true;
    // @ts-ignore
    emoji.uploader_id = null;
    await emoji.save({ session });

    // Decrement emoji count
    await ServerModel.findByIdAndUpdate(
      emoji.server_id,
      {
        $inc: { totalEmojis: -1 },
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return emoji;
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const hardDeleteEmojiTransaction = async (emoji_id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Search the emoji and delete
    const emojiObj = await ServerEmojiModel.findByIdAndDelete(emoji_id);

    if (!emojiObj) {
      throw new UserInputError("Emoji not found on the database.");
    }

    // Decrement emoji count
    await ServerModel.findByIdAndUpdate(emojiObj.server_id, {
      $inc: { totalEmojis: -1 },
    });

    await session.commitTransaction();
    session.endSession();

    return true;
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const syncUnicodeEmoji = async () => {};

const emojisAPI: IResolvers = {
  Query: {
    serverEmoji: async (_, { server_id, emoji_id }) => {
      try {
        const emoji = await EmojiModel.findOne({
          _id: emoji_id,
          server_id,
        });

        if (!emoji) {
          throw new UserInputError("Emoji not found.");
        }

        return emoji;
      } catch (error: any) {
        throw new Error(error);
      }
    },
    serverEmojis: async (_, { server_id }) => {
      const emojis = await EmojiModel.find({
        server_id,
        is_deleted: false,
      }).catch(() => []);

      return emojis;
    },
    countServerEmojis: async (_, { server_id }) => {
      const serverObj = await ServerModel.findById(server_id).lean();

      if (!serverObj) {
        throw new UserInputError("Server with given server_id not found.");
      }

      return serverObj.totalEmojis;
    },
  },
  Mutation: {
    createServerEmoji: async (_, { input }) => {
      try {
        // Create a transaction
        const emoji = await createEmojiTransaction(
          input.name,
          input.image_url,
          input.server_id,
          input.uploader_id
        );

        // Publish event to the websocket server
        publishEvent(ServerEvents.serverUpdated, {
          type: ServerEvents.emojiAdded,
          server_id: input.server_id,
          data: {
            ...emoji.toObject(),
          },
        });

        return emoji;
      } catch (error: any) {
        throw new Error(error);
      }
    },
    updateServerEmoji: async (_, { emoji_id, name }) => {
      try {
        const emojiObj = await updateEmojiTransaction(emoji_id, name);

        // Publish event to the websocket server
        publishEvent(ServerEvents.serverUpdated, {
          type: ServerEvents.emojiUpdated,
          server_id: emojiObj.server_id,
          data: {
            ...emojiObj.toObject(),
          },
        });

        return emojiObj;
      } catch (error: any) {
        throw new Error(error);
      }
    },
    // This function will soft delete emoji. E.g. mark the emoji's is_deleted field to true and you cannot fetch this emoji anymore.
    deleteServerEmoji: async (_, { emoji_id }) => {
      try {
        const result = deleteEmojiTransaction(emoji_id);

        // Publish event to the websocket server
        publishEvent(ServerEvents.serverUpdated, {
          type: ServerEvents.emojiDeleted,
          // @ts-ignore
          server_id: result.server_id,
          data: {
            //@ts-ignore
            ...result.toObject(),
          },
        });

        return result;
      } catch (error: any) {
        throw new Error(error);
      }
    },
    // This function will hard delete emoji. E.g. Will delete out of the database, thus even if you query search it, nothing will return.
    // Handle with care.
    hardDeleteServerEmoji: async (_, { emoji_id }) => {
      try {
        const result = hardDeleteEmojiTransaction(emoji_id);

        return result;
      } catch (error: any) {
        throw new Error(error);
      }
    },

    // This function will use to sync/upload the Unicode emoji onto the database.
    // Only run this once, and run it perodically if Unicode has a new version.
    syncUnicodeEmoji: async (_, { confirm }) => {
      if (confirm) {
        syncUnicodeEmoji();
      }
    },
  },
};

export default { API: emojisAPI };
