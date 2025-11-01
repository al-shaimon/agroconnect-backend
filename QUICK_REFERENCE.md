# AgroConnect API - Quick Reference

## 🔗 Base URL

```
http://localhost:5000/api
```

## 🔐 Authentication Header

```
Authorization: Bearer <your_jwt_token>
```

---

## 🚀 Quick Start Commands

### 1. Register Farmer

```json
POST /api/auth/register
{
  "name": "John Farmer",
  "email": "farmer@test.com",
  "password": "password123",
  "phone": "+8801712345678",
  "role": "farmer",
  "location": { "area": "Mirpur", "city": "Dhaka" }
}
```

### 2. Register Buyer

```json
POST /api/auth/register
{
  "name": "Jane Buyer",
  "email": "buyer@test.com",
  "password": "password123",
  "phone": "+8801823456789",
  "role": "buyer",
  "location": { "area": "Banani", "city": "Dhaka" }
}
```

### 3. Login

```json
POST /api/auth/login
{
  "email": "farmer@test.com",
  "password": "password123"
}
```

### 4. Create Product (Farmer)

```json
POST /api/farmer/products
{
  "name": "Fresh Tomatoes",
  "category": "Vegetable",
  "price": 60,
  "availableQuantity": 100,
  "quality": "Organic"
}
```

### 5. Place Order (Buyer)

```json
POST /api/buyer/orders
{
  "items": [{ "productId": "PRODUCT_ID", "quantity": 10 }],
  "deliveryAddress": {
    "area": "Banani",
    "city": "Dhaka",
    "details": "House 45, Road 12"
  }
}
```

---

## 📋 All Endpoints Cheat Sheet

### Auth

| Method | Endpoint       | Access  | Description    |
| ------ | -------------- | ------- | -------------- |
| POST   | /auth/register | Public  | Register user  |
| POST   | /auth/login    | Public  | Login          |
| GET    | /auth/me       | Private | Get profile    |
| PUT    | /auth/profile  | Private | Update profile |

### Farmer

| Method | Endpoint                  | Access | Description         |
| ------ | ------------------------- | ------ | ------------------- |
| POST   | /farmer/products          | Farmer | Create product      |
| GET    | /farmer/products          | Farmer | Get my products     |
| GET    | /farmer/products/:id      | Farmer | Get product         |
| PUT    | /farmer/products/:id      | Farmer | Update product      |
| DELETE | /farmer/products/:id      | Farmer | Delete product      |
| GET    | /farmer/orders            | Farmer | Get my orders       |
| PUT    | /farmer/orders/:id/status | Farmer | Update order status |
| GET    | /farmer/stats             | Farmer | Get stats           |

### Buyer

| Method | Endpoint                 | Access | Description       |
| ------ | ------------------------ | ------ | ----------------- |
| GET    | /buyer/products          | Buyer  | Browse products   |
| GET    | /buyer/products/:id      | Buyer  | Get product       |
| POST   | /buyer/orders            | Buyer  | Place order       |
| GET    | /buyer/orders            | Buyer  | Get my orders     |
| GET    | /buyer/orders/:id        | Buyer  | Get order details |
| PUT    | /buyer/orders/:id/cancel | Buyer  | Cancel order      |
| GET    | /buyer/stats             | Buyer  | Get stats         |

### Admin

| Method | Endpoint                | Access | Description    |
| ------ | ----------------------- | ------ | -------------- |
| GET    | /admin/users            | Admin  | Get all users  |
| GET    | /admin/users/:id        | Admin  | Get user       |
| PUT    | /admin/users/:id/verify | Admin  | Verify user    |
| PUT    | /admin/users/:id/status | Admin  | Update status  |
| DELETE | /admin/users/:id        | Admin  | Delete user    |
| GET    | /admin/orders           | Admin  | Get all orders |
| GET    | /admin/orders/:id       | Admin  | Get order      |
| GET    | /admin/stats            | Admin  | Platform stats |
| POST   | /admin/broadcast        | Admin  | Send broadcast |

### Notifications

| Method | Endpoint                | Access  | Description          |
| ------ | ----------------------- | ------- | -------------------- |
| GET    | /notifications          | Private | Get my notifications |
| PUT    | /notifications/:id/read | Private | Mark as read         |
| PUT    | /notifications/read-all | Private | Mark all as read     |
| DELETE | /notifications/:id      | Private | Delete notification  |

### Public

| Method | Endpoint           | Access | Description     |
| ------ | ------------------ | ------ | --------------- |
| GET    | /public/products   | Public | Browse products |
| GET    | /public/stats      | Public | Public stats    |
| GET    | /public/categories | Public | Get categories  |

---

## 🎯 Common Query Parameters

### Product Filtering

```
GET /buyer/products?category=Vegetable&quality=Organic&maxPrice=100
GET /buyer/products?search=tomato&sortBy=price&order=asc
```

### Order Filtering

```
GET /farmer/orders?status=pending
GET /admin/orders?startDate=2025-11-01&endDate=2025-11-30
```

### User Filtering (Admin)

```
GET /admin/users?role=farmer&isActive=true
```

---

## 📊 Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ]
}
```

---

## 🔑 Order Status Values

- `pending` - Order placed, awaiting farmer confirmation
- `confirmed` - Farmer confirmed the order
- `in-transit` - Order is being delivered
- `delivered` - Order completed
- `cancelled` - Order cancelled

---

## 👥 User Roles

- `farmer` - Can create products and manage orders
- `buyer` - Can browse products and place orders
- `admin` - Full platform access and management

---

## 🎨 Product Quality Values

- `Premium` - Premium quality products
- `Standard` - Standard quality products
- `Organic` - Organic/certified products

---

## 📦 Common Product Categories

- Vegetable
- Fruit
- Grain
- Dairy
- Poultry
- Livestock
- Spices
- Herbs

---

## 💡 Pro Tips

1. **Always include Authorization header** for protected routes
2. **Use query parameters** for filtering and pagination
3. **Check response status codes** (200, 201, 400, 401, 403, 404, 500)
4. **Save JWT token** after login for subsequent requests
5. **Test public routes first** (no auth required)
6. **Use Postman collection** for faster testing

---

## 🔍 Testing Order

1. ✅ Register Farmer & Buyer
2. ✅ Login as Farmer
3. ✅ Create Products
4. ✅ Login as Buyer
5. ✅ Browse Products
6. ✅ Place Order
7. ✅ Check Notifications
8. ✅ Update Order Status (as Farmer)
9. ✅ View Statistics

---

## 🎉 Happy Testing!
