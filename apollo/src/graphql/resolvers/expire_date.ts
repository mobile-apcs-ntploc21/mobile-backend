import mongoose, { Error } from "mongoose";
import { IResolvers } from "@graphql-tools/utils";
import { UserInputError, ValidationError } from "apollo-server";
import ExpireDateModel, { ExpirableType } from "@/models/expire_date";
import UserStatusModel from "@/models/user_status";

const cleanupStatusText = async (object_id: string) => {
  try {
    await UserStatusModel.findOneAndUpdate(
      { _id: object_id },
      { status_text: "" }
    );
  } catch (error: any) {
    throw new Error(error);
  }
};

type ResolveFunction = (object_id: string) => Promise<void>;

const FunctionMap: Record<ExpirableType, ResolveFunction> = {
  [ExpirableType.STATUS_TEXT]: cleanupStatusText,
  // Add more as needed
};

export const expireDateResolver: IResolvers = {
  Query: {
    expireDate: async (_, { object_id }) => {
      try {
        const res = await ExpireDateModel.findOne({
          "object.object_id": object_id,
        });

        return res;
      } catch (error: any) {
        throw new Error(error);
      }
    },
  },
  Mutation: {
    setExpireDate: async (_, { object_type, object_id, expire_date }) => {
      if (
        !Object.values(ExpirableType).includes(object_type as ExpirableType)
      ) {
        throw new UserInputError("Invalid object type");
      }

      if (new Date(expire_date) < new Date()) {
        throw new ValidationError("Expire date must be in the future");
      }

      try {
        const res = await ExpireDateModel.findOneAndUpdate(
          {
            object_type,
            "object.object_id": object_id,
          },
          {
            $set: {
              object_type,
              object: {
                object_id,
                expire_date: new Date(expire_date),
              },
            },
          },
          {
            new: true,
            upsert: true,
          }
        );

        return res;
      } catch (error: any) {
        throw new Error(error);
      }
    },
    resolveExpired: async (_) => {
      const now = new Date();

      try {
        const res = await ExpireDateModel.find({
          "object.expire_date": { $lte: now, $ne: null },
        });

        const resolve = await ExpireDateModel.updateMany(
          {
            "object.expire_date": { $lte: now, $ne: null },
          },
          {
            $set: {
              "object.expire_date": null,
            },
          }
        );

        if (!res) {
          return null;
        }

        for (const item of res) {
          const { object_type, object } = item;

          if (object_type in FunctionMap) {
            await FunctionMap[object_type as ExpirableType](
              object.object_id.toString()
            );
          }
        }

        return res;
      } catch (error: any) {
        throw new Error(error);
      }
    },
  },
};

export default expireDateResolver;
