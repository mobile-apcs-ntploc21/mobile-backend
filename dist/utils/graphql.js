"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = graphQLClient;
const graphql_request_1 = require("graphql-request");
const config_1 = __importDefault(require("../config"));
function graphQLClient(token) {
    return new graphql_request_1.GraphQLClient(`${config_1.default.GQL_SERVER_URL}/graphql`, {
        headers: {
            ...(token && { authorization: `Bearer ${token}` }),
        },
    });
}
