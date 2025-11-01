import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { config } from './src/config/config.js';
import User from './src/app/modules/auth/auth.model.js';
import Product from './src/app/modules/product/product.model.js';
import Order from './src/app/modules/order/order.model.js';

dotenv.config();

const seedGraphData = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ MongoDB Connected');

    // Find the farmer and buyer by email
    const farmer = await User.findOne({ email: 'farmer@test.com' });
    const buyer = await User.findOne({ email: 'buyer@test.com' });

    if (!farmer) {
      console.error('❌ Farmer not found with email: farmer@test.com');
      process.exit(1);
    }

    if (!buyer) {
      console.error('❌ Buyer not found with email: buyer@test.com');
      process.exit(1);
    }

    console.log(`📝 Found Farmer: ${farmer.name} (ID: ${farmer._id})`);
    console.log(`📝 Found Buyer: ${buyer.name} (ID: ${buyer._id})`);

    // Delete existing products and orders for this farmer to avoid duplicates
    await Product.deleteMany({ farmerId: farmer._id });
    await Order.deleteMany({ farmerId: farmer._id });
    console.log('🗑️  Cleared existing products and orders for this farmer');

    // Create diverse products with different categories
    const products = [
      {
        name: 'Organic Tomatoes',
        category: 'Vegetable',
        description: 'Fresh organic tomatoes, pesticide-free',
        price: 65,
        availableQuantity: 450,
        unit: 'kg',
        quality: 'Organic',
        harvestDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        farmerId: farmer._id,
        location: 'Dhaka, Bangladesh',
        isAvailable: true,
      },
      {
        name: 'Basmati Rice',
        category: 'Grain',
        description: 'Premium quality Basmati rice',
        price: 75,
        availableQuantity: 1200,
        unit: 'kg',
        quality: 'Premium',
        harvestDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        farmerId: farmer._id,
        location: 'Dhaka, Bangladesh',
        isAvailable: true,
      },
      {
        name: 'Fresh Cow Milk',
        category: 'Dairy',
        description: 'Pure fresh milk from grass-fed cows',
        price: 85,
        availableQuantity: 250,
        unit: 'liter',
        quality: 'Premium',
        harvestDate: new Date(),
        farmerId: farmer._id,
        location: 'Dhaka, Bangladesh',
        isAvailable: true,
      },
      {
        name: 'Fazli Mangoes',
        category: 'Fruit',
        description: 'Sweet and juicy Fazli mangoes from Rajshahi',
        price: 140,
        availableQuantity: 350,
        unit: 'kg',
        quality: 'Premium',
        harvestDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        farmerId: farmer._id,
        location: 'Dhaka, Bangladesh',
        isAvailable: true,
      },
      {
        name: 'Farm Fresh Eggs',
        category: 'Poultry',
        description: 'Free range chicken eggs, omega-3 enriched',
        price: 180,
        availableQuantity: 600,
        unit: 'dozen',
        quality: 'Organic',
        harvestDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        farmerId: farmer._id,
        location: 'Dhaka, Bangladesh',
        isAvailable: true,
      },
      {
        name: 'Red Spinach',
        category: 'Vegetable',
        description: 'Fresh red spinach bundles, rich in iron',
        price: 45,
        availableQuantity: 180,
        unit: 'bundle',
        quality: 'Standard',
        harvestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        farmerId: farmer._id,
        location: 'Dhaka, Bangladesh',
        isAvailable: true,
      },
      {
        name: 'White Potatoes',
        category: 'Vegetable',
        description: 'Premium quality white potatoes',
        price: 35,
        availableQuantity: 900,
        unit: 'kg',
        quality: 'Standard',
        harvestDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        farmerId: farmer._id,
        location: 'Dhaka, Bangladesh',
        isAvailable: true,
      },
      {
        name: 'Golden Papayas',
        category: 'Fruit',
        description: 'Sweet golden papayas, perfectly ripe',
        price: 55,
        availableQuantity: 220,
        unit: 'kg',
        quality: 'Standard',
        harvestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        farmerId: farmer._id,
        location: 'Dhaka, Bangladesh',
        isAvailable: true,
      },
      {
        name: 'Lady Finger (Okra)',
        category: 'Vegetable',
        description: 'Fresh tender lady finger vegetables',
        price: 50,
        availableQuantity: 160,
        unit: 'kg',
        quality: 'Standard',
        harvestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        farmerId: farmer._id,
        location: 'Dhaka, Bangladesh',
        isAvailable: true,
      },
      {
        name: 'Miniket Rice',
        category: 'Grain',
        description: 'Popular Miniket variety rice',
        price: 58,
        availableQuantity: 850,
        unit: 'kg',
        quality: 'Standard',
        harvestDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        farmerId: farmer._id,
        location: 'Dhaka, Bangladesh',
        isAvailable: true,
      },
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Created ${createdProducts.length} products`);

    // Helper function to generate order ID
    const generateOrderId = (date, index) => {
      const dateString = date.toISOString().split('T')[0].replace(/-/g, '');
      return `ORD-${dateString}-${String(index + 1).padStart(3, '0')}`;
    };

    // Create orders distributed across last 90 days with realistic patterns
    const orders = [];
    let orderIndex = 0;

    // Recent orders (last 7 days) - 5 orders
    const recentDays = [1, 2, 3, 5, 6];
    recentDays.forEach((daysAgo) => {
      const orderDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      // Mix of 1-3 products per order
      const numProducts = Math.floor(Math.random() * 3) + 1;
      const selectedProducts = [];
      const usedIndices = new Set();

      while (selectedProducts.length < numProducts) {
        const idx = Math.floor(Math.random() * createdProducts.length);
        if (!usedIndices.has(idx)) {
          usedIndices.add(idx);
          selectedProducts.push(createdProducts[idx]);
        }
      }

      const items = selectedProducts.map((product) => {
        const quantity = Math.floor(Math.random() * 30) + 10;
        return {
          productId: product._id,
          productName: product.name,
          quantity: quantity,
          pricePerUnit: product.price,
          subtotal: quantity * product.price,
        };
      });

      const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

      orders.push({
        orderId: generateOrderId(orderDate, orderIndex++),
        buyerId: buyer._id,
        farmerId: farmer._id,
        items: items,
        totalAmount: totalAmount,
        status: 'delivered',
        deliveryAddress: {
          area: ['Gulshan', 'Banani', 'Dhanmondi', 'Uttara'][Math.floor(Math.random() * 4)],
          city: 'Dhaka',
          details: `House ${Math.floor(Math.random() * 100) + 1}, Road ${
            Math.floor(Math.random() * 20) + 1
          }`,
        },
        paymentStatus: 'paid',
        createdAt: orderDate,
        updatedAt: orderDate,
        deliveryDate: new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000),
      });
    });

    // Mid-range orders (8-30 days ago) - 8 orders
    const midDays = [8, 10, 12, 15, 18, 21, 25, 28];
    midDays.forEach((daysAgo) => {
      const orderDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      const numProducts = Math.floor(Math.random() * 3) + 1;
      const selectedProducts = [];
      const usedIndices = new Set();

      while (selectedProducts.length < numProducts) {
        const idx = Math.floor(Math.random() * createdProducts.length);
        if (!usedIndices.has(idx)) {
          usedIndices.add(idx);
          selectedProducts.push(createdProducts[idx]);
        }
      }

      const items = selectedProducts.map((product) => {
        const quantity = Math.floor(Math.random() * 50) + 15;
        return {
          productId: product._id,
          productName: product.name,
          quantity: quantity,
          pricePerUnit: product.price,
          subtotal: quantity * product.price,
        };
      });

      const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

      orders.push({
        orderId: generateOrderId(orderDate, orderIndex++),
        buyerId: buyer._id,
        farmerId: farmer._id,
        items: items,
        totalAmount: totalAmount,
        status: 'delivered',
        deliveryAddress: {
          area: ['Mirpur', 'Mohammadpur', 'Badda', 'Rampura'][Math.floor(Math.random() * 4)],
          city: 'Dhaka',
          details: `House ${Math.floor(Math.random() * 100) + 1}, Road ${
            Math.floor(Math.random() * 20) + 1
          }`,
        },
        paymentStatus: 'paid',
        createdAt: orderDate,
        updatedAt: orderDate,
        deliveryDate: new Date(orderDate.getTime() + 3 * 24 * 60 * 60 * 1000),
      });
    });

    // Older orders (31-90 days ago) - 7 orders
    const oldDays = [35, 42, 50, 58, 65, 75, 85];
    oldDays.forEach((daysAgo) => {
      const orderDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      const numProducts = Math.floor(Math.random() * 4) + 1;
      const selectedProducts = [];
      const usedIndices = new Set();

      while (selectedProducts.length < numProducts) {
        const idx = Math.floor(Math.random() * createdProducts.length);
        if (!usedIndices.has(idx)) {
          usedIndices.add(idx);
          selectedProducts.push(createdProducts[idx]);
        }
      }

      const items = selectedProducts.map((product) => {
        const quantity = Math.floor(Math.random() * 40) + 20;
        return {
          productId: product._id,
          productName: product.name,
          quantity: quantity,
          pricePerUnit: product.price,
          subtotal: quantity * product.price,
        };
      });

      const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

      orders.push({
        orderId: generateOrderId(orderDate, orderIndex++),
        buyerId: buyer._id,
        farmerId: farmer._id,
        items: items,
        totalAmount: totalAmount,
        status: 'delivered',
        deliveryAddress: {
          area: ['Khilgaon', 'Tejgaon', 'Motijheel', 'Jatrabari'][Math.floor(Math.random() * 4)],
          city: 'Dhaka',
          details: `House ${Math.floor(Math.random() * 100) + 1}, Road ${
            Math.floor(Math.random() * 20) + 1
          }`,
        },
        paymentStatus: 'paid',
        createdAt: orderDate,
        updatedAt: orderDate,
        deliveryDate: new Date(orderDate.getTime() + 3 * 24 * 60 * 60 * 1000),
      });
    });

    // Add some pending/processing orders for realistic dashboard
    const pendingStatuses = ['pending', 'confirmed', 'in-transit'];
    for (let i = 0; i < 3; i++) {
      const orderDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const product = createdProducts[Math.floor(Math.random() * createdProducts.length)];
      const quantity = Math.floor(Math.random() * 20) + 5;

      orders.push({
        orderId: generateOrderId(orderDate, orderIndex++),
        buyerId: buyer._id,
        farmerId: farmer._id,
        items: [
          {
            productId: product._id,
            productName: product.name,
            quantity: quantity,
            pricePerUnit: product.price,
            subtotal: quantity * product.price,
          },
        ],
        totalAmount: quantity * product.price,
        status: pendingStatuses[i],
        deliveryAddress: {
          area: 'Gulshan',
          city: 'Dhaka',
          details: `House ${Math.floor(Math.random() * 100) + 1}`,
        },
        paymentStatus: i === 0 ? 'unpaid' : 'paid',
        createdAt: orderDate,
        updatedAt: orderDate,
      });
    }

    const createdOrders = await Order.insertMany(orders);
    const deliveredOrders = createdOrders.filter((o) => o.status === 'delivered');
    const pendingOrders = createdOrders.filter((o) => o.status === 'pending');
    const confirmedOrders = createdOrders.filter((o) => o.status === 'confirmed');
    const inTransitOrders = createdOrders.filter((o) => o.status === 'in-transit');

    console.log(`✅ Created ${createdOrders.length} orders`);
    console.log(`   - Delivered: ${deliveredOrders.length}`);
    console.log(`   - Pending: ${pendingOrders.length}`);
    console.log(`   - Confirmed: ${confirmedOrders.length}`);
    console.log(`   - In Transit: ${inTransitOrders.length}`);

    // Calculate total revenue from delivered orders
    const totalRevenue = deliveredOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    console.log('\n🎉 Graph seed data created successfully!');
    console.log('\n📊 Summary:');
    console.log('─────────────────────────────────────────');
    console.log(`Farmer: ${farmer.name} (${farmer.email})`);
    console.log(`Farmer ID: ${farmer._id}`);
    console.log(`Buyer: ${buyer.name} (${buyer.email})`);
    console.log(`Products Created: ${createdProducts.length}`);
    console.log(`Total Orders: ${createdOrders.length}`);
    console.log(`Delivered Orders: ${deliveredOrders.length}`);
    console.log(`Total Revenue: ৳${totalRevenue.toLocaleString()}`);
    console.log('─────────────────────────────────────────');
    console.log('\n📈 Order Distribution:');
    console.log(
      `Last 7 days: ${
        deliveredOrders.filter((o) => {
          const diff = Date.now() - new Date(o.createdAt).getTime();
          return diff <= 7 * 24 * 60 * 60 * 1000;
        }).length
      } orders`
    );
    console.log(
      `Last 30 days: ${
        deliveredOrders.filter((o) => {
          const diff = Date.now() - new Date(o.createdAt).getTime();
          return diff <= 30 * 24 * 60 * 60 * 1000;
        }).length
      } orders`
    );
    console.log(`Last 90 days: ${deliveredOrders.length} orders`);
    console.log('─────────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding graph data:', error);
    process.exit(1);
  }
};

seedGraphData();
