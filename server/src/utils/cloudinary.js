import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload file to Cloudinary
 * @param {string} filePath - Path to the file to upload
 * @param {string} folder - Cloudinary folder name
 * @param {Object} options - Additional upload options
 * @returns {Promise<Object>} Cloudinary upload result
 */
export const uploadToCloudinary = async (filePath, folder = 'healthsecure', options = {}) => {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error('File does not exist');
    }

    // Default upload options
    const uploadOptions = {
      folder,
      resource_type: 'auto',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt'],
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ],
      ...options
    };

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, uploadOptions);

    // Clean up local file
    try {
      fs.unlinkSync(filePath);
    } catch (unlinkError) {
      console.warn('Failed to delete local file:', unlinkError);
    }

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      url: result.url,
      format: result.format,
      size: result.bytes,
      width: result.width,
      height: result.height,
      created_at: result.created_at
    };

  } catch (error) {
    console.error('Cloudinary upload error:', error);
    
    // Clean up local file on error
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (unlinkError) {
      console.warn('Failed to delete local file after error:', unlinkError);
    }

    throw new Error(`Failed to upload file to Cloudinary: ${error.message}`);
  }
};

/**
 * Upload buffer to Cloudinary
 * @param {Buffer} buffer - File buffer to upload
 * @param {string} folder - Cloudinary folder name
 * @param {Object} options - Additional upload options
 * @returns {Promise<Object>} Cloudinary upload result
 */
export const uploadBufferToCloudinary = async (buffer, folder = 'healthsecure', options = {}) => {
  try {
    // Default upload options
    const uploadOptions = {
      folder,
      resource_type: 'auto',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt'],
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ],
      ...options
    };

    // Upload buffer to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      url: result.url,
      format: result.format,
      size: result.bytes,
      width: result.width,
      height: result.height,
      created_at: result.created_at
    };

  } catch (error) {
    console.error('Cloudinary buffer upload error:', error);
    throw new Error(`Failed to upload buffer to Cloudinary: ${error.message}`);
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - Resource type (image, video, raw)
 * @returns {Promise<Object>} Deletion result
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'auto') => {
  try {
    if (!publicId) {
      throw new Error('Public ID is required');
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });

    if (result.result !== 'ok') {
      throw new Error(`Failed to delete from Cloudinary: ${result.result}`);
    }

    return {
      success: true,
      public_id: publicId,
      result: result.result
    };

  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error(`Failed to delete from Cloudinary: ${error.message}`);
  }
};

/**
 * Get Cloudinary URL with transformations
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} transformations - Cloudinary transformations
 * @returns {string} Transformed URL
 */
export const getCloudinaryUrl = (publicId, transformations = {}) => {
  try {
    if (!publicId) {
      throw new Error('Public ID is required');
    }

    return cloudinary.url(publicId, {
      secure: true,
      ...transformations
    });

  } catch (error) {
    console.error('Cloudinary URL generation error:', error);
    throw new Error(`Failed to generate Cloudinary URL: ${error.message}`);
  }
};

/**
 * Generate thumbnail URL
 * @param {string} publicId - Cloudinary public ID
 * @param {number} width - Thumbnail width
 * @param {number} height - Thumbnail height
 * @returns {string} Thumbnail URL
 */
export const getThumbnailUrl = (publicId, width = 150, height = 150) => {
  return getCloudinaryUrl(publicId, {
    transformation: [
      { width, height, crop: 'fill' },
      { quality: 'auto:good' }
    ]
  });
};

/**
 * Generate optimized image URL
 * @param {string} publicId - Cloudinary public ID
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} Optimized image URL
 */
export const getOptimizedImageUrl = (publicId, width = 800, height = 600) => {
  return getCloudinaryUrl(publicId, {
    transformation: [
      { width, height, crop: 'limit' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' }
    ]
  });
};

/**
 * Check if URL is a Cloudinary URL
 * @param {string} url - URL to check
 * @returns {boolean} True if Cloudinary URL
 */
export const isCloudinaryUrl = (url) => {
  return url && url.includes('cloudinary.com');
};

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} Public ID or null
 */
export const extractPublicIdFromUrl = (url) => {
  try {
    if (!isCloudinaryUrl(url)) {
      return null;
    }

    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) {
      return null;
    }

    // Extract public ID from URL
    const publicIdParts = urlParts.slice(uploadIndex + 2);
    const publicId = publicIdParts.join('/').split('.')[0];
    
    return publicId;

  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
};

/**
 * Validate Cloudinary configuration
 * @returns {boolean} True if configuration is valid
 */
export const validateCloudinaryConfig = () => {
  const requiredEnvVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('Missing Cloudinary environment variables:', missingVars);
    return false;
  }

  return true;
};

export default {
  uploadToCloudinary,
  uploadBufferToCloudinary,
  deleteFromCloudinary,
  getCloudinaryUrl,
  getThumbnailUrl,
  getOptimizedImageUrl,
  isCloudinaryUrl,
  extractPublicIdFromUrl,
  validateCloudinaryConfig
}; 