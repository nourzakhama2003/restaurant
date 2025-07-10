# 🚀 Restaurant Management - Quick Reference

## 🏃‍♂️ Quick Start (Windows)
```bash
# Double-click or run:
start-keycloak.bat

# Then start Angular:
cd restaurant-frontend
npm start
```

## 🏃‍♂️ Quick Start (Linux/Mac)
```bash
chmod +x start-keycloak.sh
./start-keycloak.sh

# Then start Angular:
cd restaurant-frontend
npm start
```

## 📱 Access Points
| Service | URL | Credentials |
|---------|-----|-------------|
| **Angular App** | http://localhost:4200 | testuser / password123 |
| **Keycloak Admin** | http://localhost:8080/admin | admin / admin |
| **API Backend** | http://localhost:8081 | Bearer token from app |

## 👥 Pre-configured Users
| Username | Password | Role | Description |
|----------|----------|------|-------------|
| `testuser` | `password123` | user | Standard user for testing |
| `adminuser` | `admin123` | admin, user | Admin user with full access |

## 🔧 Manual Commands

### Start Services
```bash
# Option 1: Docker Compose (Recommended)
docker-compose up -d

# Option 2: Manual Docker
docker run -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:25.0.5 start-dev
```

### Stop Services
```bash
# Stop all
docker-compose down

# Stop and clean
docker-compose down -v
```

### Check Status
```bash
# See running containers
docker ps

# Check logs
docker logs restaurant-keycloak
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find what's using port 8080
netstat -ano | findstr :8080   # Windows
lsof -i :8080                  # Linux/Mac

# Kill the process
taskkill /F /PID <PID>         # Windows
kill -9 <PID>                  # Linux/Mac
```

### Reset Everything
```bash
# Windows
stop-all.bat
start-keycloak.bat

# Linux/Mac
./stop-all.sh
./start-keycloak.sh
```

### Import Realm Manually
1. Go to http://localhost:8080/admin
2. Login with admin/admin
3. Add Realm → Select file → `keycloak-import/myrealm-config.json`
4. Click Create

## 🔑 Authentication Flow
1. User visits http://localhost:4200
2. App redirects to Keycloak login
3. User enters credentials (testuser/password123)
4. Keycloak redirects back with token
5. App uses token for API calls

## 📁 File Structure
```
restaurant/
├── docker-compose.yml                 # Docker services
├── start-keycloak.bat                 # Windows quick start
├── start-keycloak.sh                  # Linux/Mac quick start
├── stop-all.bat                       # Windows stop script
├── stop-all.sh                        # Linux/Mac stop script
├── KEYCLOAK_SETUP_GUIDE.md           # Full documentation
├── keycloak-import/
│   └── myrealm-config.json           # Realm configuration
├── keycloak-data/                     # Persistent data
└── restaurant-frontend/              # Angular app
    ├── src/app/keycloak-init.ts      # Keycloak config
    └── src/environments/             # Environment settings
```

---
💡 **Need help?** Check KEYCLOAK_SETUP_GUIDE.md for detailed instructions!
