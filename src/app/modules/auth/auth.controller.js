import User from './auth.model.js';
import jwt from 'jsonwebtoken';
import { config } from '../../../config/config.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../../config/cloudinary.js';
import fs from 'fs';
import { notifyAdminNewDocument } from '../../../utils/notificationHelper.js';

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
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either farmer or buyer',
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      // Clean up uploaded file if user exists
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
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
        const result = await uploadToCloudinary(
          req.file.path,
          `agroconnect/profiles/${role}`,
          role,
          null,
          null
        );
        profileImageUrl = result.secure_url;
        profileImagePublicId = result.public_id;

        // Delete local file
        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        // Delete local file on error
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
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
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
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
        const result = await uploadToCloudinary(
          req.file.path,
          `agroconnect/profiles/${user.role}`,
          user.role,
          null,
          null
        );
        user.profileImage = result.secure_url;
        user.profileImagePublicId = result.public_id;

        // Delete local file
        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        // Delete local file on error
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
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
      req.files.forEach((file) => {
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
      return res.status(400).json({
        success: false,
        message: 'Please upload both front and back images of your NID (2 images required)',
      });
    }

    if (documentType !== 'nid' && req.files.length > 1) {
      // Delete uploaded files
      req.files.forEach((file) => {
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
      return res.status(400).json({
        success: false,
        message: 'Please upload only one image for this document type',
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      // Delete uploaded files if user not found
      req.files.forEach((file) => {
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
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

      const cloudinaryResult = await uploadToCloudinary(
        file.path,
        'agroconnect',
        user.role,
        user._id.toString(),
        documentType + suffix
      );

      uploadedUrls.push(cloudinaryResult.url);
      uploadedPublicIds.push(cloudinaryResult.publicId);

      // Delete local file after successful upload to Cloudinary
      fs.unlinkSync(file.path);
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
