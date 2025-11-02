import User from './auth.model.js';
import jwt from 'jsonwebtoken';
import { config } from '../../../config/config.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../../config/cloudinary.js';
import fs from 'fs';
import { notifyAdminNewDocument } from '../../../utils/notificationHelper.js';

// Helper function to handle file upload in both dev and prod
const handleFileUpload = async (
  file,
  folder,
  userRole = null,
  userId = null,
  documentType = null
) => {
  if (!file) return null;

  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

  try {
    let result;

    if (isProduction) {
      // Production: Upload buffer directly to Cloudinary
      result = await uploadToCloudinary(file.buffer, folder, userRole, userId, documentType);
    } else {
      // Development: Upload from file path
      result = await uploadToCloudinary(file.path, folder, userRole, userId, documentType);

      // Delete local file after successful upload
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }

    return result;
  } catch (error) {
    // Clean up local file on error (development only)
    if (!isProduction && file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    throw error;
  }
};

// Helper function to cleanup file on error
const cleanupFile = (file) => {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
  if (!isProduction && file && file.path && fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }
};

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

// @desc    Register new user (farmer/buyer)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, location } = req.body;

    // Validate role
    if (!['farmer', 'buyer'].includes(role)) {
      // Clean up uploaded file if validation fails
      cleanupFile(req.file);
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either farmer or buyer',
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      // Clean up uploaded file if user exists
      cleanupFile(req.file);
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Handle profile image upload if provided
    let profileImageUrl = null;
    let profileImagePublicId = null;

    if (req.file) {
      try {
        const result = await handleFileUpload(
          req.file,
          `agroconnect/profiles/${role}`,
          role,
          null,
          null
        );

        if (result) {
          profileImageUrl = result.secure_url;
          profileImagePublicId = result.public_id;
        }
      } catch (uploadError) {
        cleanupFile(req.file);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload profile image',
        });
      }
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role,
      location,
      profileImage: profileImageUrl,
      profileImagePublicId: profileImagePublicId,
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          location: user.location,
          profileImage: user.profileImage,
          isVerified: user.isVerified,
          verificationStatus: user.verificationStatus || 'pending',
          verificationDocuments: user.verificationDocuments || [],
          isActive: user.isActive,
          createdAt: user.createdAt,
          token: generateToken(user._id),
        },
      });
    }
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support',
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        location: user.location,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
        verificationStatus: user.verificationStatus || 'pending',
        verificationDocuments: user.verificationDocuments || [],
        isActive: user.isActive,
        createdAt: user.createdAt,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        location: user.location,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
        verificationStatus: user.verificationStatus || 'pending',
        verificationDocuments: user.verificationDocuments || [],
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      // Clean up uploaded file if user not found
      cleanupFile(req.file);
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Handle profile image upload if provided
    if (req.file) {
      try {
        // Delete old profile image from Cloudinary if exists
        if (user.profileImagePublicId) {
          await deleteFromCloudinary(user.profileImagePublicId);
        }

        // Upload new profile image
        const result = await handleFileUpload(
          req.file,
          `agroconnect/profiles/${user.role}`,
          user.role,
          null,
          null
        );

        if (result) {
          user.profileImage = result.secure_url;
          user.profileImagePublicId = result.public_id;
        }
      } catch (uploadError) {
        // Delete local file on error
        cleanupFile(req.file);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload profile image',
        });
      }
    }

    // Update allowed fields
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;

    if (req.body.location) {
      // Only update provided location fields
      if (req.body.location.area !== undefined) {
        user.location.area = req.body.location.area;
      }
      if (req.body.location.city !== undefined) {
        user.location.city = req.body.location.city;
      }
      // Only update coordinates if explicitly provided
      if (req.body.location.coordinates) {
        user.location.coordinates = req.body.location.coordinates;
      }
    }

    // Update password if provided
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        location: updatedUser.location,
        profileImage: updatedUser.profileImage,
        isVerified: updatedUser.isVerified,
        verificationStatus: updatedUser.verificationStatus,
        verificationDocuments: updatedUser.verificationDocuments,
        rejectionReason: updatedUser.rejectionReason,
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Upload verification document
// @route   POST /api/auth/upload-verification
// @access  Private
export const uploadVerificationDocument = async (req, res) => {
  try {
    const { documentType, documentNumber } = req.body;

    if (!documentType || !documentNumber) {
      return res.status(400).json({
        success: false,
        message: 'Document type and number are required',
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one document image',
      });
    }

    // Validate file count based on document type
    if (documentType === 'nid' && req.files.length !== 2) {
      // Delete uploaded files
      req.files.forEach((file) => cleanupFile(file));
      return res.status(400).json({
        success: false,
        message: 'Please upload both front and back images of your NID (2 images required)',
      });
    }

    if (documentType !== 'nid' && req.files.length > 1) {
      // Delete uploaded files
      req.files.forEach((file) => cleanupFile(file));
      return res.status(400).json({
        success: false,
        message: 'Please upload only one image for this document type',
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      // Delete uploaded files if user not found
      req.files.forEach((file) => cleanupFile(file));
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Upload all files to Cloudinary
    const uploadedUrls = [];
    const uploadedPublicIds = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const suffix = documentType === 'nid' ? (i === 0 ? '_front' : '_back') : '';

      const cloudinaryResult = await handleFileUpload(
        file,
        'agroconnect',
        user.role,
        user._id.toString(),
        documentType + suffix
      );

      if (cloudinaryResult) {
        uploadedUrls.push(cloudinaryResult.url);
        uploadedPublicIds.push(cloudinaryResult.publicId);
      }
    }

    // Add document to user's verification documents
    user.verificationDocuments.push({
      documentType,
      documentNumber,
      documentUrl: uploadedUrls.join('|||'), // Store multiple URLs separated by |||
      cloudinaryPublicId: uploadedPublicIds.join('|||'), // Store multiple public IDs
      cloudinaryResourceType: 'image',
      uploadedAt: new Date(),
    });

    // Set verification status to pending if not already approved
    if (user.verificationStatus !== 'approved') {
      user.verificationStatus = 'pending';
      user.rejectionReason = undefined; // Clear any previous rejection reason
    }

    await user.save();

    // Notify all admins about new document submission
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');

    await notifyAdminNewDocument(user.name, user._id, io, connectedUsers).catch((err) =>
      console.error('Error notifying admins:', err)
    );

    res.status(200).json({
      success: true,
      message: 'Verification document uploaded successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        location: user.location,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
        verificationStatus: user.verificationStatus,
        verificationDocuments: user.verificationDocuments,
        rejectionReason: user.rejectionReason,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    // Delete local files if error occurs
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete verification document
// @route   DELETE /api/auth/verification-document/:documentId
// @access  Private
export const deleteVerificationDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Find the document
    const documentIndex = user.verificationDocuments.findIndex(
      (doc) => doc._id.toString() === documentId
    );

    if (documentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    const document = user.verificationDocuments[documentIndex];

    // Delete from Cloudinary
    if (document.cloudinaryPublicId) {
      const publicIds = document.cloudinaryPublicId.split('|||');
      const resourceType = document.cloudinaryResourceType || 'image';

      for (const publicId of publicIds) {
        try {
          await deleteFromCloudinary(publicId, resourceType);
        } catch (error) {
          console.error('Error deleting from Cloudinary:', error);
          // Continue even if Cloudinary deletion fails
        }
      }
    }

    // Remove document from array
    user.verificationDocuments.splice(documentIndex, 1);

    // If no documents left, reset verification status to pending
    if (user.verificationDocuments.length === 0) {
      user.verificationStatus = 'pending';
      user.isVerified = false;
      user.rejectionReason = undefined;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Verification document uploaded successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        location: user.location,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
        verificationStatus: user.verificationStatus,
        verificationDocuments: user.verificationDocuments,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Register new driver with documents and vehicle info
// @route   POST /api/auth/register-driver
// @access  Public
export const registerDriver = async (req, res) => {
  try {
    const { name, email, password, phone, location, vehicleInfo, driverType } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      // Clean up uploaded files if user exists
      if (req.files) {
        Object.values(req.files).forEach((fileArray) => {
          fileArray.forEach((file) => cleanupFile(file));
        });
      }
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Validate driver type
    if (!driverType || !['professional', 'volunteer'].includes(driverType)) {
      if (req.files) {
        Object.values(req.files).forEach((fileArray) => {
          fileArray.forEach((file) => cleanupFile(file));
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Please specify driver type (professional or volunteer)',
      });
    }

    // Parse vehicleInfo if it's a string
    let parsedVehicleInfo = vehicleInfo;
    if (typeof vehicleInfo === 'string') {
      try {
        parsedVehicleInfo = JSON.parse(vehicleInfo);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid vehicle info format',
        });
      }
    }

    // Handle profile image upload
    let profileImageUrl = null;
    let profileImagePublicId = null;

    if (req.files && req.files.profileImage && req.files.profileImage[0]) {
      try {
        const result = await handleFileUpload(
          req.files.profileImage[0],
          'agroconnect/profiles/driver',
          'driver',
          null,
          'profile'
        );

        if (result) {
          profileImageUrl = result.secure_url;
          profileImagePublicId = result.public_id;
        }
      } catch (uploadError) {
        if (req.files) {
          Object.values(req.files).forEach((fileArray) => {
            fileArray.forEach((file) => cleanupFile(file));
          });
        }
        return res.status(500).json({
          success: false,
          message: 'Failed to upload profile image',
        });
      }
    } else {
      // Profile image is mandatory
      if (req.files) {
        Object.values(req.files).forEach((fileArray) => {
          fileArray.forEach((file) => cleanupFile(file));
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Profile image is required',
      });
    }

    // Handle vehicle image upload
    let vehicleImageUrl = null;
    let vehicleImagePublicId = null;

    if (req.files && req.files.vehicleImage && req.files.vehicleImage[0]) {
      try {
        const result = await handleFileUpload(
          req.files.vehicleImage[0],
          'agroconnect/vehicles',
          'driver',
          null,
          'vehicle'
        );

        if (result) {
          vehicleImageUrl = result.secure_url;
          vehicleImagePublicId = result.public_id;
        }
      } catch (uploadError) {
        if (req.files) {
          Object.values(req.files).forEach((fileArray) => {
            fileArray.forEach((file) => cleanupFile(file));
          });
        }
        return res.status(500).json({
          success: false,
          message: 'Failed to upload vehicle image',
        });
      }
    }

    // Handle verification documents upload
    const verificationDocuments = [];

    // Check if vehicle type is bicycle
    const isBicycle = parsedVehicleInfo?.vehicleType === 'bicycle';

    // Handle driving license (mandatory only if not bicycle)
    if (req.files && req.files.drivingLicense && req.files.drivingLicense[0]) {
      try {
        const result = await handleFileUpload(
          req.files.drivingLicense[0],
          'agroconnect/verification/driver',
          'driver',
          null,
          'driving_license'
        );

        if (result) {
          verificationDocuments.push({
            documentType: 'driving_license',
            documentNumber: req.body.drivingLicenseNumber || '',
            documentUrl: result.secure_url,
            cloudinaryPublicId: result.public_id,
            cloudinaryResourceType: result.resource_type,
          });
        }
      } catch (uploadError) {
        if (req.files) {
          Object.values(req.files).forEach((fileArray) => {
            fileArray.forEach((file) => cleanupFile(file));
          });
        }
        return res.status(500).json({
          success: false,
          message: 'Failed to upload driving license',
        });
      }
    } else if (!isBicycle) {
      // Driving license is required only if not bicycle
      if (req.files) {
        Object.values(req.files).forEach((fileArray) => {
          fileArray.forEach((file) => cleanupFile(file));
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Driving license is required for non-bicycle vehicles',
      });
    }

    // Handle NID (if provided)
    if (req.files && req.files.nidFront && req.files.nidFront[0]) {
      try {
        let nidUrls = [];
        let nidPublicIds = [];

        // Front side
        const frontResult = await handleFileUpload(
          req.files.nidFront[0],
          'agroconnect/verification/driver',
          'driver',
          null,
          'nid'
        );
        nidUrls.push(frontResult.secure_url);
        nidPublicIds.push(frontResult.public_id);

        // Back side (if provided)
        if (req.files.nidBack && req.files.nidBack[0]) {
          const backResult = await handleFileUpload(
            req.files.nidBack[0],
            'agroconnect/verification/driver',
            'driver',
            null,
            'nid'
          );
          nidUrls.push(backResult.secure_url);
          nidPublicIds.push(backResult.public_id);
        }

        verificationDocuments.push({
          documentType: 'nid',
          documentNumber: req.body.nidNumber || '',
          documentUrl: nidUrls.join('|||'),
          cloudinaryPublicId: nidPublicIds.join('|||'),
          cloudinaryResourceType: 'image',
        });
      } catch (uploadError) {
        if (req.files) {
          Object.values(req.files).forEach((fileArray) => {
            fileArray.forEach((file) => cleanupFile(file));
          });
        }
        return res.status(500).json({
          success: false,
          message: 'Failed to upload NID',
        });
      }
    }

    // Handle Passport (if provided) - OPTIONAL, NOT REQUIRED
    if (req.files && req.files.passport && req.files.passport[0]) {
      try {
        const result = await handleFileUpload(
          req.files.passport[0],
          'agroconnect/verification/driver',
          'driver',
          null,
          'passport'
        );

        verificationDocuments.push({
          documentType: 'passport',
          documentNumber: req.body.passportNumber || '',
          documentUrl: result.secure_url,
          cloudinaryPublicId: result.public_id,
          cloudinaryResourceType: result.resource_type,
        });
      } catch (uploadError) {
        if (req.files) {
          Object.values(req.files).forEach((fileArray) => {
            fileArray.forEach((file) => cleanupFile(file));
          });
        }
        return res.status(500).json({
          success: false,
          message: 'Failed to upload passport',
        });
      }
    }

    // Validation for documents
    // For bicycle: No documents required (NID optional but recommended)
    // For other vehicles: Driving license is mandatory, NID is optional but recommended
    if (!isBicycle && verificationDocuments.length < 1) {
      if (req.files) {
        Object.values(req.files).forEach((fileArray) => {
          fileArray.forEach((file) => cleanupFile(file));
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Please provide driving license (NID is recommended but optional)',
      });
    }

    // Create driver user
    const driver = await User.create({
      name,
      email,
      password,
      phone,
      role: 'driver',
      driverType,
      location,
      profileImage: profileImageUrl,
      profileImagePublicId: profileImagePublicId,
      vehicleInfo: {
        ...parsedVehicleInfo,
        vehicleImage: vehicleImageUrl,
        vehicleImagePublicId: vehicleImagePublicId,
      },
      verificationDocuments,
      verificationStatus: 'pending',
      isVerified: false,
      isAvailable: false, // Driver starts as unavailable until verified
    });

    // Notify admin about new driver registration
    await notifyAdminNewDocument(driver._id, 'driver');

    if (driver) {
      res.status(201).json({
        success: true,
        message:
          'Driver registered successfully. Your documents are under review. You will be notified once verified.',
        data: {
          _id: driver._id,
          name: driver.name,
          email: driver.email,
          phone: driver.phone,
          role: driver.role,
          location: driver.location,
          vehicleInfo: driver.vehicleInfo,
          isVerified: driver.isVerified,
          verificationStatus: driver.verificationStatus,
          verificationDocuments: driver.verificationDocuments,
          isActive: driver.isActive,
          createdAt: driver.createdAt,
          token: generateToken(driver._id),
        },
      });
    }
  } catch (error) {
    // Clean up all uploaded files on error
    if (req.files) {
      Object.values(req.files).forEach((fileArray) => {
        fileArray.forEach((file) => cleanupFile(file));
      });
    }

    console.error('Driver registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during driver registration',
    });
  }
};
