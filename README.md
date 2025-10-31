# Backend API

Express.js backend with MongoDB and JWT authentication.

## Features

- ✅ Express.js server
- ✅ MongoDB database integration
- ✅ JWT-based authentication
- ✅ Modular architecture
- ✅ User registration and login
- ✅ Protected routes
- ✅ Admin role support
- ✅ Input validation
- ✅ Error handling

## Project Structure

```
backend/
├── src/
│   ├── app/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.model.js
│   │   │   │   ├── auth.controller.js
│   │   │   │   └── auth.routes.js
│   │   │   └── user/
│   │   │       ├── user.model.js
│   │   │       ├── user.controller.js
│   │   │       └── user.routes.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js
│   │   │   ├── validate.middleware.js
│   │   │   └── error.middleware.js
│   │   └── routes.js
│   ├── config/
│   │   ├── db.js
│   │   └── config.js
│   └── app.js
├── server.js
├── .env
├── .env.example
└── package.json
```

## Installation

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

- Copy `.env.example` to `.env`
- Update the values in `.env` file:
  - `MONGODB_URI`: Your MongoDB connection string
  - `JWT_SECRET`: Your secret key for JWT
  - Other configuration as needed

3. Make sure MongoDB is running locally or use MongoDB Atlas

## Running the Server

Development mode (with auto-reload):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Auth Routes

- **POST** `/api/auth/register` - Register a new user

  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```

- **POST** `/api/auth/login` - Login user

  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

- **GET** `/api/auth/me` - Get current user (Protected)
  - Requires: `Authorization: Bearer <token>`

### User Routes (Admin Only)

- **GET** `/api/users` - Get all users
- **GET** `/api/users/:id` - Get user by ID
- **PUT** `/api/users/:id` - Update user
- **DELETE** `/api/users/:id` - Delete user

All user routes require authentication and admin role.

### Health Check

- **GET** `/api/health` - Check server status
- **GET** `/` - API welcome message

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. After login or registration, you'll receive a
token. Include this token in the Authorization header for protected routes:

```
Authorization: Bearer <your_token_here>
```

## User Roles

- **user**: Default role for registered users
- **admin**: Admin role with access to user management endpoints

## Environment Variables

| Variable        | Description               | Default               |
| --------------- | ------------------------- | --------------------- |
| PORT            | Server port               | 5000                  |
| NODE_ENV        | Environment               | development           |
| MONGODB_URI     | MongoDB connection string | -                     |
| JWT_SECRET      | JWT secret key            | -                     |
| JWT_EXPIRES_IN  | Token expiration time     | 7d                    |
| ALLOWED_ORIGINS | CORS allowed origins      | http://localhost:3000 |

## Technologies Used

- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment configuration
