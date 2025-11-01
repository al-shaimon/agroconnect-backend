import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if running in production/Vercel
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

// Configure storage based on environment
let storage;

if (isProduction) {
  // In production (Vercel), use memory storage
  console.log('📦 Using memory storage for file uploads (Production/Vercel)');
  storage = multer.memoryStorage();
} else {
  // In development, use disk storage
  console.log('💾 Using disk storage for file uploads (Development)');

  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(__dirname, '../../uploads/verification');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, 'doc-' + uniqueSuffix + path.extname(file.originalname));
    },
  });
}

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images only (JPEG, JPG, PNG, WebP)
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG, WebP) are allowed'));
  }
};

// Configure multer
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});
