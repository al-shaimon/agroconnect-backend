import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['farmer', 'buyer', 'admin'],
      required: [true, 'Please specify a role'],
    },
    location: {
      area: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    verificationDocuments: [
      {
        documentType: {
          type: String,
          enum: ['nid', 'passport', 'driving_license', 'birth_certificate', 'trade_license'],
        },
        documentNumber: String,
        documentUrl: String,
        cloudinaryPublicId: String,
        cloudinaryResourceType: String, // 'image' or 'raw' for PDFs
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    rejectionReason: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
