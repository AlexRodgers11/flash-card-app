import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import dotenv from "dotenv";
dotenv.config();

const bucketName = process.env.S3_BUCKET_NAME;
const bucketRegion = process.env.S3_BUCKET_REGION;
const bucketAccessKey = process.env.S3_BUCKET_ACCESS_KEY;
const bucketSecretAccessKey = process.env.S3_BUCKET_SECRET_ACCESS_KEY;

const s3Client = new S3Client({
    credentials: {
        accessKeyId: bucketAccessKey,
        secretAccessKey: bucketSecretAccessKey
    },
    region: bucketRegion
});

export const uploadFile = (fileBuffer, fileName, mimetype) => {
    console.log({bucketAccessKey});
    const uploadParams = {
        Bucket: bucketName,
        Key: fileName,
        Body: fileBuffer,
        ContentType: mimetype
    }

    return s3Client.send(new PutObjectCommand(uploadParams));
}

export const deleteFile = (fileName) => {
    const deleteParams = {
        Bucket: bucketName,
        key: fileName
    }

    return s3Client.send(new DeleteObjectCommand(deleteParams));
}

export const getObjectSignedUrl = async (key) => {
    const params = {
        Bucket: bucketName,
        Key: key
    }

    const command = new GetObjectCommand(params);
    const seconds = 172800;
    const url = await getSignedUrl(s3Client, command, { expiresIn: seconds});

    return url;
}
