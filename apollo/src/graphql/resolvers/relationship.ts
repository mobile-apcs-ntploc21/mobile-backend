import {IResolvers} from '@graphql-tools/utils';
import RelationshipModel, {RelationshipType} from "../../models/relationship";
import UserProfileModel from "../../models/user_profile";
import {UserInputError} from "apollo-server";
import {defaultProfile} from "@/graphql/resolvers/user_profile";
import {PubSub} from "graphql-subscriptions";

const pubsub = new PubSub();

const relationshipResolverAPI: IResolvers = {
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
            return await Promise.all(relationships.map(async ({_id}) => {
                const friend_id = _id.user_first_id.toString() === user_id ? _id.user_second_id : _id.user_first_id;
                const friend = await UserProfileModel.findOne({
                    user_id: friend_id,
                    server_id: null,
                });

                return {
                    id: friend_id,
                    username: friend.username,
                    display_name: friend.display_name,
                    avatar_url: friend.avatar_url,
                    banner_url: friend.banner_url,
                    about_me: friend.about_me,
                };
            }));
        },

        getReceivedFriendRequests: async (_, { user_id }) => {
            const relationships = await RelationshipModel.find({
                $or: [
                    { '_id.user_second_id': user_id, type: RelationshipType.PENDING_FIRST_SECOND },
                    { '_id.user_first_id': user_id, type: RelationshipType.PENDING_SECOND_FIRST },
                ],
            });

            // Use Promise.all to fetch all friends in parallel
            return await Promise.all(relationships.map(async ({_id}) => {
                const friend_id = _id.user_first_id.toString() === user_id ? _id.user_second_id : _id.user_first_id;
                const friend = await UserProfileModel.findOne({
                    user_id: friend_id,
                    server_id: null,
                });

                return {
                    id: friend_id,
                    username: friend.username,
                    display_name: friend.display_name,
                    avatar_url: friend.avatar_url,
                    banner_url: friend.banner_url,
                    about_me: friend.about_me,
                };
            }));
        },

        getSentFriendRequests: async (_, { user_id }) => {
            const relationships = await RelationshipModel.find({
                $or: [
                    { '_id.user_first_id': user_id, type: RelationshipType.PENDING_FIRST_SECOND },
                    { '_id.user_second_id': user_id, type: RelationshipType.PENDING_SECOND_FIRST },
                ],
            });

            // Use Promise.all to fetch all friends in parallel
            return await Promise.all(relationships.map(async ({_id}) => {
                const friend_id = _id.user_first_id.toString() === user_id ? _id.user_second_id : _id.user_first_id;
                const friend = await UserProfileModel.findOne({
                    user_id: friend_id,
                    server_id: null,
                });

                return {
                    id: friend_id,
                    username: friend.username,
                    display_name: friend.display_name,
                    avatar_url: friend.avatar_url,
                    banner_url: friend.banner_url,
                    about_me: friend.about_me,
                };
            }));
        },

        getBlockedUsers: async (_, { user_id }) => {
            const relationships = await RelationshipModel.find({
                $or: [
                    { '_id.user_first_id': user_id, type: RelationshipType.BLOCK_FIRST_SECOND },
                    { '_id.user_second_id': user_id, type: RelationshipType.BLOCK_SECOND_FIRST },
                ],
            });

            // Use Promise.all to fetch all friends in parallel
            return await Promise.all(relationships.map(async ({_id}) => {
                const friend_id = _id.user_first_id.toString() === user_id ? _id.user_second_id : _id.user_first_id;
                const friend = await UserProfileModel.findOne({
                    user_id: friend_id,
                    server_id: null,
                });

                return {
                    id: friend_id,
                    username: friend.username,
                    display_name: friend.display_name,
                    avatar_url: friend.avatar_url,
                    banner_url: friend.banner_url,
                    about_me: friend.about_me,
                };
            }));
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
            return RelationshipModel.findOneAndDelete({
                '_id.user_first_id': user_first_id,
                '_id.user_second_id': user_second_id,
            });
        },
    },
};

const relationshipResolverWs: IResolvers = {
    // ObjectId,
    Subscription: {
        friendListChanged: {
            subscribe: async (_, { user_id }) => {
                try {
                    // to be updated
                    return pubsub.asyncIterator(
                      `FRIEND_LIST_CHANGED // TO BE UPDATED`
                    );
                } catch (err) {
                    throw new Error(
                      "Error subscribing to friend list updates. Maybe check the user ID or the result of the query."
                    );
                }
            },
        },
    },
};


export default { API: relationshipResolverAPI, WS: relationshipResolverWs };