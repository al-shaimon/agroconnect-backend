import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file to Cloudinary
 * @param {string} filePath - Local file path
 * @param {string} folder - Cloudinary folder name
 * @param {string} userRole - User role (farmer/buyer) - optional
 * @param {string} userId - User ID - optional
 * @param {string} documentType - Type of document - optional
 * @returns {Promise<Object>} Cloudinary upload result
 */
export const uploadToCloudinary = async (filePath, folder, userRole, userId, documentType) => {
  try {
    // Use provided folder or create structured folder path if userRole, userId, documentType provided
    const folderPath = folder || `agroconnect/${userRole}/${userId}/${documentType}`;

    // Determine if file is PDF
    const isPdf = filePath.toLowerCase().endsWith('.pdf');

    // Set resource type based on file type
    // For PDFs, we need to use 'raw' or 'image' with specific format
    const uploadOptions = {
      folder: folderPath,
      resource_type: isPdf ? 'raw' : 'auto',
    };

    // Add tags and context only if metadata is provided
    if (userRole && userId && documentType) {
      uploadOptions.tags = [userRole, documentType, userId];
      uploadOptions.context = {
        role: userRole,
        document_type: documentType,
        user_id: userId,
      };
    }

    const result = await cloudinary.uploader.upload(filePath, uploadOptions);

    // For PDFs uploaded as 'raw', construct the proper URL
    let secureUrl = result.secure_url;

    // If it's a PDF and the URL contains /image/upload/, replace it with /raw/upload/
    if (isPdf && secureUrl.includes('/image/upload/')) {
      secureUrl = secureUrl.replace('/image/upload/', '/raw/upload/');
    }

    return {
      url: secureUrl,
      secure_url: secureUrl,
      publicId: result.public_id,
      public_id: result.public_id,
      format: result.format,
      resourceType: result.resource_type,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - Resource type (image, raw, video)
 * @returns {Promise<Object>} Cloudinary deletion result
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    throw new Error('Failed to delete file from Cloudinary');
  }
};

/**
 * Get Cloudinary URL with transformations
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} transformations - Transformation options
 * @returns {string} Transformed URL
 */
export const getTransformedUrl = (publicId, transformations = {}) => {
  return cloudinary.url(publicId, {
    transformation: transformations,
    secure: true,
  });
};

export default cloudinary;
