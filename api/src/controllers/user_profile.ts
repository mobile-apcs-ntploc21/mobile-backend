import express from "express";
import streamifier from "streamifier";

import { uploadToS3, compressImage, createFileObject } from "../utils/storage";
import graphQLClient from "../utils/graphql";
import { userProfileQueries } from "../graphql/queries";
import { userProfileMutation } from "../graphql/mutations";

/**
 * To get user profile with user_id and server_id parameters
 *
 * @async
 * @param {string} userId
 * @param {string} serverId
 * @returns {JSON} user profile
 */
const getUserProfile = async (userId: string, serverId: string) => {
  const response = await graphQLClient().request(
    userProfileQueries.GET_USER_PROFILE,
    {
      user_id: userId,
      server_id: serverId,
    }
  );

  return response.getUserProfile;
};

/**
 * To process image (compress the image) and upload to S3
 *
 * @async
 * @param {*} image
 * @returns {string} image URL
 */
const processImage = async (
  image: any,
  folder: string
): Promise<string | null> => {
  if (!image) return null;

  try {
    const fileObject = createFileObject(image, "temp.jpg");
    const imageUrl = await uploadToS3(compressImage(fileObject), folder);
    return imageUrl;
  } catch (err) {
    return null;
  }
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
    return res.status(400).json({ message: "User ID is required." });
  }

  try {
    const profile = await getUserProfile(userId, serverId).catch(() => null);

    if (!profile) {
      return res.status(404).json({ message: "Profile not found." });
    }

    return res.status(200).json({ ...profile });
  } catch (error) {
    return next(error);
  }
};

export const getProfileByUsername = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const username = req.params?.username as string;

  if (!username) {
    return res.status(400).json({ message: "Username is required." });
  }

  try {
    const response = await graphQLClient().request(
      userProfileQueries.GET_USER_PROFILE_BY_USERNAME,
      {
        username,
      }
    );

    if (!response.getUserProfileByUsername) {
      return res
        .status(404)
        .json({ message: "Profile with matching username not found." });
    }

    return res.status(200).json({ ...response.getUserProfileByUsername });
  } catch (error) {
    return next(error);
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
    return res.status(500).json({
      message:
        "Server error: User ID is not assigned yet. Please contact the server owner.",
    });
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

    return res.status(200).json({ ...response });
  } catch (error) {
    return next(error);
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
    return res.status(500).json({
      message:
        "Server error: User ID is not assigned yet. Please contact the server owner.",
    });
  }

  // Extract fields from req.body
  const { display_name, about_me, avatar, banner } = req.body;
  let avatar_url = null;
  let banner_url = null;

  if (avatar) {
    avatar_url = await processImage(avatar, "avatars");
    if (!avatar_url) {
      return res
        .status(400)
        .json({ message: "Failed to upload avatar. Maybe check file type." });
    }
  }

  if (banner) {
    banner_url = await processImage(banner, "banners");
    if (!banner_url) {
      return res
        .status(400)
        .json({ message: "Failed to upload banner.  Maybe check file type." });
    }
  }

  try {
    const response = await graphQLClient().request(
      userProfileMutation.UPDATE_USER_PROFILE,
      {
        input: {
          user_id: userId,
          server_id: serverId,
          display_name,
          about_me,
          avatar_url,
          banner_url,
        },
      }
    );

    return res.status(200).json({ ...response });
  } catch (error) {
    return next(error);
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
    return res.status(400).json({ message: "User ID is required." });
  }

  try {
    const response = await graphQLClient().request(
      userProfileMutation.DELETE_USER_PROFILE,
      {
        user_id: userId,
        server_id: serverId,
      }
    );

    return res.status(200).json({ ...response });
  } catch (error) {
    return next(error);
  }
};