import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

// AWS S3 Config
export const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
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

    const key = `${folder}/${uuidv4()}`;
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
      ACL: "public-read",
    };

    const uploaded = await s3.upload(params).promise();
    return uploaded.Location;
  } catch (err: any) {
    console.error(err.message);
    throw new Error(err.message);
  }
};
