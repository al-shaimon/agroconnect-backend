import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import GlobalProduct from './src/app/modules/product/globalProduct.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

// Sample global products data
const globalProducts = [
  // Vegetables
  {
    name: 'Tomato',
    category: 'Vegetables',
    description: 'Fresh red tomatoes, perfect for salads and cooking',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Potato',
    category: 'Vegetables',
    description: 'High-quality potatoes, versatile for all dishes',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Onion',
    category: 'Vegetables',
    description: 'Fresh onions, essential for cooking',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Cabbage',
    category: 'Vegetables',
    description: 'Crisp and fresh cabbage',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Cauliflower',
    category: 'Vegetables',
    description: 'Fresh white cauliflower',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Carrot',
    category: 'Vegetables',
    description: 'Sweet and crunchy carrots',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Eggplant (Brinjal)',
    category: 'Vegetables',
    description: 'Fresh eggplants for various dishes',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Green Chili',
    category: 'Vegetables',
    description: 'Spicy green chilies',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Cucumber',
    category: 'Vegetables',
    description: 'Fresh and crispy cucumbers',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Bitter Gourd',
    category: 'Vegetables',
    description: 'Healthy bitter gourd',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },

  // Fruits
  {
    name: 'Mango',
    category: 'Fruits',
    description: 'Sweet and juicy mangoes',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Banana',
    category: 'Fruits',
    description: 'Fresh ripe bananas',
    unit: 'dozen',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Papaya',
    category: 'Fruits',
    description: 'Sweet and nutritious papaya',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Guava',
    category: 'Fruits',
    description: 'Fresh guava rich in vitamin C',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Watermelon',
    category: 'Fruits',
    description: 'Juicy and refreshing watermelon',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Pineapple',
    category: 'Fruits',
    description: 'Sweet and tangy pineapple',
    unit: 'piece',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Jackfruit',
    category: 'Fruits',
    description: 'Large tropical jackfruit',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Lychee',
    category: 'Fruits',
    description: 'Sweet and aromatic lychee',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },

  // Grains
  {
    name: 'Rice (Miniket)',
    category: 'Grains',
    description: 'Premium miniket rice',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Rice (Basmati)',
    category: 'Grains',
    description: 'Aromatic basmati rice',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Rice (Brown)',
    category: 'Grains',
    description: 'Healthy brown rice',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Wheat',
    category: 'Grains',
    description: 'High-quality wheat grains',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Corn (Maize)',
    category: 'Grains',
    description: 'Fresh corn kernels',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },

  // Pulses
  {
    name: 'Red Lentil (Masoor Dal)',
    category: 'Pulses',
    description: 'High-quality red lentils',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Yellow Lentil (Mung Dal)',
    category: 'Pulses',
    description: 'Premium yellow lentils',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Black Lentil (Urad Dal)',
    category: 'Pulses',
    description: 'Nutritious black lentils',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Chickpeas',
    category: 'Pulses',
    description: 'Protein-rich chickpeas',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Green Gram (Mung Beans)',
    category: 'Pulses',
    description: 'Fresh green gram',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },

  // Spices
  {
    name: 'Turmeric Powder',
    category: 'Spices',
    description: 'Pure turmeric powder',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Cumin Seeds',
    category: 'Spices',
    description: 'Aromatic cumin seeds',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Coriander Seeds',
    category: 'Spices',
    description: 'Fresh coriander seeds',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Black Pepper',
    category: 'Spices',
    description: 'Premium black pepper',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Cardamom',
    category: 'Spices',
    description: 'Aromatic green cardamom',
    unit: 'gram',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Cinnamon',
    category: 'Spices',
    description: 'Quality cinnamon sticks',
    unit: 'gram',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Ginger',
    category: 'Spices',
    description: 'Fresh ginger root',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Garlic',
    category: 'Spices',
    description: 'Fresh garlic bulbs',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },

  // Dairy
  {
    name: 'Milk',
    category: 'Dairy',
    description: 'Fresh cow milk',
    unit: 'liter',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Yogurt',
    category: 'Dairy',
    description: 'Fresh homemade yogurt',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Butter',
    category: 'Dairy',
    description: 'Pure butter',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Ghee',
    category: 'Dairy',
    description: 'Pure desi ghee',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },

  // Organic
  {
    name: 'Organic Spinach',
    category: 'Organic',
    description: 'Chemical-free organic spinach',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Organic Lettuce',
    category: 'Organic',
    description: 'Fresh organic lettuce',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Organic Strawberry',
    category: 'Organic',
    description: 'Sweet organic strawberries',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Organic Honey',
    category: 'Organic',
    description: 'Pure organic honey',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },

  // Seeds
  {
    name: 'Mustard Seeds',
    category: 'Seeds',
    description: 'Quality mustard seeds',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Sesame Seeds',
    category: 'Seeds',
    description: 'Premium sesame seeds',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Sunflower Seeds',
    category: 'Seeds',
    description: 'Nutritious sunflower seeds',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
  {
    name: 'Pumpkin Seeds',
    category: 'Seeds',
    description: 'Healthy pumpkin seeds',
    unit: 'kg',
    images: [],
    cloudinaryPublicIds: [],
    isActive: true,
  },
];

const seedGlobalProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing global products
    await GlobalProduct.deleteMany({});
    console.log('🗑️  Cleared existing global products');

    // Insert new global products
    const insertedProducts = await GlobalProduct.insertMany(globalProducts);
    console.log(`✅ Inserted ${insertedProducts.length} global products`);

    // Display summary by category
    console.log('\n📊 Products by Category:');
    const categoryCounts = insertedProducts.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {});

    Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`   ${category}: ${count} products`);
      });

    console.log('\n✨ Global products seeded successfully!');
    console.log('👉 Farmers can now select these products and set their own prices');
  } catch (error) {
    console.error('❌ Error seeding global products:', error.message);
    if (error.code === 11000) {
      console.error('   Duplicate product name found. Please ensure all product names are unique.');
    }
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the seeder
seedGlobalProducts();
