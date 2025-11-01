import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      // Don't set required: true here since it's auto-generated in pre-save hook
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Buyer ID is required'],
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Farmer ID is required'],
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        productName: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1'],
        },
        pricePerUnit: {
          type: Number,
          required: true,
          min: [0, 'Price cannot be negative'],
        },
        subtotal: {
          type: Number,
          required: true,
          min: [0, 'Subtotal cannot be negative'],
        },
        deliverySlot: {
          slotId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProductSlot',
          },
          date: {
            type: Date,
          },
          timeSlot: {
            start: String,
            end: String,
          },
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in-transit', 'delivered', 'cancelled'],
      default: 'pending',
    },
    deliveryAddress: {
      area: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      details: {
        type: String,
      },
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid'],
      default: 'unpaid',
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    deliveryDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate orderId before saving
orderSchema.pre('save', async function (next) {
  if (this.isNew) {
    const date = new Date();
    const dateString = date.toISOString().split('T')[0].replace(/-/g, '');

    // Find the count of orders created today
    const count = await mongoose.model('Order').countDocuments({
      createdAt: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999)),
      },
    });

    this.orderId = `ORD-${dateString}-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

// Indexes for better query performance
orderSchema.index({ buyerId: 1 });
orderSchema.index({ farmerId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderDate: -1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
