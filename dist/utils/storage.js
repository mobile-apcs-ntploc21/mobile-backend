"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compressImage = exports.processImage = exports.createFileObject = exports.deleteFromS3 = exports.uploadToS3 = exports.streamToBuffer = exports.s3 = void 0;
const lib_storage_1 = require("@aws-sdk/lib-storage");
const client_s3_1 = require("@aws-sdk/client-s3");
const uuid_1 = require("uuid");
const sharp_1 = __importDefault(require("sharp"));
const streamifier_1 = __importDefault(require("streamifier"));
const config_1 = __importDefault(require("../config"));
const log_1 = require("@/utils/log");
exports.s3 = new client_s3_1.S3Client({
    credentials: {
        accessKeyId: config_1.default.AWS_ACCESS_KEY_ID,
        secretAccessKey: config_1.default.AWS_SECRET_ACCESS_KEY,
        sessionToken: config_1.default.AWS_SESSION_TOKEN,
    },
    region: config_1.default.AWS_REGION,
});
const streamToBuffer = (stream) => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks)));
    });
};
exports.streamToBuffer = streamToBuffer;
const uploadToS3 = async (file, folder) => {
    try {
        const { createReadStream, filename, mimetype } = await file;
        const stream = createReadStream();
        const buffer = await (0, exports.streamToBuffer)(stream);
        const extension = filename.split(".").pop();
        const key = `${folder}/${(0, uuid_1.v4)()}${extension ? `.${extension}` : ""}`;
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: mimetype,
        };
        const uploaded = await new lib_storage_1.Upload({
            client: exports.s3,
            params,
        }).done();
        return `https://${config_1.default.CDN_URL}/${key}`;
    }
    catch (err) {
        log_1.log.error(err.message);
        throw new Error(err.message);
    }
};
exports.uploadToS3 = uploadToS3;
const deleteFromS3 = async (key) => {
    try {
        await exports.s3.send(new client_s3_1.DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key,
        }));
    }
    catch (err) {
        log_1.log.error(err.message);
        throw new Error(err.message);
    }
};
exports.deleteFromS3 = deleteFromS3;
const base64ToBuffer = (dataString) => {
    const matches = String(dataString).match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
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
const createFileObject = (buffer, filename) => {
    if (buffer instanceof Error) {
        throw new Error("Failed to convert base64 to buffer.");
    }
    return {
        createReadStream: () => streamifier_1.default.createReadStream(buffer.data),
        filename,
        mimetype: buffer.type,
    };
};
exports.createFileObject = createFileObject;
const processImage = async (image, folder) => {
    if (!image)
        return null;
    try {
        const buffer = base64ToBuffer(image);
        const fileObject = (0, exports.createFileObject)(buffer, "temp.png");
        const imageUrl = await (0, exports.uploadToS3)((0, exports.compressImage)(fileObject), folder);
        return imageUrl;
    }
    catch (err) {
        return null;
    }
};
exports.processImage = processImage;
const compressImage = async (image) => {
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
    if (!supportedImageTypes.includes(mimetype)) {
        throw new Error("Invalid file type.");
    }
    const stream = createReadStream();
    const buffer = await (0, exports.streamToBuffer)(stream);
    const optimizedImage = await (0, sharp_1.default)(buffer)
        .resize(512, 512, {
        fit: "cover",
        position: "center",
    })
        .png()
        .toBuffer();
    return {
        createReadStream: () => streamifier_1.default.createReadStream(optimizedImage),
        filename,
        mimetype,
    };
};
exports.compressImage = compressImage;
