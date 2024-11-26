import express from "express";

import { processImage } from "../utils/storage";
import graphQLClient from "../utils/graphql";
import { userProfileQueries } from "../graphql/queries";
import { userProfileMutation } from "../graphql/mutations";

import redisClient from "@/utils/redisClient";
import { USERS } from "../constants/redisKey";

/**
 * To get user profile with user_id and server_id parameters
 *
 * @async
 * @param {string} userId
 * @param {string} serverId
 * @returns {JSON} user profile
 */
const getUserProfile = async (userId: string, serverId: string) => {
  // Apply RedisCache
  const cacheKey =
    serverId === null
      ? USERS.USER_PROFILE.key({ user_id: userId })
      : USERS.SERVER_PROFILE.key({ user_id: userId, server_id: serverId });

  // Check if the cache exists
  const cachedData = await redisClient.fetch(
    cacheKey,
    async () => {
      const response = await graphQLClient().request(
        userProfileQueries.GET_USER_PROFILE,
        {
          user_id: userId,
          server_id: serverId,
        }
      );

      return response.getUserProfile;
    },
    USERS.USER_PROFILE.TTL
  );

  return cachedData;
};

/* ======================================== */

export const getProfile = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const userId = (req.params?.userId as string) ?? res.locals.uid;
  const serverId = (req.params?.serverId as string) ?? null;

  if (!userId) {
    res.status(400).json({ message: "User ID is required." });
    return;
  }

  try {
    const profile = await getUserProfile(userId, serverId).catch(() => null);

    if (!profile) {
      res.status(404).json({ message: "Profile not found." });
      return;
    }

    res.status(200).json({ ...profile });
    return;
  } catch (error) {
    next(error);
    return;
  }
};

export const getProfileByUsername = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const username = req.params?.username as string;

  if (!username) {
    res.status(400).json({ message: "Username is required." });
    return;
  }

  try {
    const response = await graphQLClient().request(
      userProfileQueries.GET_USER_PROFILE_BY_USERNAME,
      {
        username,
      }
    );

    if (!response.getUserProfileByUsername) {
      res
        .status(404)
        .json({ message: "Profile with matching username not found." });
      return;
    }

    res.status(200).json({ ...response.getUserProfileByUsername });
    return;
  } catch (error) {
    next(error);
    return;
  }
};

export const createProfile = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const userId = res.locals.uid as string;
  const serverId = (req.params?.serverId as string) ?? null;

  if (!userId) {
    res.status(500).json({
      message:
        "Server error: User ID is not assigned yet. Please contact the server owner.",
    });
    return;
  }

  // Extract fields from req.body
  const { display_name, about_me } = req.body;

  try {
    const response = await graphQLClient().request(
      userProfileMutation.CREATE_USER_PROFILE,
      {
        input: {
          user_id: userId,
          server_id: serverId,
          display_name,
          about_me,
        },
      }
    );

    res.status(200).json({ ...response });
    return;
  } catch (error) {
    next(error);
    return;
  }
};

export const updateProfile = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const userId = res.locals.uid as string;
  const serverId = (req.params?.serverId as string) ?? null;

  if (!userId) {
    res.status(500).json({
      message:
        "Server error: User ID is not assigned yet. Please contact the server owner.",
    });
    return;
  }

  // Extract fields from req.body
  const { display_name, about_me, avatar, banner } = req.body;
  let avatar_url = null;
  let banner_url = null;

  if (avatar) {
    avatar_url = await processImage(avatar, "avatars");
    if (!avatar_url) {
      res
        .status(400)
        .json({ message: "Failed to upload avatar. Maybe check file type." });
      return;
    }
  }

  if (banner) {
    banner_url = await processImage(banner, "banners");
    if (!banner_url) {
      res
        .status(400)
        .json({ message: "Failed to upload banner.  Maybe check file type." });
      return;
    }
  }

  // Prepare input object for GraphQL mutation
  const input: {
    display_name?: string;
    about_me?: string;
    avatar_url?: string;
    banner_url?: string;
  } = {
    ...(display_name && { display_name }),
    ...(about_me && { about_me }),
    ...(avatar_url && { avatar_url }),
    ...(banner_url && { banner_url }),
  };

  try {
    const response = await graphQLClient().request(
      userProfileMutation.UPDATE_USER_PROFILE,
      {
        input: {
          user_id: userId,
          server_id: serverId,
          ...input,
        },
      }
    );

    res.status(200).json({ ...response });
    return;
  } catch (error) {
    next(error);
    return;
  }
};

// export const uploadProfilePicture = async (
//   req: express.Request,
//   res: express.Response,
//   next: express.NextFunction
// ) => {
//   const userId = req.params.uid as string;
//   const serverId = (req.params?.serverId as string) ?? null;
//   const { image } = req.body;

//   if (!image) {
//     return res.status(400).json({ message: "Image is required." });
//   }

//   try {
//     const imageUrl = await processImage(image, "avatars");
//     if (!imageUrl) {
//       return res.status(400).json({ message: "Failed to upload image." });
//     }

//     const response = await graphQLClient().request(
//       userProfileMutation.UPDATE_USER_PROFILE,
//       {
//         input: {
//           user_id: userId,
//           server_id: serverId,
//           avatar_url: imageUrl,
//         },
//       }
//     );

//     return res.status(200).json({ ...response });
//   } catch (error) {
//     return next(error);
//   }
// };

// export const uploadProfileBanner = async (
//   req: express.Request,
//   res: express.Response,
//   next: express.NextFunction
// ) => {
//   const userId = req.params.uid as string;
//   const serverId = (req.params?.serverId as string) ?? null;
//   const { image } = req.body;

//   if (!image) {
//     return res.status(400).json({ message: "Image is required." });
//   }

//   try {
//     const imageUrl = await processImage(image, "avatars");
//     if (!imageUrl) {
//       return res.status(400).json({ message: "Failed to upload image." });
//     }

//     const response = await graphQLClient().request(
//       userProfileMutation.UPDATE_USER_PROFILE,
//       {
//         input: {
//           user_id: userId,
//           server_id: serverId,
//           banner_url: imageUrl,
//         },
//       }
//     );

//     return res.status(200).json({ ...response });
//   } catch (error) {
//     return next(error);
//   }
// };

export const deleteProfile = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const userId = res.locals.uid as string;
  const serverId = (req.params?.serverId as string) ?? null;

  if (!userId) {
    res.status(400).json({ message: "User ID is required." });
    return;
  }

  try {
    const response = await graphQLClient().request(
      userProfileMutation.DELETE_USER_PROFILE,
      {
        user_id: userId,
        server_id: serverId,
      }
    );

    res.status(200).json({ ...response });
    return;
  } catch (error) {
    next(error);
    return;
  }
};
