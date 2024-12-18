import express from "express";
import { deleteFromS3, s3 } from "@/utils/storage";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { log } from "@/utils/log";
import graphQLClient from "@/utils/graphql";
import { cronjobQueries } from "@/graphql/queries";
import { serverEmojiMutations } from "@/graphql/mutations";

export const handlePremiumExpiration = async () => {
  console.log("Handling premium expiration...");
  return;
};

export const handleUserStatusExpiration = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  console.log("Cleaning up server...");
  return;
};

export const handleInviteCodeExpiration = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  log.info("[Cronjob] Cleanup invite codes: Started cleaning up invite codes");
  return;
};

export const cleanupEmoji = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  log.info("[Cronjob] Cleanup emojis: Started cleaning up emojis");

  deleteFromS3(
    "emojis/c1cdb54823931173b4b697ff6cc3ecd0_605701445890838819.png"
  );

  const deletedEmojis = await graphQLClient().request(
    cronjobQueries.GET_DELETED_EMOJIS
  );

  for (const emoji of deletedEmojis.deletedEmojis) {
    log.info(`[Cronjob] Cleanup emojis: Deleting ${emoji.id}`);
    const emojiPath = emoji.image_url.match(/emojis\/.*/);
    if (emojiPath) {
      deleteFromS3(emojiPath[0]);
    }

    await graphQLClient().request(
      serverEmojiMutations.HARD_DELETE_SERVER_EMOJI,
      {
        emoji_id: emoji.id,
      }
    );
  }

  log.info(
    `[Cronjob] Cleanup emojis: Deleted ${deletedEmojis.deletedEmojis.length} emojis`
  );

  res.status(200).json({
    message: "Deleted emojis cleaned up successfully",
    deletedEmojis: deletedEmojis.deletedEmojis,
  });
  return;
};

export const cleanupAttachment = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  log.info("[Cronjob] Cleanup attachments: Started cleaning up attachments");
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
    res.status(200).json("No attachments to clean up");
    log.info("[Cronjob] Cleanup attachments: No attachments to clean up");
    return;
  }

  let count = 0;
  try {
    // Get attachments available in the database
    const response = await graphQLClient().request(
      cronjobQueries.GET_AVAILABLE_ATTACHMENTS
    );
    const availableAttachments = response.availableAttachments;
    console.log();
    const availableKeys = availableAttachments.map((attachment: any) => {
      const match = attachment.url.match(/attachments\/.*/);
      return match ? match[0] : null;
    });
    console.log(availableKeys);

    for (const key of allKeys) {
      if (!availableKeys.includes(key)) {
        count++;
        log.info(`[Cronjob] Cleanup attachments: Deleting ${key}`);
        deleteFromS3(key);
      }
    }
  } catch (err: any) {
    log.error(err.message);
    throw new Error(err.message);
  }

  res.status(200).json({
    message: `${count} Attachments cleaned up successfully`,
  });

  log.info(
    `[Cronjob] Clean up attachments: ${count} Attachments cleaned up successfully`
  );

  return;
};