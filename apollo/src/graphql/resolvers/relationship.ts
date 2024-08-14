import {IResolvers} from '@graphql-tools/utils';
import RelationshipModel, {RelationshipType} from "../../models/relationship";
import UserModel from "../../models/user";

const relationshipResolvers: IResolvers = {
    Query: {
        getRelationshipType: async (_, { user_first_id, user_second_id }) => {
            const relationship = await RelationshipModel.findOne({
                '_id.user_first_id': user_first_id,
                '_id.user_second_id': user_second_id,
            });

            return relationship ? relationship.type : null;
        },

        getAllFriends: async (_, { user_id }) => {
            const relationships = await RelationshipModel.find({
                $or: [
                    { '_id.user_first_id': user_id, type: RelationshipType.FRIEND },
                    { '_id.user_second_id': user_id, type: RelationshipType.FRIEND },
                ],
            });

            // Use Promise.all to fetch all friends in parallel
            const friends = await Promise.all(relationships.map(async ({ _id }) => {
                const friendId = _id.user_first_id === user_id ? _id.user_second_id : _id.user_first_id;
                const friend = await UserModel.findById(friendId); // Fetch the friend from the UserModel
                return { id: friendId, username: friend.username }; // Return the id and username
            }));

            return friends;
        },

        getReceivedFriendRequests: async (_, { user_id }) => {
            const relationships = await RelationshipModel.find({
                $or: [
                    { '_id.user_second_id': user_id, type: RelationshipType.PENDING_FIRST_SECOND },
                    { '_id.user_first_id': user_id, type: RelationshipType.PENDING_SECOND_FIRST },
                ],
            });

            // Use Promise.all to fetch all friends in parallel
            const friends = await Promise.all(relationships.map(async ({ _id }) => {
                const friendId = _id.user_first_id === user_id ? _id.user_second_id : _id.user_first_id;
                const friend = await UserModel.findById(friendId); // Fetch the friend from the UserModel
                return { id: friendId, username: friend.username }; // Return the id and username
            }));

            return friends;
        },

        getSentFriendRequests: async (_, { user_id }) => {
            const relationships = await RelationshipModel.find({
                $or: [
                    { '_id.user_first_id': user_id, type: RelationshipType.PENDING_FIRST_SECOND },
                    { '_id.user_second_id': user_id, type: RelationshipType.PENDING_SECOND_FIRST },
                ],
            });

            console.log(relationships);

            // Use Promise.all to fetch all friends in parallel
            const friends = await Promise.all(relationships.map(async ({ _id }) => {
                const friendId = _id.user_first_id === user_id ? _id.user_second_id : _id.user_first_id;
                const friend = await UserModel.findById(friendId); // Fetch the friend from the UserModel
                return { id: friendId, username: friend.username }; // Return the id and username
            }));

            return friends;
        },

        getBlockedUsers: async (_, { user_id }) => {
            const relationships = await RelationshipModel.find({
                $or: [
                    { '_id.user_first_id': user_id, type: RelationshipType.BLOCK_FIRST_SECOND },
                    { '_id.user_second_id': user_id, type: RelationshipType.BLOCK_SECOND_FIRST },
                ],
            });

            // Use Promise.all to fetch all friends in parallel
            const friends = await Promise.all(relationships.map(async ({ _id }) => {
                const friendId = _id.user_first_id === user_id ? _id.user_second_id : _id.user_first_id;
                const friend = await UserModel.findById(friendId); // Fetch the friend from the UserModel
                return { id: friendId, username: friend.username }; // Return the id and username
            }));

            return friends;
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