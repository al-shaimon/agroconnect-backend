# AgroConnect Backend

🌾 **AgroConnect** - A direct farmer-buyer marketplace platform connecting farmers with buyers,
eliminating middlemen and ensuring fair prices.

## 🚀 Features

- ✅ **Role-based Authentication** (Farmer, Buyer, Admin)
- ✅ **JWT-based Security**
- ✅ **Product Management** for Farmers
- ✅ **Order Management System**
- ✅ **Real-time Notifications**
- ✅ **Advanced Product Filtering & Search**
- ✅ **Admin Dashboard & User Management**
- ✅ **Broadcast Notifications**
- ✅ **Order Tracking System**
- ✅ **Platform Analytics & Statistics**
- ✅ **Public Product Browsing**

## 📁 Project Structure

```
backend/
├── src/
│   ├── app/
│   │   ├── modules/
│   │   │   ├── auth/              # Authentication module
│   │   │   │   ├── auth.model.js
│   │   │   │   ├── auth.controller.js
│   │   │   │   └── auth.routes.js
│   │   │   ├── farmer/            # Farmer module
│   │   │   │   ├── farmer.controller.js
│   │   │   │   └── farmer.routes.js
│   │   │   ├── buyer/             # Buyer module
│   │   │   │   ├── buyer.controller.js
│   │   │   │   └── buyer.routes.js
│   │   │   ├── admin/             # Admin module
│   │   │   │   ├── admin.controller.js
│   │   │   │   └── admin.routes.js
│   │   │   ├── product/           # Product model
│   │   │   │   └── product.model.js
│   │   │   ├── order/             # Order model
│   │   │   │   └── order.model.js
│   │   │   ├── notification/      # Notification module
│   │   │   │   ├── notification.model.js
│   │   │   │   ├── notification.controller.js
│   │   │   │   └── notification.routes.js
│   │   │   └── public/            # Public routes
│   │   │       ├── public.controller.js
│   │   │       └── public.routes.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js
│   │   │   ├── roleCheck.middleware.js
│   │   │   ├── validate.middleware.js
│   │   │   └── error.middleware.js
│   │   └── routes.js              # Main route aggregator
│   ├── config/
│   │   ├── db.js                  # MongoDB connection
│   │   └── config.js              # App configuration
│   └── app.js                     # Express app setup
├── server.js                      # Entry point
├── .env                           # Environment variables
├── .env.example                   # Environment template
├── package.json
├── API_DOCUMENTATION.md           # Complete API docs
└── README.md
```

## 🛠️ Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **CORS** - Cross-origin resource sharing
- **Socket.io** - Real-time notifications (ready)
- **Multer** - File upload handling (ready)

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## ⚙️ Installation

1. **Clone the repository:**

```bash
git clone <repository-url>
cd backend
```

2. **Install dependencies:**

```bash
npm install
```

3. **Configure environment variables:**

Copy `.env.example` to `.env` and update the values:

```env
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/agroconnect

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

4. **Start MongoDB:**

Make sure MongoDB is running on your system or use MongoDB Atlas connection string.

5. **Run the server:**

**Development mode (with auto-reload):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

The server will run on `http://localhost:5000`

## 📊 Database Schemas

### User Schema

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: Enum ['farmer', 'buyer', 'admin'],
  location: {
    area: String,
    city: String,
    coordinates: { lat: Number, lng: Number }
  },
  isVerified: Boolean,
  isActive: Boolean,
  timestamps: true
}
```

### Product Schema

```javascript
{
  farmerId: ObjectId (ref: User),
  name: String,
  category: String,
  description: String,
  price: Number,
  unit: String,
  availableQuantity: Number,
  imageUrl: String,
  quality: Enum ['Premium', 'Standard', 'Organic'],
  harvestDate: Date,
  isAvailable: Boolean,
  location: String,
  timestamps: true
}
```

### Order Schema

```javascript
{
  orderId: String (unique, auto-generated),
  buyerId: ObjectId (ref: User),
  farmerId: ObjectId (ref: User),
  items: [{
    productId: ObjectId,
    productName: String,
    quantity: Number,
    pricePerUnit: Number,
    subtotal: Number
  }],
  totalAmount: Number,
  status: Enum ['pending', 'confirmed', 'in-transit', 'delivered', 'cancelled'],
  deliveryAddress: { area, city, details },
  paymentStatus: Enum ['unpaid', 'paid'],
  orderDate: Date,
  deliveryDate: Date,
  notes: String,
  timestamps: true
}
```

### Notification Schema

```javascript
{
  recipientId: ObjectId (ref: User),
  recipientRole: Enum ['farmer', 'buyer', 'all'],
  type: Enum ['order', 'broadcast', 'system'],
  title: String,
  message: String,
  orderId: ObjectId (ref: Order),
  isRead: Boolean,
  timestamp: Date
}
```

## 🔐 API Endpoints Overview

### Authentication (`/api/auth`)

- `POST /register` - Register new user
- `POST /login` - User login
- `GET /me` - Get current user profile
- `PUT /profile` - Update user profile

### Farmer Routes (`/api/farmer`) - Protected

- `POST /products` - Create new product
- `GET /products` - Get all farmer's products
- `GET /products/:id` - Get single product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product
- `GET /orders` - Get all farmer's orders
- `PUT /orders/:id/status` - Update order status
- `GET /stats` - Get farmer dashboard stats

### Buyer Routes (`/api/buyer`) - Protected

- `GET /products` - Browse all products (with filters)
- `GET /products/:id` - Get product details
- `POST /orders` - Place new order
- `GET /orders` - Get buyer's order history
- `GET /orders/:id` - Get order details
- `PUT /orders/:id/cancel` - Cancel order
- `GET /stats` - Get buyer stats

### Admin Routes (`/api/admin`) - Protected (Admin only)

- `GET /users` - Get all users
- `GET /users/:id` - Get user details
- `PUT /users/:id/verify` - Verify user account
- `PUT /users/:id/status` - Activate/deactivate user
- `DELETE /users/:id` - Delete user
- `GET /orders` - Get all orders
- `GET /orders/:id` - Get order details
- `GET /stats` - Platform-wide statistics
- `POST /broadcast` - Send broadcast notification

### Notification Routes (`/api/notifications`) - Protected

- `GET /` - Get user's notifications
- `PUT /:id/read` - Mark notification as read
- `PUT /read-all` - Mark all as read
- `DELETE /:id` - Delete notification

### Public Routes (`/api/public`)

- `GET /products` - Browse products (no auth)
- `GET /stats` - Public platform stats
- `GET /categories` - Get product categories

## 📖 Complete API Documentation

For detailed API documentation with request/response examples, see
[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 🧪 Testing with Postman

1. Start the server
2. Create a new Postman collection
3. Set environment variables:

   - `BASE_URL`: `http://localhost:5000/api`
   - `TOKEN`: Your JWT token (after login)

4. **Quick Test Flow:**

```
1. Register Farmer: POST /api/auth/register
2. Register Buyer: POST /api/auth/register
3. Login: POST /api/auth/login
4. Create Product (Farmer): POST /api/farmer/products
5. Browse Products (Buyer): GET /api/buyer/products
6. Place Order (Buyer): POST /api/buyer/orders
7. Update Order Status (Farmer): PUT /api/farmer/orders/:id/status
```

## 🔒 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_token_here>
```

Get the token from the login or register response.

## 👥 User Roles

### Farmer

- Create and manage products
- View and manage orders
- Update order status
- View sales statistics

### Buyer

- Browse products
- Place orders
- Track orders
- Cancel pending orders
- View purchase history

### Admin

- Manage all users
- Verify user accounts
- View all orders
- Access platform statistics
- Send broadcast notifications
- Activate/deactivate users

## 🌟 Key Features Explained

### Auto-Generated Order IDs

Orders get unique IDs in format: `ORD-YYYYMMDD-XXX`

- Example: `ORD-20251101-001`

### Product Filtering

Buyers can filter products by:

- Category
- Quality (Premium/Standard/Organic)
- Price range
- Search keywords

### Notification System

- Order notifications for buyers and farmers
- Broadcast notifications from admin
- System notifications for account changes

### Order Status Flow

```
pending → confirmed → in-transit → delivered
         ↘ cancelled
```

## 🚧 Future Enhancements (Optional)

- [ ] Real-time Socket.io integration
- [ ] Image upload for products
- [ ] Payment gateway integration
- [ ] SMS notifications
- [ ] Email verification
- [ ] Rating & review system
- [ ] Advanced analytics dashboard
- [ ] Export reports (PDF/Excel)

## 🐛 Error Handling

The API uses consistent error responses:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": [] // For validation errors
}
```

## 📝 Environment Variables

| Variable        | Description               | Default     |
| --------------- | ------------------------- | ----------- |
| PORT            | Server port               | 5000        |
| NODE_ENV        | Environment               | development |
| MONGODB_URI     | MongoDB connection string | -           |
| JWT_SECRET      | JWT secret key            | -           |
| JWT_EXPIRES_IN  | Token expiration          | 7d          |
| ALLOWED_ORIGINS | CORS allowed origins      | -           |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

For any queries or issues, please create an issue in the repository.

---

**Happy Coding! 🌾**
