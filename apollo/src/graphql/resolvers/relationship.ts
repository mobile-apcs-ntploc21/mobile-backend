import { IResolvers } from '@graphql-tools/utils';
import RelationshipModel from "../../models/relationship";

const relationshipResolvers: IResolvers = {
    Query: {
        getRelationshipType: async (_, { user_first_id, user_second_id }) => {
            const relationship = await RelationshipModel.findOne({
                '_id.user_first_id': user_first_id,
                '_id.user_second_id': user_second_id,
            });

            return relationship ? relationship.type : null;
        },
    },
    Mutation: {
        createRelationship: async (_, { user_first_id, user_second_id, type }) => {
            const relationship = new RelationshipModel({
                _id: {
                    user_first_id,
                    user_second_id,
                },
                type,
            });

            await relationship.save();

            return relationship;
        },

        updateRelationship: async (_, { user_first_id, user_second_id, type }) => {
            const relationship = await RelationshipModel.findOne({
                '_id.user_first_id': user_first_id,
                '_id.user_second_id': user_second_id,
            });

            if (!relationship) {
                return null;
            }

            relationship.type = type;
            await relationship.save();

            return relationship;
        },

        deleteRelationship: async (_, { user_first_id, user_second_id }) => {
            const relationship = await RelationshipModel.findOneAndDelete({
                '_id.user_first_id': user_first_id,
                '_id.user_second_id': user_second_id,
            });

            return relationship;
        },
    },
};

export default relationshipResolvers;