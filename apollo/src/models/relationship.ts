import mongoose, { model, Schema } from "mongoose";
import validator from "validator";

interface IRelationship {
    _id: { user_first_id: string, user_second_id: string };
    type: "PENDING_FIRST_SECOND" | "PENDING_SECOND_FIRST" | "FRIEND" | "BLOCK_FIRST_SECOND" | "BLOCK_SECOND_FIRST";
    last_modified: Date;
}

const relationshipSchema = new Schema<IRelationship>(
    {
        _id: {
            user_first_id: {
                type: String,
                required: true,
            },
            user_second_id: {
                type: String,
                required: true,
            },
        },
        type: {
            type: String,
            enum: ["PENDING_FIRST_SECOND", "PENDING_SECOND_FIRST", "FRIEND", "BLOCK_FIRST_SECOND", "BLOCK_SECOND_FIRST"],
            required: true,
        },
        last_modified: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true, _id: false }
);

const RelationshipModel = mongoose.model<IRelationship>("Relationship", relationshipSchema);
export default RelationshipModel;
