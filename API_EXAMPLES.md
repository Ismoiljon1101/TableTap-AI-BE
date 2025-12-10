# TabletTap API Examples

## Base URL
```
http://localhost:3000/v1
```

---

## 1. Authentication

### Register (Create Account + Restaurant)
```bash
curl -X POST http://localhost:3000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@restaurant.com",
    "password": "SecurePass123",
    "nickname": "John Doe",
    "restaurantName": "Delicious Bites"
  }'
```

**Response:**
```json
{
  "user": {
    "_id": "...",
    "email": "owner@restaurant.com",
    "nickname": "John Doe",
    "role": "owner",
    "restaurantId": "..."
  },
  "restaurant": {
    "_id": "...",
    "name": "Delicious Bites",
    "ownerId": "..."
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Login
```bash
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@restaurant.com",
    "password": "SecurePass123"
  }'
```

### Get Current User
```bash
curl -X GET http://localhost:3000/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 2. Tables Management

### Create Multiple Tables (Batch)
```bash
curl -X POST http://localhost:3000/v1/tables/batch \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tables": [
      { "name": "A1", "capacity": 4 },
      { "name": "A2", "capacity": 4 },
      { "name": "B1", "capacity": 2 },
      { "name": "B2", "capacity": 2 },
      { "name": "VIP1", "capacity": 8 }
    ]
  }'
```

### Get All Tables
```bash
curl -X GET http://localhost:3000/v1/tables \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 3. Menu Management

### Add Menu Item
```bash
curl -X POST http://localhost:3000/v1/menu \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chicken Burger",
    "price": 12.99,
    "category": "food",
    "isAvailable": true,
    "isPopular": true,
    "modifiers": [
      {
        "name": "Size",
        "options": [
          { "name": "Regular", "price": 0 },
          { "name": "Large", "price": 2.5 }
        ]
      },
      {
        "name": "Add-ons",
        "options": [
          { "name": "Extra Cheese", "price": 1.5 },
          { "name": "Bacon", "price": 2.0 }
        ]
      }
    ]
  }'
```

### Get Menu Items
```bash
# All items
curl -X GET http://localhost:3000/v1/menu \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Filter by category
curl -X GET "http://localhost:3000/v1/menu?category=food&available=true" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Toggle Item Availability
```bash
curl -X PATCH http://localhost:3000/v1/menu/MENU_ITEM_ID/toggle-availability \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 4. Orders

### Create Order
```bash
curl -X POST http://localhost:3000/v1/orders \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tableId": "TABLE_ID_HERE",
    "items": [
      {
        "menuItemId": "MENU_ITEM_ID",
        "name": "Chicken Burger",
        "quantity": 2,
        "unitPrice": 12.99,
        "modifiers": [
          { "name": "Size", "option": "Large", "price": 2.5 },
          { "name": "Add-ons", "option": "Extra Cheese", "price": 1.5 }
        ],
        "notes": "No onions please"
      },
      {
        "menuItemId": "MENU_ITEM_ID_2",
        "name": "Coke",
        "quantity": 2,
        "unitPrice": 2.5,
        "modifiers": []
      }
    ]
  }'
```

### Get All Orders
```bash
# All orders
curl -X GET http://localhost:3000/v1/orders \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Filter by status
curl -X GET "http://localhost:3000/v1/orders?status=pending" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Filter by table
curl -X GET "http://localhost:3000/v1/orders?tableId=TABLE_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Today's Orders
```bash
curl -X GET http://localhost:3000/v1/orders/today \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update Order Status
```bash
curl -X PUT http://localhost:3000/v1/orders/ORDER_ID/status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "preparing"
  }'
```

**Status values**: `pending`, `confirmed`, `preparing`, `ready`, `served`

### Add Items to Existing Order
```bash
curl -X PUT http://localhost:3000/v1/orders/ORDER_ID/items \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "menuItemId": "MENU_ITEM_ID",
        "name": "Dessert",
        "quantity": 1,
        "unitPrice": 6.99,
        "modifiers": []
      }
    ]
  }'
```

---

## 5. WebSocket Connection

### JavaScript Example
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

// Join restaurant room
socket.emit('joinRestaurant', 'YOUR_RESTAURANT_ID');

// Listen for order events
socket.on('order-created', (order) => {
  console.log('New order:', order);
});

socket.on('order-updated', (order) => {
  console.log('Order updated:', order);
});

socket.on('kitchen-alert', (alert) => {
  console.log('Kitchen alert:', alert);
});

socket.on('table-status-changed', (table) => {
  console.log('Table status changed:', table);
});
```

---

## Complete Flow Example

```bash
# 1. Register
RESPONSE=$(curl -s -X POST http://localhost:3000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@tabletap.com",
    "password": "demo123",
    "nickname": "Demo User",
    "restaurantName": "Demo Restaurant"
  }')

# Extract tokens (requires jq)
TOKEN=$(echo $RESPONSE | jq -r '.accessToken')
RESTAURANT_ID=$(echo $RESPONSE | jq -r '.restaurant._id')

# 2. Create tables
curl -X POST http://localhost:3000/v1/tables/batch \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tables": [
      { "name": "A1", "capacity": 4 },
      { "name": "A2", "capacity": 4 }
    ]
  }'

# 3. Add menu items
MENU_ITEM=$(curl -s -X POST http://localhost:3000/v1/menu \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Burger",
    "price": 10.99,
    "category": "food",
    "isAvailable": true
  }')

MENU_ITEM_ID=$(echo $MENU_ITEM | jq -r '._id')

# 4. Get tables
TABLES=$(curl -s -X GET http://localhost:3000/v1/tables \
  -H "Authorization: Bearer $TOKEN")

TABLE_ID=$(echo $TABLES | jq -r '.[0]._id')

# 5. Create order
curl -X POST http://localhost:3000/v1/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"tableId\": \"$TABLE_ID\",
    \"items\": [{
      \"menuItemId\": \"$MENU_ITEM_ID\",
      \"name\": \"Burger\",
      \"quantity\": 2,
      \"unitPrice\": 10.99,
      \"modifiers\": []
    }]
  }"

echo "✅ Complete flow executed successfully!"
```

---

## Postman Collection

Import this into Postman for easy testing:

1. Create new collection "TabletTap API"
2. Add environment variable `baseUrl` = `http://localhost:3000/v1`
3. Add environment variable `token` (will be set after login)
4. Import the requests above

---

## Testing Tips

1. **Save your access token** after login/register
2. **Use Postman or Insomnia** for easier testing
3. **Check server logs** for real-time debugging
4. **Use WebSocket clients** to test real-time features
5. **Order numbers auto-increment** per restaurant

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["email must be an email"],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```
