import { Upload } from "@aws-sdk/lib-storage";
import {
  DeleteObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import streamifier from "streamifier";
import config from "../config";
import { log } from "@/utils/log";

// AWS S3 Config
export const s3 = new S3Client({
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
    sessionToken: config.AWS_SESSION_TOKEN,
  },

  region: config.AWS_REGION,
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

    // Generate a unique key for the file
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
    return `https://${config.CDN_URL}/${key}`;
  } catch (err: any) {
    log.error(err.message);
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
    log.error(err.message);
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

  if (!Array.isArray(matches))
    throw new Error("Data string is not in the base64 uri format");

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
 * @param {string} buffer
 * @param {string} filename
 * @returns {{ createReadStream: () => any; filename: string; mimetype: string; }}
 */
export const createFileObject = (buffer: any, filename: string) => {
  if (buffer instanceof Error) {
    throw new Error("Failed to convert base64 to buffer.");
  }

  return {
    createReadStream: () => streamifier.createReadStream(buffer.data),
    filename,
    mimetype: buffer.type,
  };
};

/**
 * To process image (compress the image) and upload to S3
 *
 * @async
 * @param {*} image - The image object file (base64)
 * @param {string} folder - The folder to store the image
 * @returns {Promise<string | null>} - The image URL
 */
export const processImage = async (
  image: any,
  folder: string
): Promise<string | null> => {
  if (!image) return null;

  try {
    const buffer = base64ToBuffer(image);
    const fileObject = createFileObject(buffer, "temp.png");
    const imageUrl = await uploadToS3(compressImage(fileObject), folder);
    return imageUrl;
  } catch (err) {
    return null;
  }
};

/**
 * To compress the image and resize to 512x512
 *
 * @async
 * @param {*} image - The image object file
 * @returns {object} - The compressed image object
 */
export const compressImage = async (image: any) => {
  const { createReadStream, filename, mimetype } = await image;

  const supportedImageTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/bmp",
    "image/tiff",
    "image/svg+xml",
  ];

  // Check if the provided mimetype is in the list of supported types
  if (!supportedImageTypes.includes(mimetype)) {
    throw new Error("Invalid file type.");
  }

  const stream = createReadStream();
  const buffer = await streamToBuffer(stream);

  const optimizedImage = await sharp(buffer)
    .resize(512, 512, {
      fit: "cover",
      position: "center",
    })
    .png()
    .toBuffer();

  return {
    createReadStream: () => streamifier.createReadStream(optimizedImage),
    filename,
    mimetype,
  };
};
