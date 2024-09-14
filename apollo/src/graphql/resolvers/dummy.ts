import { IResolvers } from "@graphql-tools/utils";
import { getAsyncIterator, UserEvents } from "../pubsub/pubsub";
import { withFilter } from "graphql-subscriptions";
import { GraphQLJSON } from "graphql-scalars";

const dummyResolver_Ws: IResolvers = {
  JSON: GraphQLJSON,
  Subscription: {
    _: {
      resolve: (payload, args, context, info) => {
        return {
          ...payload,
        };
      },
      async subscribe(rootValue, args, context) {
        return withFilter(
          () => {
            return getAsyncIterator(Object.values(UserEvents));
          },
          async (payload, variables, context) => {
            // Payload is the event object
            const user_id = payload?.user_id || null;

            // Variables is the subscription variables
            const v_user_id = variables?.user_id || null;

            console.log("payload", payload);
            console.log("variables", variables);

            // Check if the user_id is in the list of user_id
            return Array.isArray(user_id)
              ? user_id.includes(v_user_id)
              : user_id === v_user_id;
          }
        )(rootValue, args, context);
      },
    },
  },
};

export { dummyResolver_Ws };
