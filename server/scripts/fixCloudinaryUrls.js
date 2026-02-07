import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
import mongoose from 'mongoose';
import VaultFile from '../src/models/VaultFile.js';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('MONGODB_URI:', process.env.MONGODB_URI);
if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is not set. Please check your .env file and dotenv path.');
}

async function fixCloudinaryUrls() {
  await mongoose.connect(process.env.MONGODB_URI);
  const files = await VaultFile.find({ cloudinaryId: { $exists: true, $ne: null } });
  let fixed = 0;
  for (const file of files) {
    if (!file.cloudinaryUrl || !file.cloudinaryUrl.startsWith('http')) {
      try {
        const result = await cloudinary.api.resource(file.cloudinaryId);
        if (result.secure_url) {
          file.cloudinaryUrl = result.secure_url;
          await file.save();
          fixed++;
        }
      } catch (e) {
        console.error('Failed to fix file', file._id, e.message);
      }
    }
  }
  console.log(`Fixed ${fixed} files.`);
  process.exit(0);
}

fixCloudinaryUrls(); 