import { Router } from "express";
import {
  acceptFriend,
  addFriend,
  blockUser,
  cancelFriendRequest,
  cancelReceivedFriendRequest,
  getAllFriends,
  getBlockedUsers,
  getReceivedFriendRequests,
  getRelationshipTypeApi,
  getSentFriendRequests,
  removeFriend,
  unblockUser,
} from "@/controllers/friend";

/**
 * @swagger
 * tags:
 *  name: Friends
 *
 * components:
 *  schemas:
 *    UserProfile:
 *      type: object
 *      properties:
 *        id:
 *          type: string
 *        username:
 *         type: string
 *        display_name:
 *         type: string
 *        avatar_url:
 *         type: string
 *        banner_url:
 *         type: string
 *        about_me:
 *         type: string
 *
 *    RelationshipType:
 *      type: string
 *      enum:
 *        - NOT-FRIEND
 *        - REQUEST-SENT
 *        - REQUEST-RECEIVED
 *        - FRIEND
 *        - BLOCK
 *        - UNDEFINED
 */
const friendRouter = Router();

/**
 * @swagger
 * /friends/{id}:
 *   post:
 *     summary: Add user with `id` as friend (Send friend request).
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Successful send the friend request
 *         content:
 *           application/json:
 *             example:
 *              message: Friend request sent.
 *       400:
 *          description: Bad request
 *          content:
 *            application/json:
 *              examples:
 *                cannotAddSelf:
 *                  value:
 *                    message: You cannot add yourself as a friend.
 *                cannotAdd:
 *                  value:
 *                    message: You cannot add this user as a friend.
 *       401:
 *         $ref: '#/components/responses/AuthMiddlewareError'
 *       500:
 *          description: Internal server error
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 */
friendRouter.post("/friends/:id", addFriend);

/**
 * @swagger
 * /friends/cancel/sent/{id}:
 *   delete:
 *     summary: Cancel friend request to user with `id`
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Successful cancel the sent friend request
 *         content:
 *           application/json:
 *             example:
 *              message: Friend request cancelled.
 *       400:
 *          description: Bad request
 *          content:
 *            application/json:
 *              examples:
 *                cannotCancelSelf:
 *                  value:
 *                    message: You cannot cancel friend request to yourself.
 *                cannotCancel:
 *                  value:
 *                    message: You cannot cancel friend request to this user.
 *       401:
 *         $ref: '#/components/responses/AuthMiddlewareError'
 *       500:
 *          description: Internal server error
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 */
friendRouter.post("/friends/accept/:id", acceptFriend);

/**
 * @swagger
 * /friends/accept/{id}:
 *   post:
 *     summary: Accept friend request from user with `id`
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Successful accept the friend request
 *         content:
 *           application/json:
 *             example:
 *              message: Friend request accepted.
 *       400:
 *          description: Bad request
 *          content:
 *            application/json:
 *              examples:
 *                cannotAcceptSelf:
 *                  value:
 *                    message: You cannot accept yourself as a friend.
 *                cannotAccept:
 *                  value:
 *                    message: You cannot accept this user as a friend.
 *       401:
 *         $ref: '#/components/responses/AuthMiddlewareError'
 *       500:
 *          description: Internal server error
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 */
friendRouter.delete("/friends/cancel/sent/:id", cancelFriendRequest);

/**
 * @swagger
 * /friends/cancel/received/{id}:
 *   delete:
 *     summary: Cancel received friend request from user with `id`
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Successful cancel the received friend request
 *         content:
 *           application/json:
 *             example:
 *              message: Friend request cancelled.
 *       400:
 *          description: Bad request
 *          content:
 *            application/json:
 *              examples:
 *                cannotCancelSelf:
 *                  value:
 *                    message: You cannot cancel received friend request from yourself.
 *                cannotCancel:
 *                  value:
 *                    message: You cannot cancel received friend request from this user.
 *       401:
 *         $ref: '#/components/responses/AuthMiddlewareError'
 *       500:
 *          description: Internal server error
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 */
friendRouter.delete(
  "/friends/cancel/received/:id",
  cancelReceivedFriendRequest
);

/**
 * @swagger
 * /friends/{id}:
 *   delete:
 *     summary: Remove user with `id` from friends
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Successful remove friend
 *         content:
 *           application/json:
 *             example:
 *              message: Friend removed.
 *       400:
 *          description: Bad request
 *          content:
 *            application/json:
 *              examples:
 *                cannotRemoveSelf:
 *                  value:
 *                    message: You cannot remove yourself as a friend.
 *                cannotRemove:
 *                  value:
 *                    message: You cannot remove this user as a friend.
 *       401:
 *         $ref: '#/components/responses/AuthMiddlewareError'
 *       500:
 *          description: Internal server error
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 */
friendRouter.delete("/friends/:id", removeFriend);

/* Block/Unblock */
/**
 * @swagger
 * /block/{id}:
 *   post:
 *     summary: Block user with `id`
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Successful block
 *         content:
 *           application/json:
 *             example:
 *              message: User blocked.
 *       400:
 *          description: Bad request
 *          content:
 *            application/json:
 *              examples:
 *                cannotRemoveSelf:
 *                  value:
 *                    message: You cannot block yourself.
 *                duplicateBlock:
 *                  value:
 *                    message: You have already blocked this user.
 *                isBlocked:
 *                  value:
 *                    message: You have already been blocked by this user.
 *       401:
 *         $ref: '#/components/responses/AuthMiddlewareError'
 *       500:
 *          description: Internal server error
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 */
friendRouter.post("/block/:id", blockUser);

/**
 * @swagger
 * /block/{id}:
 *   delete:
 *     summary: Unblock user with `id`
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Successful unblock
 *         content:
 *           application/json:
 *             example:
 *              message: User unblocked.
 *       400:
 *          description: Bad request
 *          content:
 *            application/json:
 *              examples:
 *                cannotUnblockSelf:
 *                  value:
 *                    message: You cannot unblock yourself.
 *                notBlockYet:
 *                  value:
 *                    message: You have not blocked this user.
 *       401:
 *         $ref: '#/components/responses/AuthMiddlewareError'
 *       500:
 *          description: Internal server error
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 */
friendRouter.delete("/block/:id", unblockUser);

/* Listing and Queries */
/**
 * @swagger
 * /friends:
 *  get:
 *    summary: Get all friends of the current user
 *    tags: [Friends]
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: List of friends
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                friends:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/UserProfile'
 *      401:
 *       $ref: '#/components/responses/AuthMiddlewareError'
 *      500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
friendRouter.get("/friends/", getAllFriends);

/**
 * @swagger
 * /friends/requests/received:
 *  get:
 *    summary: Get all received friend requests of the current user
 *    tags: [Friends]
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: List of friends
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                friends:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/UserProfile'
 *      401:
 *       $ref: '#/components/responses/AuthMiddlewareError'
 *      500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
friendRouter.get("/friends/requests/received", getReceivedFriendRequests);

/**
 * @swagger
 * /friends/requests/sent:
 *  get:
 *    summary: Get all sent friend requests of the current user
 *    tags: [Friends]
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: List of friends
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                friends:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/UserProfile'
 *      401:
 *       $ref: '#/components/responses/AuthMiddlewareError'
 *      500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
friendRouter.get("/friends/requests/sent", getSentFriendRequests);

/**
 * @swagger
 * /block:
 *  get:
 *    summary: Get all blocked users of the current user
 *    tags: [Friends]
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: List of blocked users
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                friends:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/UserProfile'
 *      401:
 *       $ref: '#/components/responses/AuthMiddlewareError'
 *      500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
friendRouter.get("/block/", getBlockedUsers);

/**
 * @swagger
 * /relationship/{id}:
 *  get:
 *    summary: Get relationship type between the current user and user with `id`
 *    tags: [Friends]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *    responses:
 *      200:
 *        description: Get the relationship type between the current user and user with `id`
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                type:
 *                  $ref: '#/components/schemas/RelationshipType'
 *      401:
 *       $ref: '#/components/responses/AuthMiddlewareError'
 *      500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
friendRouter.get("/relationship/:id", getRelationshipTypeApi);

export default friendRouter;
