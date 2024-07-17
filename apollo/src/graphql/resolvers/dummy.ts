import { IResolvers } from '@graphql-tools/utils';
import { getAsyncIterator } from '../pubsub/user_status';

const dummyResolver_Ws: IResolvers = {
  Subscription: {
    _: {
      subscribe: () => getAsyncIterator([]),
    },
  },
};

export { dummyResolver_Ws };
