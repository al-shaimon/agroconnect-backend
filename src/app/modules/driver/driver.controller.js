import asyncHandler from 'express-async-handler';
import User from '../auth/auth.model.js';
import mongoose from 'mongoose';
import { uploadToCloudinary, deleteFromCloudinary } from '../../../config/cloudinary.js';
import fs from 'fs';

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

// @desc    Get driver profile
// @route   GET /api/driver/profile
// @access  Private (Driver)
export const getDriverProfile = asyncHandler(async (req, res) => {
  const driver = await User.findById(req.user._id).select('-password');

  if (!driver || driver.role !== 'driver') {
    res.status(404);
    throw new Error('Driver not found');
  }

  res.status(200).json({
    success: true,
    data: driver,
  });
});

// @desc    Update driver profile
// @route   PUT /api/driver/profile
// @access  Private (Driver)
export const updateDriverProfile = asyncHandler(async (req, res) => {
  const driver = await User.findById(req.user._id);

  if (!driver || driver.role !== 'driver') {
    res.status(404);
    throw new Error('Driver not found');
  }

  const { name, phone, location, vehicleInfo } = req.body;

  // Handle profile image upload if provided
  if (req.files && req.files.profileImage && req.files.profileImage[0]) {
    try {
      // Delete old profile image from Cloudinary if exists
      if (driver.profileImagePublicId) {
        await deleteFromCloudinary(driver.profileImagePublicId);
      }

      // Upload new profile image
      const result = await handleFileUpload(
        req.files.profileImage[0],
        'agroconnect/profiles/driver',
        'driver',
        driver._id.toString(),
        'profile'
      );

      if (result) {
        driver.profileImage = result.secure_url;
        driver.profileImagePublicId = result.public_id;
      }
    } catch (uploadError) {
      cleanupFile(req.files.profileImage[0]);
      res.status(500);
      throw new Error('Failed to upload profile image');
    }
  }

  // Handle vehicle image upload if provided
  if (req.files && req.files.vehicleImage && req.files.vehicleImage[0]) {
    try {
      // Delete old vehicle image from Cloudinary if exists
      if (driver.vehicleInfo?.vehicleImagePublicId) {
        await deleteFromCloudinary(driver.vehicleInfo.vehicleImagePublicId);
      }

      // Upload new vehicle image
      const result = await handleFileUpload(
        req.files.vehicleImage[0],
        'agroconnect/vehicles',
        'driver',
        driver._id.toString(),
        'vehicle'
      );

      if (result) {
        if (!driver.vehicleInfo) {
          driver.vehicleInfo = {};
        }
        driver.vehicleInfo.vehicleImage = result.secure_url;
        driver.vehicleInfo.vehicleImagePublicId = result.public_id;
      }
    } catch (uploadError) {
      cleanupFile(req.files.vehicleImage[0]);
      res.status(500);
      throw new Error('Failed to upload vehicle image');
    }
  }

  if (name) driver.name = name;
  if (phone) driver.phone = phone;
  if (location) driver.location = location;
  if (vehicleInfo) {
    // Parse vehicleInfo if it's a string
    let parsedVehicleInfo = vehicleInfo;
    if (typeof vehicleInfo === 'string') {
      try {
        parsedVehicleInfo = JSON.parse(vehicleInfo);
      } catch (e) {
        res.status(400);
        throw new Error('Invalid vehicle info format');
      }
    }

    // Only include vehicle number if not bicycle
    const updatedVehicleInfo = {
      ...driver.vehicleInfo,
      ...parsedVehicleInfo,
    };

    // Remove vehicleNumber if vehicle type is bicycle
    if (parsedVehicleInfo.vehicleType === 'bicycle') {
      delete updatedVehicleInfo.vehicleNumber;
    }

    driver.vehicleInfo = updatedVehicleInfo;
  }

  const updatedDriver = await driver.save();

  res.status(200).json({
    success: true,
    data: updatedDriver,
  });
});

// @desc    Update driver availability status
// @route   PUT /api/driver/availability
// @access  Private (Driver)
export const updateAvailability = asyncHandler(async (req, res) => {
  const { isAvailable } = req.body;

  const driver = await User.findByIdAndUpdate(
    req.user._id,
    { isAvailable },
    { new: true, runValidators: true }
  );

  if (!driver || driver.role !== 'driver') {
    res.status(404);
    throw new Error('Driver not found');
  }

  res.status(200).json({
    success: true,
    message: `You are now ${isAvailable ? 'available' : 'unavailable'} for deliveries`,
    data: { isAvailable: driver.isAvailable },
  });
});

// @desc    Update driver current location
// @route   PUT /api/driver/location
// @access  Private (Driver)
export const updateLocation = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    res.status(400);
    throw new Error('Please provide both latitude and longitude');
  }

  const driver = await User.findByIdAndUpdate(
    req.user._id,
    {
      currentLocation: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
    },
    { new: true }
  );

  if (!driver || driver.role !== 'driver') {
    res.status(404);
    throw new Error('Driver not found');
  }

  res.status(200).json({
    success: true,
    message: 'Location updated successfully',
    data: { currentLocation: driver.currentLocation },
  });
});

// @desc    Get available delivery orders
// @route   GET /api/driver/available-orders
// @access  Private (Driver)
export const getAvailableOrders = asyncHandler(async (req, res) => {
  const Order = mongoose.model('Order');

  // Get orders that are confirmed but not assigned to any driver
  const orders = await Order.find({
    status: 'confirmed',
    driver: { $exists: false },
  })
    .populate('farmer', 'name phone location')
    .populate('buyer', 'name phone location')
    .populate('items.product', 'name images')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

// @desc    Get assigned orders
// @route   GET /api/driver/my-orders
// @access  Private (Driver)
export const getMyOrders = asyncHandler(async (req, res) => {
  const Order = mongoose.model('Order');
  const { status } = req.query;

  let query = { driver: req.user._id };

  if (status) {
    query.status = status;
  }

  const orders = await Order.find(query)
    .populate('farmer', 'name phone location')
    .populate('buyer', 'name phone location')
    .populate('items.product', 'name images')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

// @desc    Accept delivery order
// @route   POST /api/driver/accept-order/:orderId
// @access  Private (Driver)
export const acceptOrder = asyncHandler(async (req, res) => {
  const Order = mongoose.model('Order');
  const { orderId } = req.params;

  const order = await Order.findById(orderId);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.status !== 'confirmed') {
    res.status(400);
    throw new Error('Order is not available for pickup');
  }

  if (order.driver) {
    res.status(400);
    throw new Error('Order already assigned to another driver');
  }

  // Check if driver is available
  const driver = await User.findById(req.user._id);
  if (!driver.isAvailable) {
    res.status(400);
    throw new Error('You are currently unavailable. Please update your availability status.');
  }

  order.driver = req.user._id;
  order.status = 'picked_up';
  order.pickedUpAt = new Date();

  await order.save();

  // Populate order details
  await order.populate('farmer', 'name phone location');
  await order.populate('buyer', 'name phone location');
  await order.populate('items.product', 'name images');

  res.status(200).json({
    success: true,
    message: 'Order accepted successfully',
    data: order,
  });
});

// @desc    Update delivery status
// @route   PUT /api/driver/order/:orderId/status
// @access  Private (Driver)
export const updateDeliveryStatus = asyncHandler(async (req, res) => {
  const Order = mongoose.model('Order');
  const { orderId } = req.params;
  const { status } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.driver.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this order');
  }

  const allowedStatuses = ['picked_up', 'in_transit', 'delivered'];
  if (!allowedStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  order.status = status;

  if (status === 'delivered') {
    order.deliveredAt = new Date();

    // Update driver statistics
    const driver = await User.findById(req.user._id);
    driver.completedDeliveries += 1;
    await driver.save();
  }

  await order.save();

  // Populate order details
  await order.populate('farmer', 'name phone location');
  await order.populate('buyer', 'name phone location');
  await order.populate('items.product', 'name images');

  res.status(200).json({
    success: true,
    message: `Order status updated to ${status}`,
    data: order,
  });
});

// @desc    Get driver statistics
// @route   GET /api/driver/stats
// @access  Private (Driver)
export const getDriverStats = asyncHandler(async (req, res) => {
  const Order = mongoose.model('Order');

  const driver = await User.findById(req.user._id);

  // Get total earnings
  const completedOrders = await Order.find({
    driver: req.user._id,
    status: 'delivered',
  });

  const totalEarnings = completedOrders.reduce((sum, order) => {
    return sum + (order.deliveryFee || 0);
  }, 0);

  // Get orders in different states
  const activeOrders = await Order.countDocuments({
    driver: req.user._id,
    status: { $in: ['picked_up', 'in_transit'] },
  });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayDeliveries = await Order.countDocuments({
    driver: req.user._id,
    status: 'delivered',
    deliveredAt: { $gte: todayStart },
  });

  res.status(200).json({
    success: true,
    data: {
      completedDeliveries: driver.completedDeliveries,
      rating: driver.rating,
      totalRatings: driver.totalRatings,
      totalEarnings,
      activeOrders,
      todayDeliveries,
    },
  });
});

// @desc    Get nearby drivers (for admin)
// @route   GET /api/driver/nearby
// @access  Private (Admin)
export const getNearbyDrivers = asyncHandler(async (req, res) => {
  const { latitude, longitude, maxDistance = 10000 } = req.query; // maxDistance in meters

  if (!latitude || !longitude) {
    res.status(400);
    throw new Error('Please provide latitude and longitude');
  }

  const drivers = await User.find({
    role: 'driver',
    isAvailable: true,
    isVerified: true,
    verificationStatus: 'approved',
    currentLocation: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
        $maxDistance: parseInt(maxDistance),
      },
    },
  }).select('name phone vehicleInfo currentLocation rating completedDeliveries');

  res.status(200).json({
    success: true,
    count: drivers.length,
    data: drivers,
  });
});
