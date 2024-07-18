import { Upload } from "@aws-sdk/lib-storage";
import {
  S3Client,
  ObjectCannedACL,
  PutObjectCommandInput,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config({ path: "./config.env" });

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

    return uploaded.Location;
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
