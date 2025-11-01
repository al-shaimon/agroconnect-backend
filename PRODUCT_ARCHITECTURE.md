# New Product Architecture - Farmer Competition Model

## Overview

The product system has been refactored from farmer-owned products to a **Global Product + Farmer
Pricing** model, enabling healthy competition between farmers for the same products.

## Architecture

### Old Model (Deprecated)

- Farmers create and manage their own products
- Each product belongs to a single farmer
- Buyers see duplicate product entries

### New Model ✅

- **GlobalProduct**: Admin creates a single product (e.g., "Tomato")
- **FarmerProduct**: Multiple farmers offer their own price/quantity for that product
- Buyers see ONE product with multiple farmer offerings for price comparison

## Database Models

### GlobalProduct (Admin-Managed)

**File**: `backend/src/app/modules/product/globalProduct.model.js`

```javascript
{
  name: String (unique, required),         // "Tomato", "Rice", etc.
  category: String (required),             // "Vegetables", "Grains"
  description: String,
  unit: String (default: 'kg'),
  images: [String],                        // Cloudinary URLs
  cloudinaryPublicIds: [String],           // For cleanup
  isActive: Boolean (default: true)
}
```

**Indexes**:

- Text search: `name`, `category`, `description`
- Single field: `category`, `isActive`

### FarmerProduct (Farmer-Managed)

**File**: `backend/src/app/modules/product/farmerProduct.model.js`

```javascript
{
  globalProductId: ObjectId (ref: 'GlobalProduct', required),
  farmerId: ObjectId (ref: 'User', required),
  price: Number (required, min: 0),
  availableQuantity: Number (required, min: 0),
  quality: String (enum: ['Premium', 'Standard', 'Organic']),
  harvestDate: Date,
  isAvailable: Boolean (default: true),
  location: {
    area: String,
    city: String
  }
}
```

**Critical Index**:

```javascript
{ globalProductId: 1, farmerId: 1 }, { unique: true }
```

This ensures **one farmer can only have ONE listing per global product**.

## API Endpoints

### Admin Routes (Product Catalog Management)

**Base**: `/api/products/admin/global-products`

| Method | Endpoint | Description                                 |
| ------ | -------- | ------------------------------------------- |
| GET    | `/`      | List all global products                    |
| GET    | `/:id`   | Get product + all farmer offerings          |
| POST   | `/`      | Create global product (with images)         |
| PUT    | `/:id`   | Update product (replace images)             |
| DELETE | `/:id`   | Delete product + cascade to farmer products |

**Features**:

- Cloudinary image upload (max 5 images)
- Duplicate name prevention
- Cascade delete to all FarmerProducts
- Populates farmer data (name, rating, location)

### Farmer Routes (Price/Inventory Management)

**Base**: `/api/products/farmer`

| Method | Endpoint              | Description                                       |
| ------ | --------------------- | ------------------------------------------------- |
| GET    | `/available-products` | Get all global products (mark which farmer sells) |
| GET    | `/my-products`        | Get farmer's own product offerings                |
| POST   | `/my-products`        | Create/update offering for a global product       |
| PUT    | `/my-products/:id`    | Update price/quantity                             |
| DELETE | `/my-products/:id`    | Remove offering                                   |

**Unique Constraint Handling**:

- POST to `/my-products` automatically creates OR updates
- If farmer already sells this product → updates existing
- If new → creates new offering

### Buyer Routes (Browse & Compare)

**Base**: `/api/products/buyer`

| Method | Endpoint               | Description                                            |
| ------ | ---------------------- | ------------------------------------------------------ |
| GET    | `/products`            | List global products with farmer counts & price ranges |
| GET    | `/products/:id`        | Get product details + ALL farmer offerings (sorted)    |
| GET    | `/farmer-products/:id` | Get specific farmer's offering                         |
| GET    | `/search?query=...`    | Search products by name/category                       |
| GET    | `/categories`          | Get all available categories                           |

**Product Detail Features**:

- Sort farmers by: price, rating, quantity
- Shows statistics: min/max/avg price, total farmers
- Populated farmer data: name, rating, location

## Frontend Components

### Admin - Global Products Page

**File**: `frontend/src/pages/admin/GlobalProducts.tsx` **Route**: `/admin/products`

**Features**:

- Create/edit/delete global products
- Upload up to 5 images per product
- Filter by category, search products
- Shows farmer count per product
- Form validation

**Form Fields**:

- Product Name\* (unique)
- Category\* (dropdown)
- Unit (kg, liter, piece, etc.)
- Description
- Images (multiple upload)

### Navigation

**Sidebar Updated**: Added "Products" link for admin **Icon**: Package2 (from lucide-react)

## Data Flow Examples

### Example 1: Admin Creates Product

1. Admin creates "Tomato" in `/admin/products`
2. GlobalProduct created: `{ name: "Tomato", category: "Vegetables", unit: "kg" }`
3. Farmers see "Tomato" in available products list

### Example 2: Farmers Set Prices

1. **Farmer A** adds offering: `{ globalProductId: "Tomato", price: 50, quantity: 100 }`
2. **Farmer B** adds offering: `{ globalProductId: "Tomato", price: 45, quantity: 200 }`
3. **Farmer C** adds offering: `{ globalProductId: "Tomato", price: 55, quantity: 150 }`

### Example 3: Buyer Views Product

Buyer clicks "Tomato" on marketplace:

**Response**:

```json
{
  "product": {
    "name": "Tomato",
    "category": "Vegetables",
    "images": [...]
  },
  "farmers": [
    {
      "farmerId": { "name": "Farmer B", "rating": 4.8 },
      "price": 45,
      "availableQuantity": 200,
      "quality": "Premium"
    },
    {
      "farmerId": { "name": "Farmer A", "rating": 4.5 },
      "price": 50,
      "availableQuantity": 100,
      "quality": "Organic"
    },
    {
      "farmerId": { "name": "Farmer C", "rating": 4.2 },
      "price": 55,
      "availableQuantity": 150,
      "quality": "Standard"
    }
  ],
  "stats": {
    "totalFarmers": 3,
    "minPrice": 45,
    "maxPrice": 55,
    "avgPrice": 50
  }
}
```

Buyer compares and selects based on:

- Price
- Farmer rating
- Quality
- Harvest date
- Location

## Migration Checklist

### ✅ Completed

- [x] Database models created
- [x] Admin product controller (CRUD)
- [x] Farmer product controller
- [x] Buyer product controller
- [x] Routes configuration
- [x] Routes integrated into main app
- [x] Admin UI - Global Products page
- [x] Admin service methods
- [x] Sidebar navigation updated

### ⏳ Pending (Next Steps)

- [ ] **Farmer UI**: Manage product offerings
  - Select global products
  - Set price/quantity
  - Update/delete offerings
- [ ] **Buyer UI**: Marketplace redesign
  - Show global products
  - Product detail with farmer comparison
  - Sort/filter farmers
- [ ] **Cart System Update**:
  - Cart items reference `farmerProductId` instead of `productId`
  - Track which farmer's product is in cart
- [ ] **Order System Update**:
  - Order items reference `farmerProductId`
  - Farmer receives orders for their offerings
  - Inventory deduction from FarmerProduct
- [ ] **Data Migration**:
  - Script to migrate existing Product → GlobalProduct + FarmerProduct
  - Update existing orders to reference new structure

## Controllers Implementation

### Global Product Controller

**File**: `backend/src/app/modules/product/globalProduct.controller.js`

**Key Functions**:

- `createGlobalProduct()` - Cloudinary upload, duplicate check
- `getAllGlobalProducts()` - Filter by category/search/active
- `getGlobalProduct()` - Returns product + all farmer offerings
- `updateGlobalProduct()` - Replace images in Cloudinary
- `deleteGlobalProduct()` - Cascades to FarmerProduct entries

### Farmer Product Controller

**File**: `backend/src/app/modules/product/farmerProduct.controller.js`

**Key Functions**:

- `getAvailableGlobalProducts()` - Lists all products (marks which farmer sells)
- `createOrUpdateFarmerProduct()` - Upsert logic (create or update)
- `getFarmerProducts()` - Farmer's own offerings
- `updateFarmerProduct()` - Update price/quantity
- `deleteFarmerProduct()` - Remove offering

### Buyer Product Controller

**File**: `backend/src/app/modules/product/buyerProduct.controller.js`

**Key Functions**:

- `getAllProducts()` - Global products with stats (farmer count, price range)
- `getProductDetails()` - Product + all farmers (sorted, populated)
- `getFarmerProductDetails()` - Specific farmer's offering
- `searchProducts()` - Search by name/category
- `getCategories()` - Distinct categories

## Key Features

### Admin

- Full control over product catalog
- One product per type (no duplicates)
- Can deactivate products
- Cascade delete protection

### Farmer

- Choose which products to sell
- Set competitive prices
- Manage inventory per product
- One offering per product (enforced)
- Quality grades: Premium, Standard, Organic

### Buyer

- See all farmers for one product
- Compare prices, ratings, quality
- Sort by preference
- Better shopping experience

## Database Constraints

### Unique Constraints

1. `GlobalProduct.name` - Ensures no duplicate products
2. `(FarmerProduct.globalProductId, FarmerProduct.farmerId)` - One farmer, one listing per product

### Cascade Deletes

When GlobalProduct is deleted → All related FarmerProducts are deleted

## File Structure

```
backend/src/app/modules/product/
├── globalProduct.model.js       # Admin's product catalog
├── farmerProduct.model.js       # Farmer's pricing/inventory
├── globalProduct.controller.js  # Admin CRUD operations
├── farmerProduct.controller.js  # Farmer offerings management
├── buyerProduct.controller.js   # Browse & compare
└── product.routes.js            # All product routes

backend/uploads/
└── products/                    # Product images upload directory

frontend/src/pages/admin/
├── GlobalProducts.tsx           # Admin product management UI
└── index.ts                     # Exports

frontend/src/services/
└── adminService.ts              # Admin API methods
```

## Testing Checklist

### Admin

- [ ] Create global product with images
- [ ] Update product (name, category, images)
- [ ] Delete product (verify farmer products removed)
- [ ] Search products
- [ ] Filter by category
- [ ] Verify duplicate name prevention

### Farmer

- [ ] View available global products
- [ ] Add offering for a product (first time)
- [ ] Update offering (price/quantity)
- [ ] Try adding duplicate (should update existing)
- [ ] Delete offering
- [ ] Verify unique constraint works

### Buyer

- [ ] Browse global products
- [ ] View product details with farmer list
- [ ] Sort farmers by price/rating
- [ ] Filter by quality
- [ ] Search products
- [ ] View categories

## Security Notes

- Admin routes: `restrictTo('admin')` middleware
- Farmer routes: `restrictTo('farmer')` + ownership verification
- Buyer routes: Public (no auth required)
- Image upload: 5MB limit, image files only
- Cloudinary cleanup: Automatic on update/delete

## Performance Optimizations

- **Indexes**: Text search, category, isActive, compound indexes
- **Population**: Only necessary fields populated
- **Aggregation**: Stats calculated in single query
- **Pagination**: Ready for future implementation

---

**Status**: Backend complete, Admin UI complete, Farmer/Buyer UI pending **Last Updated**: 2025
