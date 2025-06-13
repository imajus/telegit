import dotenv from 'dotenv';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fetch from 'node-fetch';

// Load environment variables first
dotenv.config();

const s3Client = new S3Client({
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

export async function uploadTelegramPhotoToS3(fileUrl) {
  try {
    // Download the file from Telegram
    const response = await fetch(fileUrl);
    const buffer = await response.buffer();
    // Generate a unique filename
    const filename = `telegram-photos/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: filename,
      Body: buffer,
      ContentType: 'image/jpeg',
    });

    await s3Client.send(command);

    // Generate a public URL
    if (process.env.S3_PUBLIC_ENDPOINT) {
      return `${process.env.S3_PUBLIC_ENDPOINT}/${filename}`;
    } else if (process.env.S3_ENDPOINT) {
      return `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${filename}`;
    } else {
      return `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/${filename}`;
    }
  } catch (error) {
    console.error('Error uploading photo to S3:', error);
    throw error;
  }
}
