import { Upload } from "@aws-sdk/lib-storage";
import {
  S3Client,
  ObjectCannedACL,
  PutObjectCommandInput,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import streamifier from "streamifier";
import dotenv from "dotenv";

dotenv.config({ path: "./config.env" });

const CDNLink = "cdn.ntploc21.xyz";

// AWS S3 Config
export const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },

  region: process.env.AWS_REGION,
});

export const streamToBuffer = (stream: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: any = [];
    stream.on("data", (chunk: any) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
};

export const uploadToS3 = async (file: any, folder: string) => {
  try {
    const { createReadStream, filename, mimetype } = await file;
    const stream = createReadStream();
    const buffer = await streamToBuffer(stream);

    const extension = filename.split(".").pop();
    const key = `${folder}/${uuidv4()}${extension ? `.${extension}` : ""}`;

    const params: PutObjectCommandInput = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
      // ACL: "public-read" as ObjectCannedACL,
    };

    const uploaded = await new Upload({
      client: s3,
      params,
    }).done();

    // Convert to CDN link
    return `https://${CDNLink}/${key}`;
  } catch (err: any) {
    console.error(err.message);
    throw new Error(err.message);
  }
};

export const deleteFromS3 = async (key: string) => {
  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
      })
    );
  } catch (err: any) {
    console.error(err.message);
    throw new Error(err.message);
  }
};

/**
 * Convert base64 file to buffer
 *
 * @param {string} dataString
 * @returns {*}: Type - The type of the file, Data - The buffer data
 */
const base64ToBuffer = (dataString: string) => {
  const matches = String(dataString).match(
    /^data:([A-Za-z-+\/]+);base64,(.+)$/
  );
  if (matches.length !== 3) {
    return new Error("Invalid input string");
  }

  return {
    type: matches[1],
    data: Buffer.from(matches[2], "base64"),
  };
};

/**
 * Create a temporary file object to stream file
 *
 * @param {string} base64File
 * @param {string} filename
 * @returns {{ createReadStream: () => any; filename: string; mimetype: string; }}
 */
export const createFileObject = (base64File: string, filename: string) => {
  const buffer = base64ToBuffer(base64File);

  if (buffer instanceof Error) {
    throw new Error("Failed to convert base64 to buffer.");
  }

  return {
    createReadStream: () => streamifier.createReadStream(buffer.data),
    filename,
    mimetype: buffer.type,
  };
};

export const compressImage = async (image: any) => {
  const { createReadStream, filename, mimetype } = await image;

  if (mimetype !== "image/jpeg" && mimetype !== "image/png") {
    throw new Error("Invalid file type.");
  }

  const stream = createReadStream();
  const buffer = await streamToBuffer(stream);

  const optimizedImage = await sharp(buffer)
    .resize(512, 512, {
      fit: "cover",
      position: "center",
    })
    .jpeg()
    .toBuffer();

  return {
    createReadStream: () => streamifier.createReadStream(optimizedImage),
    filename,
    mimetype,
  };
};
