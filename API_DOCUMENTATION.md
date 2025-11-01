# AgroConnect API Documentation

Complete REST API documentation for the AgroConnect platform - A direct farmer-buyer marketplace.

**Base URL:** `http://localhost:5000/api`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Farmer Routes](#farmer-routes)
3. [Buyer Routes](#buyer-routes)
4. [Admin Routes](#admin-routes)
5. [Notification Routes](#notification-routes)
6. [Public Routes](#public-routes)

---

## Authentication

### 1. Register User

**Endpoint:** `POST /api/auth/register`  
**Access:** Public  
**Description:** Register a new user (farmer or buyer)

**Request Body:**

```json
{
  "name": "John Farmer",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+8801712345678",
  "role": "farmer",
  "location": {
    "area": "Mirpur",
    "city": "Dhaka",
    "coordinates": {
      "lat": 23.8103,
      "lng": 90.4125
    }
  }
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "654321abc",
    "name": "John Farmer",
    "email": "john@example.com",
    "phone": "+8801712345678",
    "role": "farmer",
    "location": {
      "area": "Mirpur",
      "city": "Dhaka"
    },
    "isVerified": false,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 2. Login User

**Endpoint:** `POST /api/auth/login`  
**Access:** Public  
**Description:** Login with email and password

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "654321abc",
    "name": "John Farmer",
    "email": "john@example.com",
    "phone": "+8801712345678",
    "role": "farmer",
    "location": {
      "area": "Mirpur",
      "city": "Dhaka"
    },
    "isVerified": false,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. Get Current User Profile

**Endpoint:** `GET /api/auth/me`  
**Access:** Private (All authenticated users)  
**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "654321abc",
    "name": "John Farmer",
    "email": "john@example.com",
    "phone": "+8801712345678",
    "role": "farmer",
    "location": {
      "area": "Mirpur",
      "city": "Dhaka"
    },
    "isVerified": false,
    "isActive": true,
    "createdAt": "2025-11-01T08:00:00.000Z"
  }
}
```

---

### 4. Update User Profile

**Endpoint:** `PUT /api/auth/profile`  
**Access:** Private (All authenticated users)  
**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "name": "John Updated",
  "phone": "+8801798765432",
  "location": {
    "area": "Gulshan",
    "city": "Dhaka"
  }
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "654321abc",
    "name": "John Updated",
    "email": "john@example.com",
    "phone": "+8801798765432",
    "role": "farmer",
    "location": {
      "area": "Gulshan",
      "city": "Dhaka"
    },
    "isVerified": false
  }
}
```

---

## Farmer Routes

All farmer routes require authentication and farmer role.  
**Headers:** `Authorization: Bearer <token>`

### 1. Create Product

**Endpoint:** `POST /api/farmer/products`  
**Access:** Private (Farmer only)

**Request Body:**

```json
{
  "name": "Fresh Tomatoes",
  "category": "Vegetable",
  "description": "Organic tomatoes fresh from the farm",
  "price": 60,
  "unit": "kg",
  "availableQuantity": 100,
  "quality": "Organic",
  "harvestDate": "2025-10-30",
  "location": "Mirpur, Dhaka"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "_id": "prod123",
    "farmerId": "654321abc",
    "name": "Fresh Tomatoes",
    "category": "Vegetable",
    "description": "Organic tomatoes fresh from the farm",
    "price": 60,
    "unit": "kg",
    "availableQuantity": 100,
    "quality": "Organic",
    "harvestDate": "2025-10-30T00:00:00.000Z",
    "isAvailable": true,
    "location": "Mirpur, Dhaka",
    "createdAt": "2025-11-01T08:00:00.000Z"
  }
}
```

---

### 2. Get My Products

**Endpoint:** `GET /api/farmer/products`  
**Access:** Private (Farmer only)

**Response (200):**

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "prod123",
      "name": "Fresh Tomatoes",
      "category": "Vegetable",
      "price": 60,
      "availableQuantity": 100,
      "isAvailable": true
    }
  ]
}
```

---

### 3. Get Product by ID

**Endpoint:** `GET /api/farmer/products/:id`  
**Access:** Private (Farmer only)

**Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "prod123",
    "farmerId": "654321abc",
    "name": "Fresh Tomatoes",
    "category": "Vegetable",
    "price": 60,
    "availableQuantity": 100
  }
}
```

---

### 4. Update Product

**Endpoint:** `PUT /api/farmer/products/:id`  
**Access:** Private (Farmer only)

**Request Body:**

```json
{
  "price": 65,
  "availableQuantity": 80
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "_id": "prod123",
    "name": "Fresh Tomatoes",
    "price": 65,
    "availableQuantity": 80
  }
}
```

---

### 5. Delete Product

**Endpoint:** `DELETE /api/farmer/products/:id`  
**Access:** Private (Farmer only)

**Response (200):**

```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

### 6. Get Farmer Orders

**Endpoint:** `GET /api/farmer/orders`  
**Access:** Private (Farmer only)  
**Query Parameters:** `?status=pending` (optional)

**Response (200):**

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "order123",
      "orderId": "ORD-20251101-001",
      "buyerId": {
        "name": "Jane Buyer",
        "email": "jane@example.com",
        "phone": "+8801823456789"
      },
      "items": [
        {
          "productName": "Fresh Tomatoes",
          "quantity": 10,
          "pricePerUnit": 60,
          "subtotal": 600
        }
      ],
      "totalAmount": 600,
      "status": "pending",
      "orderDate": "2025-11-01T08:00:00.000Z"
    }
  ]
}
```

---

### 7. Update Order Status

**Endpoint:** `PUT /api/farmer/orders/:id/status`  
**Access:** Private (Farmer only)

**Request Body:**

```json
{
  "status": "confirmed"
}
```

**Valid status values:** `pending`, `confirmed`, `in-transit`, `delivered`, `cancelled`

**Response (200):**

```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "_id": "order123",
    "orderId": "ORD-20251101-001",
    "status": "confirmed"
  }
}
```

---

### 8. Get Farmer Stats

**Endpoint:** `GET /api/farmer/stats`  
**Access:** Private (Farmer only)

**Response (200):**

```json
{
  "success": true,
  "data": {
    "products": {
      "total": 15,
      "available": 12
    },
    "orders": {
      "total": 45,
      "pending": 5,
      "confirmed": 10,
      "inTransit": 8,
      "delivered": 20
    },
    "revenue": {
      "total": 125000
    },
    "recentOrders": []
  }
}
```

---

## Buyer Routes

All buyer routes require authentication and buyer role.  
**Headers:** `Authorization: Bearer <token>`

### 1. Browse Products

**Endpoint:** `GET /api/buyer/products`  
**Access:** Private (Buyer only)  
**Query Parameters:**

- `category` - Filter by category
- `quality` - Filter by quality (Premium/Standard/Organic)
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `search` - Search in name, description, category
- `sortBy` - Sort field (default: createdAt)
- `order` - Sort order (asc/desc, default: desc)

**Example:** `GET /api/buyer/products?category=Vegetable&maxPrice=100`

**Response (200):**

```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "prod123",
      "farmerId": {
        "name": "John Farmer",
        "phone": "+8801712345678",
        "location": {
          "area": "Mirpur",
          "city": "Dhaka"
        }
      },
      "name": "Fresh Tomatoes",
      "category": "Vegetable",
      "price": 60,
      "availableQuantity": 100,
      "quality": "Organic"
    }
  ]
}
```

---

### 2. Get Product Details

**Endpoint:** `GET /api/buyer/products/:id`  
**Access:** Private (Buyer only)

**Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "prod123",
    "farmerId": {
      "name": "John Farmer",
      "phone": "+8801712345678",
      "email": "john@example.com"
    },
    "name": "Fresh Tomatoes",
    "category": "Vegetable",
    "description": "Organic tomatoes fresh from the farm",
    "price": 60,
    "unit": "kg",
    "availableQuantity": 100,
    "quality": "Organic"
  }
}
```

---

### 3. Place Order

**Endpoint:** `POST /api/buyer/orders`  
**Access:** Private (Buyer only)

**Request Body:**

```json
{
  "items": [
    {
      "productId": "prod123",
      "quantity": 10
    }
  ],
  "deliveryAddress": {
    "area": "Banani",
    "city": "Dhaka",
    "details": "House 45, Road 12"
  },
  "notes": "Please deliver in the morning"
}
```

**Note:** All items must be from the same farmer.

**Response (201):**

```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "_id": "order123",
    "orderId": "ORD-20251101-001",
    "buyerId": "buyer456",
    "farmerId": "farmer789",
    "items": [
      {
        "productId": "prod123",
        "productName": "Fresh Tomatoes",
        "quantity": 10,
        "pricePerUnit": 60,
        "subtotal": 600
      }
    ],
    "totalAmount": 600,
    "status": "pending",
    "deliveryAddress": {
      "area": "Banani",
      "city": "Dhaka",
      "details": "House 45, Road 12"
    }
  }
}
```

---

### 4. Get My Orders

**Endpoint:** `GET /api/buyer/orders`  
**Access:** Private (Buyer only)  
**Query Parameters:** `?status=pending` (optional)

**Response (200):**

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "order123",
      "orderId": "ORD-20251101-001",
      "farmerId": {
        "name": "John Farmer",
        "phone": "+8801712345678"
      },
      "totalAmount": 600,
      "status": "pending",
      "orderDate": "2025-11-01T08:00:00.000Z"
    }
  ]
}
```

---

### 5. Get Order Details

**Endpoint:** `GET /api/buyer/orders/:id`  
**Access:** Private (Buyer only)

**Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "order123",
    "orderId": "ORD-20251101-001",
    "farmerId": {
      "name": "John Farmer",
      "email": "john@example.com",
      "phone": "+8801712345678"
    },
    "items": [
      {
        "productId": "prod123",
        "productName": "Fresh Tomatoes",
        "quantity": 10,
        "pricePerUnit": 60,
        "subtotal": 600
      }
    ],
    "totalAmount": 600,
    "status": "pending",
    "deliveryAddress": {
      "area": "Banani",
      "city": "Dhaka"
    }
  }
}
```

---

### 6. Cancel Order

**Endpoint:** `PUT /api/buyer/orders/:id/cancel`  
**Access:** Private (Buyer only)

**Note:** Can only cancel orders with status "pending"

**Response (200):**

```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "_id": "order123",
    "orderId": "ORD-20251101-001",
    "status": "cancelled"
  }
}
```

---

### 7. Get Buyer Stats

**Endpoint:** `GET /api/buyer/stats`  
**Access:** Private (Buyer only)

**Response (200):**

```json
{
  "success": true,
  "data": {
    "orders": {
      "total": 20,
      "pending": 2,
      "confirmed": 5,
      "inTransit": 3,
      "delivered": 8,
      "cancelled": 2
    },
    "spending": {
      "total": 25000
    },
    "recentOrders": []
  }
}
```

---

## Admin Routes

All admin routes require authentication and admin role.  
**Headers:** `Authorization: Bearer <token>`

### 1. Get All Users

**Endpoint:** `GET /api/admin/users`  
**Access:** Private (Admin only)  
**Query Parameters:**

- `role` - Filter by role (farmer/buyer)
- `isVerified` - Filter by verification status (true/false)
- `isActive` - Filter by active status (true/false)

**Example:** `GET /api/admin/users?role=farmer&isActive=true`

**Response (200):**

```json
{
  "success": true,
  "count": 50,
  "data": [
    {
      "_id": "user123",
      "name": "John Farmer",
      "email": "john@example.com",
      "phone": "+8801712345678",
      "role": "farmer",
      "isVerified": true,
      "isActive": true,
      "createdAt": "2025-10-01T08:00:00.000Z"
    }
  ]
}
```

---

### 2. Get User Details

**Endpoint:** `GET /api/admin/users/:id`  
**Access:** Private (Admin only)

**Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "user123",
    "name": "John Farmer",
    "email": "john@example.com",
    "phone": "+8801712345678",
    "role": "farmer",
    "isVerified": true,
    "isActive": true,
    "productCount": 15,
    "orderCount": 45
  }
}
```

---

### 3. Verify User

**Endpoint:** `PUT /api/admin/users/:id/verify`  
**Access:** Private (Admin only)

**Response (200):**

```json
{
  "success": true,
  "message": "User verified successfully",
  "data": {
    "_id": "user123",
    "name": "John Farmer",
    "isVerified": true
  }
}
```

---

### 4. Update User Status

**Endpoint:** `PUT /api/admin/users/:id/status`  
**Access:** Private (Admin only)

**Request Body:**

```json
{
  "isActive": false
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "User deactivated successfully",
  "data": {
    "_id": "user123",
    "name": "John Farmer",
    "isActive": false
  }
}
```

---

### 5. Delete User

**Endpoint:** `DELETE /api/admin/users/:id`  
**Access:** Private (Admin only)

**Note:** Cannot delete admin accounts

**Response (200):**

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### 6. Get All Orders

**Endpoint:** `GET /api/admin/orders`  
**Access:** Private (Admin only)  
**Query Parameters:**

- `status` - Filter by status
- `startDate` - Filter by start date
- `endDate` - Filter by end date

**Response (200):**

```json
{
  "success": true,
  "count": 100,
  "data": [
    {
      "_id": "order123",
      "orderId": "ORD-20251101-001",
      "buyerId": {
        "name": "Jane Buyer"
      },
      "farmerId": {
        "name": "John Farmer"
      },
      "totalAmount": 600,
      "status": "pending"
    }
  ]
}
```

---

### 7. Get Order Details

**Endpoint:** `GET /api/admin/orders/:id`  
**Access:** Private (Admin only)

**Response (200):** Same as buyer's order details

---

### 8. Platform Statistics

**Endpoint:** `GET /api/admin/stats`  
**Access:** Private (Admin only)

**Response (200):**

```json
{
  "success": true,
  "data": {
    "users": {
      "total": 500,
      "farmers": 300,
      "buyers": 200,
      "verified": 450,
      "active": 480
    },
    "products": {
      "total": 1500,
      "available": 1200
    },
    "orders": {
      "total": 5000,
      "pending": 50,
      "confirmed": 200,
      "inTransit": 100,
      "delivered": 4500,
      "cancelled": 150
    },
    "revenue": {
      "total": 5000000
    },
    "recentOrders": [],
    "recentUsers": []
  }
}
```

---

### 9. Send Broadcast Notification

**Endpoint:** `POST /api/admin/broadcast`  
**Access:** Private (Admin only)

**Request Body:**

```json
{
  "title": "Platform Update",
  "message": "New features have been added to the platform",
  "recipientRole": "all"
}
```

**Valid recipientRole values:** `farmer`, `buyer`, `all`

**Response (201):**

```json
{
  "success": true,
  "message": "Broadcast sent successfully to 500 users",
  "data": {
    "_id": "notif123",
    "title": "Platform Update",
    "message": "New features have been added",
    "recipientRole": "all",
    "type": "broadcast"
  }
}
```

---

## Notification Routes

All notification routes require authentication.  
**Headers:** `Authorization: Bearer <token>`

### 1. Get My Notifications

**Endpoint:** `GET /api/notifications`  
**Access:** Private (All authenticated users)

**Response (200):**

```json
{
  "success": true,
  "count": 10,
  "unreadCount": 3,
  "data": [
    {
      "_id": "notif123",
      "type": "order",
      "title": "New Order Received",
      "message": "You have received a new order ORD-20251101-001 for ৳600",
      "orderId": "order123",
      "isRead": false,
      "createdAt": "2025-11-01T08:00:00.000Z"
    }
  ]
}
```

---

### 2. Mark Notification as Read

**Endpoint:** `PUT /api/notifications/:id/read`  
**Access:** Private (All authenticated users)

**Response (200):**

```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "_id": "notif123",
    "isRead": true
  }
}
```

---

### 3. Mark All as Read

**Endpoint:** `PUT /api/notifications/read-all`  
**Access:** Private (All authenticated users)

**Response (200):**

```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

### 4. Delete Notification

**Endpoint:** `DELETE /api/notifications/:id`  
**Access:** Private (All authenticated users)

**Note:** Can only delete personal notifications, not broadcasts

**Response (200):**

```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

## Public Routes

No authentication required for these routes.

### 1. Browse Products (Public)

**Endpoint:** `GET /api/public/products`  
**Access:** Public  
**Query Parameters:**

- `category` - Filter by category
- `quality` - Filter by quality
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `search` - Search term
- `sortBy` - Sort field
- `order` - Sort order (asc/desc)
- `limit` - Items per page (default: 20)
- `page` - Page number (default: 1)

**Response (200):**

```json
{
  "success": true,
  "count": 20,
  "total": 100,
  "page": 1,
  "pages": 5,
  "data": [
    {
      "_id": "prod123",
      "name": "Fresh Tomatoes",
      "category": "Vegetable",
      "price": 60,
      "availableQuantity": 100,
      "farmerId": {
        "name": "John Farmer",
        "location": {
          "area": "Mirpur",
          "city": "Dhaka"
        }
      }
    }
  ]
}
```

---

### 2. Public Platform Stats

**Endpoint:** `GET /api/public/stats`  
**Access:** Public

**Response (200):**

```json
{
  "success": true,
  "data": {
    "users": {
      "farmers": 300,
      "buyers": 200
    },
    "products": {
      "total": 1200,
      "byCategory": [
        {
          "_id": "Vegetable",
          "count": 450
        },
        {
          "_id": "Fruit",
          "count": 380
        }
      ]
    },
    "orders": {
      "total": 5000,
      "completed": 4500
    }
  }
}
```

---

### 3. Get Categories

**Endpoint:** `GET /api/public/categories`  
**Access:** Public

**Response (200):**

```json
{
  "success": true,
  "count": 5,
  "data": ["Vegetable", "Fruit", "Grain", "Dairy", "Poultry"]
}
```

---

## Error Responses

All endpoints may return the following error responses:

### Validation Error (400)

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

### Unauthorized (401)

```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```

### Forbidden (403)

```json
{
  "success": false,
  "message": "Access denied. This route is only accessible to farmer"
}
```

### Not Found (404)

```json
{
  "success": false,
  "message": "Resource not found"
}
```

### Server Error (500)

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Testing with Postman

1. **Import the collection** - Use the endpoints above to create requests
2. **Set up environment variables:**
   - `BASE_URL` = `http://localhost:5000/api`
   - `TOKEN` = Your JWT token after login
3. **For protected routes**, add header:
   - Key: `Authorization`
   - Value: `Bearer {{TOKEN}}`

---

## Quick Start Testing Flow

1. **Register as Farmer:**

   ```
   POST /api/auth/register
   Role: farmer
   ```

2. **Register as Buyer:**

   ```
   POST /api/auth/register
   Role: buyer
   ```

3. **Login and get token**

   ```
   POST /api/auth/login
   ```

4. **Create products (as farmer)**

   ```
   POST /api/farmer/products
   ```

5. **Browse products (as buyer)**

   ```
   GET /api/buyer/products
   ```

6. **Place order (as buyer)**

   ```
   POST /api/buyer/orders
   ```

7. **Update order status (as farmer)**
   ```
   PUT /api/farmer/orders/:id/status
   ```

---

## Notes

- All dates are in ISO 8601 format
- Prices are in BDT (Bangladeshi Taka)
- Phone numbers should include country code
- Order IDs are auto-generated in format: `ORD-YYYYMMDD-XXX`
- JWT tokens expire in 7 days by default
