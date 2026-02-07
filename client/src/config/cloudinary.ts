// Cloudinary configuration
export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'ddegpmz5s',
  uploadPreset: 'healthsecure_docs', // You'll need to create this preset in Cloudinary
  folder: 'insurance-applications',
  apiUrl: 'https://api.cloudinary.com/v1_1'
};

// Helper function to get Cloudinary upload URL
export const getCloudinaryUploadUrl = () => {
  return `${CLOUDINARY_CONFIG.apiUrl}/${CLOUDINARY_CONFIG.cloudName}/auto/upload`;
};

// Helper function to create upload form data
export const createUploadFormData = (file: File, documentType: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('folder', CLOUDINARY_CONFIG.folder);
  formData.append('public_id', `${documentType}_${Date.now()}`);
  return formData;
};

// Mock upload function for testing when Cloudinary is not configured
export const mockUploadToCloudinary = async (file: File, documentType: string): Promise<string> => {
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Return a mock URL
  return `https://mock-cloudinary.com/${CLOUDINARY_CONFIG.folder}/${documentType}_${Date.now()}.${file.name.split('.').pop()}`;
};

// Check if Cloudinary is properly configured
export const isCloudinaryConfigured = () => {
  return CLOUDINARY_CONFIG.cloudName && CLOUDINARY_CONFIG.cloudName !== 'your-cloud-name';
}; 