"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readMessages = void 0;
const graphql_1 = __importDefault(require("../../utils/graphql"));
const mutations_1 = require("../../graphql/mutations");
const readMessages = async (req, res, next) => {
    const user_id = res.locals.uid;
    const { message_id } = req.body;
    const channel = res.locals.channelObject;
    if (!channel.conversation_id) {
        res.status(404).json({
            message: "Channel does not have a conversation. Please delete and create a new channel.",
        });
        return;
    }
    try {
        const requestBody = {
            input: {
                user_id: user_id,
                conversation_id: channel.conversation_id,
                message_id: message_id,
            },
        };
        const response = await (0, graphql_1.default)().request(mutations_1.messageMutations.READ_MESSAGE, requestBody);
        if (!response) {
            res.status(404).json({
                message: "Error reading messages.",
            });
            return;
        }
        res.status(204).send();
        return;
    }
    catch (error) {
        console.error("Error reading messages: ", error.message);
        res.status(500).json({
            message: "Error reading messages.",
        });
        return;
    }
};
exports.readMessages = readMessages;
