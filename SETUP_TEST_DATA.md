# Quick Setup Script for TabletTap Backend

## Create Sample Tables and Menu Items

Use this in Postman or run via curl:

### 1. Login First
```bash
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@tabletap.com",
    "password": "password123"
  }' > login_response.json

# Extract token (you'll need jq installed)
TOKEN=$(cat login_response.json | jq -r '.accessToken')
```

### 2. Create Tables
```bash
curl -X POST http://localhost:3000/v1/tables/batch \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tables": [
      { "name": "A1", "capacity": 4, "displayName": "Table A1" },
      { "name": "A2", "capacity": 4, "displayName": "Table A2" },
      { "name": "B1", "capacity": 2, "displayName": "Table B1" },
      { "name": "B2", "capacity": 2, "displayName": "Table B2" },
      { "name": "C1", "capacity": 6, "displayName": "Table C1" },
      { "name": "VIP", "capacity": 8, "displayName": "VIP Table" }
    ]
  }'
```

### 3. Create Menu Items
```bash
# Burgers
curl -X POST http://localhost:3000/v1/menu \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Classic Burger",
    "price": 12.99,
    "category": "food",
    "isAvailable": true,
    "isPopular": true
  }'

curl -X POST http://localhost:3000/v1/menu \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cheese Burger",
    "price": 14.99,
    "category": "food",
    "isAvailable": true,
    "isPopular": false
  }'

# Drinks
curl -X POST http://localhost:3000/v1/menu \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Coke",
    "price": 2.99,
    "category": "drink",
    "isAvailable": true,
    "isPopular": true
  }'

curl -X POST http://localhost:3000/v1/menu \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Orange Juice",
    "price": 3.99,
    "category": "drink",
    "isAvailable": true,
    "isPopular": false
  }'

# Desserts
curl -X POST http://localhost:3000/v1/menu \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chocolate Cake",
    "price": 6.99,
    "category": "dessert",
    "isAvailable": true,
    "isPopular": true
  }'
```

### Or use this one-liner (requires jq):
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/v1/auth/login -H "Content-Type: application/json" -d '{"email":"owner@tabletap.com","password":"password123"}' | jq -r '.accessToken') && \
curl -X POST http://localhost:3000/v1/tables/batch -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"tables":[{"name":"A1","capacity":4},{"name":"A2","capacity":4},{"name":"B1","capacity":2},{"name":"B2","capacity":2},{"name":"C1","capacity":6},{"name":"VIP","capacity":8}]}' && \
echo "✅ Tables created!"
```

After running this, refresh the mobile app and you'll see the tables!
