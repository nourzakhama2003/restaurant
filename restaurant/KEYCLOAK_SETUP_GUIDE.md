# Keycloak + Angular Restaurant Management Setup Guide

## 🚀 Quick Start (Automated)

### Option 1: Using Docker Compose (Recommended)
```bash
# 1. Start Keycloak with pre-configured realm
docker-compose up -d

# 2. Start Angular application
cd restaurant-frontend
npm install
npm start
```

### Option 2: Manual Docker + Import
```bash
# 1. Start Keycloak
docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:25.0.5 start-dev

# 2. Import realm configuration
# Go to http://localhost:8080/admin
# Login with admin/admin
# Click "Add Realm" → "Select file" → Import "myrealm-config.json"

# 3. Start Angular
cd restaurant-frontend
npm start
```

## 🔧 Manual Configuration (If Needed)

### 1. Start Keycloak
```bash
docker run -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:25.0.5 start-dev
```

### 2. Access Keycloak Admin Console
- URL: http://localhost:8080/admin
- Username: admin
- Password: admin

### 3. Create Realm
1. Click "Add Realm" (top-left dropdown)
2. Name: `myrealm`
3. Click "Create"

### 4. Create Client
1. In myrealm → Clients → "Create"
2. Client ID: `myclient`
3. Client Protocol: `openid-connect`
4. Root URL: `http://localhost:4200`
5. Click "Save"

### 5. Configure Client Settings
1. Access Type: `confidential`
2. Standard Flow Enabled: `ON`
3. Valid Redirect URIs:
   - `http://localhost:4200/*`
   - `http://localhost:4200/login`
   - `http://localhost:4200/dashboard`
4. Web Origins: `http://localhost:4200`
5. Valid Post Logout Redirect URIs: `http://localhost:4200/login`
6. Click "Save"

### 6. Get Client Secret
1. Go to "Credentials" tab
2. Copy the "Secret" value
3. Update your Angular environment if needed

### 7. Create Test Users
1. Users → "Add User"
2. Username: `testuser`
3. Email: `test@restaurant.com`
4. First Name: `Test`
5. Last Name: `User`
6. Email Verified: `ON`
7. Enabled: `ON`
8. Click "Save"

### 8. Set User Password
1. Go to "Credentials" tab
2. Password: `password123`
3. Temporary: `OFF`
4. Click "Set Password"

### 9. Create Admin User (Optional)
1. Users → "Add User"
2. Username: `adminuser`
3. Email: `admin@restaurant.com`
4. Follow same steps as test user
5. Password: `admin123`

## 📱 Testing Your Setup

### 1. Start Applications
```bash
# Terminal 1: Keycloak (if not using docker-compose)
docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:25.0.5 start-dev

# Terminal 2: Angular Frontend
cd restaurant-frontend
npm start
```

### 2. Test Authentication Flow
1. Visit: http://localhost:4200
2. Click "Sign In with Keycloak"
3. Login with:
   - Username: `testuser`
   - Password: `password123`
4. Should redirect back to your app

### 3. Test API Calls
- Check browser console for Bearer token logs
- API calls should automatically include authentication

## 🐛 Troubleshooting

### Common Issues:

**❌ "Connection refused to localhost:8080"**
- ✅ Make sure Keycloak Docker container is running
- ✅ Check: `docker ps` to see running containers

**❌ "Invalid redirect URI"**
- ✅ Check client redirect URIs include `http://localhost:4200/*`
- ✅ Make sure you're in `myrealm`, not `master` realm

**❌ "Login credentials don't work"**
- ✅ Use `testuser/password123` (NOT admin/admin)
- ✅ admin/admin is only for Keycloak admin console

**❌ "Infinite redirect loop"**
- ✅ Check Valid Post Logout Redirect URIs
- ✅ Ensure client is set to `confidential`

**❌ "Token not included in API requests"**
- ✅ Check browser console for interceptor logs
- ✅ Verify AuthInterceptor is properly registered

### Debug Commands:
```bash
# Check running containers
docker ps

# Check container logs
docker logs <container-id>

# Check if Keycloak is accessible
curl http://localhost:8080/realms/myrealm/.well-known/openid_configuration
```

## 🔄 Starting Fresh

### Reset Everything:
```bash
# Stop all containers
docker stop $(docker ps -q)

# Remove containers
docker rm $(docker ps -aq)

# Start fresh
docker-compose up -d
# OR
docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:25.0.5 start-dev
```

## 📞 Support

### Useful URLs:
- **Angular App**: http://localhost:4200
- **Keycloak Admin**: http://localhost:8080/admin (admin/admin)
- **Keycloak Realm**: http://localhost:8080/realms/myrealm
- **API Token Endpoint**: http://localhost:8080/realms/myrealm/protocol/openid-connect/token

### Default Credentials:
- **Keycloak Admin**: admin / admin
- **App Test User**: testuser / password123
- **App Admin User**: adminuser / admin123

---
Last Updated: July 9, 2025
