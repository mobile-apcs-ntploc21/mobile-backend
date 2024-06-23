import { UserInputError} from "apollo-server";
import { combineResolvers } from "graphql-resolvers";

export default {
    Query: {
        users: combineResolvers(
            async (_, __, { models }) => {
                const users = await models.User.findAll();
                if (!users) {
                    throw new UserInputError("No user found !");
                }
                return users;
            }
        ),
    }

}