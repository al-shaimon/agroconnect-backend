import ProductSlot from './productSlot.model.js';
import Product from './product.model.js';

// Valid time slots (10 AM to 11 PM, 2-hour intervals)
const VALID_TIME_SLOTS = [
  { start: '10:00', end: '12:00' },
  { start: '12:00', end: '14:00' },
  { start: '14:00', end: '16:00' },
  { start: '16:00', end: '18:00' },
  { start: '18:00', end: '20:00' },
  { start: '20:00', end: '22:00' },
  { start: '22:00', end: '23:00' }, // Last slot is 1 hour
];

// Helper function to validate date range (current date to 5 days ahead)
const isValidDateRange = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const inputDate = new Date(date);
  inputDate.setHours(0, 0, 0, 0);

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 5);

  return inputDate >= today && inputDate <= maxDate;
};

// Helper function to validate time slot
const isValidTimeSlot = (start, end) => {
  return VALID_TIME_SLOTS.some((slot) => slot.start === start && slot.end === end);
};

// @desc    Create or update multiple product slots
// @route   POST /api/farmer/products/:productId/slots
// @access  Private (Farmer only)
export const createOrUpdateSlots = async (req, res) => {
  try {
    const { productId } = req.params;
    const { slots } = req.body; // Array of { date, timeSlot: { start, end }, quantity }

    // Verify product exists and belongs to farmer
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (product.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to manage slots for this product',
      });
    }

    if (!Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Slots array is required',
      });
    }

    const createdSlots = [];
    const errors = [];

    for (const slotData of slots) {
      const { date, timeSlot, quantity } = slotData;

      // Validate date range
      if (!isValidDateRange(date)) {
        errors.push({
          date,
          error: 'Date must be between today and 5 days from now',
        });
        continue;
      }

      // Validate time slot
      if (!isValidTimeSlot(timeSlot.start, timeSlot.end)) {
        errors.push({
          date,
          timeSlot,
          error: 'Invalid time slot',
        });
        continue;
      }

      // Validate quantity
      if (quantity <= 0) {
        errors.push({
          date,
          timeSlot,
          error: 'Quantity must be greater than 0',
        });
        continue;
      }

      try {
        // Check if slot already exists
        const existingSlot = await ProductSlot.findOne({
          productId,
          date: new Date(date),
          'timeSlot.start': timeSlot.start,
        });

        if (existingSlot) {
          // Update existing slot
          existingSlot.availableQuantity = quantity;
          existingSlot.originalQuantity = quantity;
          existingSlot.isActive = true;
          await existingSlot.save();
          createdSlots.push(existingSlot);
        } else {
          // Create new slot
          const newSlot = await ProductSlot.create({
            productId,
            farmerId: req.user._id,
            date: new Date(date),
            timeSlot,
            availableQuantity: quantity,
            originalQuantity: quantity,
            isActive: true,
          });
          createdSlots.push(newSlot);
        }
      } catch (error) {
        errors.push({
          date,
          timeSlot,
          error: error.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Slots processed successfully',
      data: {
        created: createdSlots,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all slots for a product
// @route   GET /api/farmer/products/:productId/slots
// @access  Private (Farmer only)
export const getProductSlots = async (req, res) => {
  try {
    const { productId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify product exists and belongs to farmer
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (product.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view slots for this product',
      });
    }

    const query = { productId };

    // Add date range filter if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    const slots = await ProductSlot.find(query).sort({ date: 1, 'timeSlot.start': 1 });

    res.status(200).json({
      success: true,
      count: slots.length,
      data: slots,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all slots for farmer's products
// @route   GET /api/farmer/slots
// @access  Private (Farmer only)
export const getFarmerSlots = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = { farmerId: req.user._id };

    // Add date range filter if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    const slots = await ProductSlot.find(query)
      .populate('productId', 'name imageUrl category')
      .sort({ date: 1, 'timeSlot.start': 1 });

    res.status(200).json({
      success: true,
      count: slots.length,
      data: slots,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Toggle slot active status
// @route   PATCH /api/farmer/slots/:slotId/toggle
// @access  Private (Farmer only)
export const toggleSlotStatus = async (req, res) => {
  try {
    const { slotId } = req.params;

    const slot = await ProductSlot.findById(slotId);

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found',
      });
    }

    // Verify slot belongs to farmer
    if (slot.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this slot',
      });
    }

    slot.isActive = !slot.isActive;
    await slot.save();

    res.status(200).json({
      success: true,
      message: `Slot ${slot.isActive ? 'activated' : 'deactivated'} successfully`,
      data: slot,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete a slot
// @route   DELETE /api/farmer/slots/:slotId
// @access  Private (Farmer only)
export const deleteSlot = async (req, res) => {
  try {
    const { slotId } = req.params;

    const slot = await ProductSlot.findById(slotId);

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found',
      });
    }

    // Verify slot belongs to farmer
    if (slot.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this slot',
      });
    }

    await ProductSlot.findByIdAndDelete(slotId);

    res.status(200).json({
      success: true,
      message: 'Slot deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get available time slots (for reference)
// @route   GET /api/farmer/slots/available-times
// @access  Private (Farmer only)
export const getAvailableTimeSlots = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: VALID_TIME_SLOTS,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get available slots for a product (Public - for buyers)
// @route   GET /api/public/products/:productId/slots
// @access  Public
export const getPublicProductSlots = async (req, res) => {
  try {
    const { productId } = req.params;
    const { date } = req.query;

    const query = {
      productId,
      isActive: true,
      availableQuantity: { $gt: 0 },
    };

    // Filter by specific date or get slots from today to 5 days ahead
    if (date) {
      query.date = new Date(date);
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const maxDate = new Date(today);
      maxDate.setDate(maxDate.getDate() + 5);

      query.date = {
        $gte: today,
        $lte: maxDate,
      };
    }

    const slots = await ProductSlot.find(query).sort({ date: 1, 'timeSlot.start': 1 });

    res.status(200).json({
      success: true,
      count: slots.length,
      data: slots,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
