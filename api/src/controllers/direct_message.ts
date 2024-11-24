import express from 'express';

import graphQLClient from '@/utils/graphql';
import { directMessageQueries } from '@/graphql/queries';
import { directMessageMutations } from '@/graphql/mutations';
import { log } from '@/utils/log';

const _getDirectMessage = async (conversationId: string) => {
    const response = await graphQLClient().request(directMessageQueries.GET_DIRECT_MESSAGE, {
        conversation_id: conversationId,
    });

    return response.directMessage;
}

const _getDirectMessages = async (userId: string) => {
    const response = await graphQLClient().request(directMessageQueries.GET_DIRECT_MESSAGES, {
        user_id: userId,
    });

    return response.directMessages;
}

export const getDirectMessage = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    const { conversationId } = req.params;

    if (!conversationId) {
        res.status(400).json({ error: 'Conversation ID is required!' });
        return;
    }

    try {
        const directMessage = await _getDirectMessage(conversationId).catch(() => null);
        if (!directMessage) {
            res.status(404).json({ error: 'Direct message not found!' });
            return;
        }
        res.status(200).json(directMessage);
    } catch (error) {
        next(error);
    }
}

export const getDirectMessages = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    const { userId } = req.params;
    try {
        const directMessages = await _getDirectMessages(userId);
        res.status(200).json(directMessages);
    } catch (error) {
        next(error);
    }
}

export const createDirectMessage = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    const { user_first_id, user_second_id } = req.body;

    if (!user_first_id || !user_second_id) {
        res.status(400).json({ error: 'User IDs are required!' });
        return;
    }

    try {
        const response = await graphQLClient().request(directMessageMutations.CREATE_DIRECT_MESSAGE, {
            user_first_id,
            user_second_id,
        });

        res.status(201).json(response.createDirectMessage);
    } catch (error) {
        next(error);
    }
}

export const deleteDirectMessage = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    const { conversationId } = req.params;

    if (!conversationId) {
        res.status(400).json({ error: 'Conversation ID is required!' });
        return;
    }

    try {
        await graphQLClient().request(directMessageMutations.DELETE_DIRECT_MESSAGE, {
            conversation_id: conversationId,
        });

        res.status(204).end();
    } catch (error) {
        next(error);
    }
}