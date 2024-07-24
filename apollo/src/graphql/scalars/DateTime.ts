import { GraphQLScalarType, Kind } from 'graphql';

const DateTime = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime custom scalar type',
  serialize(value: any) {
    // Convert outgoing DateTime to ISO string
    return value instanceof Date ? value.toISOString() : null;
  },
  parseValue(value: any) {
    // Convert incoming ISO string to Date
    return typeof value === 'string' ? new Date(value) : null;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      // Convert literal ISO string to Date
      return new Date(ast.value);
    }
    return null;
  },
});

export default DateTime;
