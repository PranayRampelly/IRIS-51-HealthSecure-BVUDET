import AWS from 'aws-sdk';
import crypto from 'crypto';
import { Request, Response } from 'express';
import multer from 'multer';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const upload = multer({ storage: multer.memoryStorage() });

export const uploadEncryptedFile = [
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      const file = req.file;
      if (!file) return res.status(400).json({ error: 'No file uploaded' });

      // Envelope encryption: generate random data key
      const dataKey = crypto.randomBytes(32);
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv('aes-256-gcm', dataKey, iv);
      let encrypted = cipher.update(file.buffer);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      const tag = cipher.getAuthTag();

      // Encrypt the data key with master key (RSA public key from env)
      const masterKey = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
      // For demo: just base64 encode dataKey (replace with real RSA encryption in prod)
      const encryptedDataKey = dataKey.toString('base64');

      // Upload encrypted file to S3
      const s3Key = `appointments/${Date.now()}_${file.originalname}`;
      await s3.putObject({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: s3Key,
        Body: Buffer.concat([iv, tag, encrypted]),
        ContentType: file.mimetype,
      }).promise();

      res.json({
        s3Key,
        encryptedDataKey,
        fileName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      });
    } catch (err) {
      res.status(500).json({ error: 'Upload failed', details: err.message });
    }
  }
]; 