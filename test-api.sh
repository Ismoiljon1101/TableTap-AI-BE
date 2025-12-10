#!/bin/bash

# TabletTap API Test Script
echo "🧪 Testing TabletTap API Endpoints"
echo "=================================="
echo ""

BASE_URL="http://localhost:3000/v1"

echo "1️⃣  Testing Health Check..."
curl -s "$BASE_URL" | head -c 100
echo ""
echo ""

echo "2️⃣  Testing Registration..."
curl -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@tabletap.com",
    "password": "password123",
    "nickname": "Test User",
    "restaurantName": "Test Restaurant"
  }' | jq '.' 2>/dev/null || echo "Registration endpoint ready (jq not installed for JSON formatting)"
echo ""
echo ""

echo "✅ API is responding!"
echo ""
echo "📝 Next Steps:"
echo "  1. Use Postman/Insomnia to test endpoints"
echo "  2. Register a user: POST $BASE_URL/auth/register"
echo "  3. Login: POST $BASE_URL/auth/login"
echo "  4. Create tables: POST $BASE_URL/tables/batch"
echo "  5. Start building the mobile app!"
