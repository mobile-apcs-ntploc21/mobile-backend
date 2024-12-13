import express from "express";
import { deleteFromS3, s3 } from "@/utils/storage";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { log } from "@/utils/log";
import graphQLClient from "@/utils/graphql";
import { messageQueries } from "@/graphql/queries";
import { count } from "console";

export const handlePremiumExpiration = async () => {
  console.log("Handling premium expiration...");
  return;
};

export const handleUserStatusExpiration = async () => {
  console.log("Cleaning up server...");
  return;
};

export const handleInviteCodeExpiration = async () => {
  console.log("Cleaning up server...");
  return;
};

export const cleanupEmoji = async () => {
  console.log("Handling inactive users...");
  return;
};

export const cleanupAttachment = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const getOldKeys = async (folder: string = "", hours: number = 0) => {
    try {
      const data = await s3.send(
        new ListObjectsV2Command({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Prefix: folder,
        })
      );
      // Filter the files based on the last modified date
      let files = data.Contents || [];
      if (hours > 0) {
        const currentTime = new Date();
        files = files?.filter((file: any) => {
          const lastModified = new Date(file.LastModified);
          const diff = (currentTime.getTime() - lastModified.getTime()) / 1000;
          return diff >= hours * 3600;
        });
      }
      const allKeys = files.map((file: any) => file.Key as string);
      return allKeys;
    } catch (err: any) {
      next(err);
      return [];
    }
  };

  const allKeys = (await getOldKeys("attachments", 24)) || [];
  if (allKeys?.length === 0) {
    res
      .status(200)
      .json("[Cronjob] Cleanup attachments: No attachments to clean up");
    return;
  }

  try {
    // Get attachments available in the database
    const availableAttachments = await graphQLClient().request(
      messageQueries.GET_AVAILABLE_ATTACHMENTS
    );
    const availableKeys = availableAttachments.map((attachment: any) =>
      attachment.attachment_url.split("/").pop()
    );

    let count = 0;
    for (const key of allKeys) {
      if (!availableKeys.includes(key)) {
        count++;
        deleteFromS3(key);
      }
    }
  } catch (err: any) {
    log.error(err.message);
    throw new Error(err.message);
  }

  res.status(200).json({
    message: `[Cronjob] Clean up attachments: ${count} Attachments cleaned up successfully`,
  });

  return;
};

export const cleanupServer = async () => {
  console.log("Cleaning up server...");
  return;
};
