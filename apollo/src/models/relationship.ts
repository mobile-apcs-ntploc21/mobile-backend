import mongoose, { model, Schema } from "mongoose";
import validator from "validator";
import ModelNames from "./modelNames";

export enum RelationshipType {
  PENDING_FIRST_SECOND = "PENDING_FIRST_SECOND",
  PENDING_SECOND_FIRST = "PENDING_SECOND_FIRST",
  FRIEND = "FRIEND",
  BLOCK_FIRST_SECOND = "BLOCK_FIRST_SECOND",
  BLOCK_SECOND_FIRST = "BLOCK_SECOND_FIRST",
}

interface IRelationship {
  _id: { user_first_id: Schema.Types.ObjectId; user_second_id: Schema.Types.ObjectId };
  type: RelationshipType;
  last_modified: Date;
}

const relationshipSchema = new Schema<IRelationship>(
  {
    _id: {
      user_first_id: {
        type: Schema.Types.ObjectId,
        ref: ModelNames.User,
        required: [true, "User ID for user 1 is required!"],
      },
      user_second_id: {
        type: Schema.Types.ObjectId,
        ref: ModelNames.User,
        required: [true, "User ID for user 2 is required!"],
      },
    },
    type: {
      type: String,
      enum: Object.values(RelationshipType),
      required: true,
    },
    last_modified: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true, _id: false }
);

const RelationshipModel = mongoose.model<IRelationship>(
  ModelNames.Relationship,
  relationshipSchema
);
export default RelationshipModel;
