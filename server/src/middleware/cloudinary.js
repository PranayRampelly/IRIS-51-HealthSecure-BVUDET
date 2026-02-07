// Cloudinary upload middleware
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const imageExt = /\.(jpg|jpeg|png|gif|bmp|webp)$/i;
    const imageMime = /^image\/(jpeg|png|gif|bmp|webp)$/i;
    const isImage = imageExt.test(file.originalname) || imageMime.test(file.mimetype);
    
    console.log('Cloudinary storage params for file:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      isImage: isImage
    });
    
    return {
      folder: 'healthsecure_uploads',
      resource_type: isImage ? 'image' : 'auto',
    };
  },
});

const uploadCloud = multer({ storage });

// Middleware to log file object after upload
export const logUploadedFile = (req, res, next) => {
  if (req.file) {
    console.log('File uploaded to Cloudinary:', {
      originalname: req.file.originalname,
      filename: req.file.filename,
      url: req.file.url,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      fieldname: req.file.fieldname
    });
  }
  next();
};

// Upload file to Cloudinary
export const uploadToCloudinary = async (filePath, folder = 'healthsecure_uploads') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto'
    });
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
};

// Delete file from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete file from Cloudinary');
  }
};

export { uploadCloud }; 