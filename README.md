# TabletTap Backend API

<div align="center">
  
  🚀 **Restaurant Order Management System Backend**
  
  Built with NestJS, MongoDB, and WebSocket for real-time order updates
  
</div>

---

## 📋 Features

- ✅ **Authentication**: JWT + Google OAuth
- ✅ **Role-Based Access Control**: Waiter, Owner, Admin roles
- ✅ **Real-time Updates**: WebSocket integration for live order updates
- ✅ **Auto-Incrementing Order Numbers**: Per-restaurant order tracking
- ✅ **Complete Order Management**: Create, update, track orders
- ✅ **Table Management**: Batch creation and status tracking
- ✅ **Menu System**: Items with modifiers and categories
- ✅ **Security**: Rate limiting, input validation, CORS, Helmet

---

## 🛠️ Tech Stack

- **Framework**: NestJS (TypeScript)
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + Passport
- **Real-time**: Socket.io
- **Validation**: class-validator
- **Security**: Helmet, Throttler

---

## 📦 Installation

```bash
# Install dependencies
npm install
```

---

## ⚙️ Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update `.env` with your configuration:
```env
# MongoDB Atlas connection string (or local MongoDB)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tabletap

# JWT Secret (use a strong random string in production)
JWT_SECRET=your-super-secret-key-change-this-in-production

# Google OAuth (optional, for Google sign-in)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Server Port
PORT=3000
```

---

## 🚀 Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
# Build
npm run build

# Start
npm run start:prod
```

### Testing
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## 📡 API Endpoints

Base URL: `http://localhost:3000/v1`

### Authentication
- `POST /auth/register` - Register new user + restaurant
- `POST /auth/login` - Login with email/password
- `POST /auth/google` - Google OAuth login
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user profile

### Restaurants
- `GET /restaurants/:id` - Get restaurant details
- `PUT /restaurants/:id` - Update restaurant (Owner/Admin)
- `GET /restaurants/:id/analytics` - Get analytics (Owner/Admin)
- `DELETE /restaurants/:id` - Delete restaurant (Admin only)

### Tables
- `POST /tables/batch` - Create multiple tables
- `POST /tables` - Create single table
- `GET /tables` - Get all tables for restaurant
- `GET /tables/:id` - Get specific table
- `PUT /tables/:id` - Update table
- `DELETE /tables/:id` - Delete table

### Menu
- `POST /menu` - Add menu item (Owner/Admin)
- `GET /menu` - Get menu items (with filters)
- `GET /menu/:id` - Get specific menu item
- `PUT /menu/:id` - Update menu item (Owner/Admin)
- `PATCH /menu/:id/toggle-availability` - Toggle availability (Owner/Admin)
- `DELETE /menu/:id` - Delete menu item (Owner/Admin)

### Orders
- `POST /orders` - Create new order
- `GET /orders` - Get all orders (with filters)
- `GET /orders/today` - Get today's orders
- `GET /orders/:id` - Get specific order
- `PUT /orders/:id/status` - Update order status
- `PUT /orders/:id/items` - Add items to existing order

### WebSocket Events
- `joinRestaurant` - Join restaurant room
- `order-created` - New order notification
- `order-updated` - Order status changed
- `table-status-changed` - Table status changed
- `kitchen-alert` - New order for kitchen

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── auth/              # Authentication module
│   │   ├── guards/        # JWT and Roles guards
│   │   ├── strategies/    # Passport strategies
│   │   ├── decorators/    # Custom decorators
│   │   └── dto/           # Data transfer objects
│   ├── users/             # Users module
│   ├── restaurants/       # Restaurants module
│   ├── tables/            # Tables module
│   ├── menu/              # Menu items module
│   ├── orders/            # Orders module (core)
│   │   ├── schemas/       # Order & OrderCounter schemas
│   │   └── orders.gateway.ts  # WebSocket gateway
│   ├── config/            # Configuration
│   └── main.ts            # Application entry point
├── test/                  # E2E tests
├── .env                   # Environment variables
└── package.json
```

---

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth with 15-minute access tokens
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: 100 requests per minute per IP
- **Input Validation**: Automatic DTO validation
- **CORS**: Configurable cross-origin requests
- **Helmet**: Security headers
- **Data Isolation**: Restaurant-based data separation

---

## 🗄️ Database Schema

### Collections
1. **Users**: User accounts with roles
2. **Restaurants**: Restaurant details and settings
3. **Tables**: Table management with status
4. **MenuItems**: Menu items with modifiers
5. **Orders**: Complete order tracking
6. **OrderCounters**: Auto-increment order numbers

---

## 🔄 Order Flow

1. Waiter selects table
2. Adds menu items with modifiers
3. Creates order → WebSocket notification
4. Kitchen receives alert
5. Status updates propagate in real-time
6. Order completion updates table status

---

## 🎯 Next Steps

- [ ] Connect MongoDB Atlas cluster
- [ ] Test authentication endpoints
- [ ] Create sample menu items
- [ ] Test order creation flow
- [ ] Set up mobile app integration

---

## 📝 License

Copyright (c) 2025 Ismoiljon Masharipov. All Rights Reserved.

This software is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

---

## 👥 Support

For issues or questions, contact the development team.
