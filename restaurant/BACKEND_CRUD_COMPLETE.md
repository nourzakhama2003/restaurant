# Restaurant Backend API Documentation

## Overview
This document provides a comprehensive overview of all available CRUD operations for the Restaurant Management System backend.

## Base URL
All endpoints are available at: `http://localhost:8080/api`

## Authentication
All endpoints require valid JWT authentication from Keycloak.

## Available Entities

### 1. Restaurant Entity
- **Base URL**: `/api/restaurants`
- **Fields**: id, name, description, address, phone, email, menu (array of MenuItem objects)

### 2. MenuItem Entity
- **Base URL**: `/api/menu-items`
- **Fields**: id, name, description, price, category, available, restaurantId

### 3. Commande Entity
- **Base URL**: `/api/commandes`
- **Fields**: id, restaurantId, creatorId, status, createdAt, participants, orders

### 4. Order Entity
- **Base URL**: `/api/orders`
- **Fields**: id, commandeId, participantId, menuItemId, quantity, price

### 5. User Entity
- **Base URL**: `/api/users`
- **Fields**: id, name, email, number, commandes (array), orders (array)

## Complete CRUD Operations

### Restaurant Endpoints
- **GET** `/api/restaurants` - Get all restaurants
- **GET** `/api/restaurants/{id}` - Get restaurant by ID
- **POST** `/api/restaurants` - Create new restaurant
- **PUT** `/api/restaurants/{id}` - Update restaurant
- **DELETE** `/api/restaurants/{id}` - Delete restaurant

### MenuItem Endpoints
- **GET** `/api/menu-items` - Get all menu items
- **GET** `/api/menu-items/{id}` - Get menu item by ID
- **GET** `/api/menu-items/restaurant/{restaurantId}` - Get menu items by restaurant
- **POST** `/api/menu-items` - Create new menu item
- **PUT** `/api/menu-items/{id}` - Update menu item
- **DELETE** `/api/menu-items/{id}` - Delete menu item

### Commande Endpoints
- **GET** `/api/commandes` - Get all commandes
- **GET** `/api/commandes/{id}` - Get commande by ID
- **GET** `/api/commandes/restaurant/{restaurantId}` - Get commandes by restaurant
- **GET** `/api/commandes/status/{status}` - Get commandes by status
- **GET** `/api/commandes/creator/{creatorId}` - Get commandes by creator
- **POST** `/api/commandes` - Create new commande
- **PUT** `/api/commandes/{id}` - Update commande
- **DELETE** `/api/commandes/{id}` - Delete commande
- **GET** `/api/commandes/{id}/exists` - Check if commande exists

### Order Endpoints
- **GET** `/api/orders` - Get all orders
- **GET** `/api/orders/{id}` - Get order by ID
- **GET** `/api/orders/commande/{commandeId}` - Get orders by commande
- **GET** `/api/orders/participant/{participantId}` - Get orders by participant
- **GET** `/api/orders/menuitem/{menuItemId}` - Get orders by menu item
- **GET** `/api/orders/commande/{commandeId}/participant/{participantId}` - Get orders by commande and participant
- **POST** `/api/orders` - Create new order
- **PUT** `/api/orders/{id}` - Update order
- **DELETE** `/api/orders/{id}` - Delete order
- **DELETE** `/api/orders/commande/{commandeId}` - Delete all orders for a commande
- **DELETE** `/api/orders/participant/{participantId}` - Delete all orders for a participant
- **GET** `/api/orders/{id}/exists` - Check if order exists
- **GET** `/api/orders/commande/{commandeId}/total` - Get total price for commande
- **GET** `/api/orders/participant/{participantId}/total` - Get total price for participant

### User Endpoints
- **GET** `/api/users` - Get all users
- **GET** `/api/users/{id}` - Get user by ID
- **GET** `/api/users/email/{email}` - Get user by email
- **GET** `/api/users/number/{number}` - Get user by phone number
- **POST** `/api/users` - Create new user
- **PUT** `/api/users/{id}` - Update user
- **DELETE** `/api/users/{id}` - Delete user
- **GET** `/api/users/{id}/exists` - Check if user exists
- **GET** `/api/users/email/{email}/exists` - Check if email exists
- **GET** `/api/users/number/{number}/exists` - Check if phone number exists

## Repository Pattern
All entities follow the repository pattern with the following implementations:

### Repositories
- `RestaurantRepository` - MongoDB repository for restaurants
- `MenuItemRepository` - MongoDB repository for menu items
- `CommandeRepository` - MongoDB repository for commandes
- `OrderRepository` - MongoDB repository for orders
- `UserRepository` - MongoDB repository for users

### Services
- `RestaurantService` - Business logic for restaurant operations
- `MenuItemService` - Business logic for menu item operations
- `CommandeService` - Business logic for commande operations
- `OrderService` - Business logic for order operations
- `UserService` - Business logic for user operations

### Controllers
- `RestaurantController` - REST endpoints for restaurant operations
- `MenuItemController` - REST endpoints for menu item operations
- `CommandeController` - REST endpoints for commande operations
- `OrderController` - REST endpoints for order operations
- `UserController` - REST endpoints for user operations

## Features
- Full CRUD operations for all entities
- Proper error handling with GlobalException
- Cross-origin support for frontend integration
- Repository pattern implementation
- Service layer for business logic
- RESTful API design
- MongoDB integration
- JWT authentication support
- Validation and existence checks
- Relationship management between entities
- Bulk operations support
- Price calculation utilities

## Status
✅ All backend CRUD operations are now complete and functional!
✅ Successfully compiled and ready for use
✅ All entities have complete repository-service-controller implementation
✅ Proper error handling and validation implemented
✅ Cross-origin support configured for frontend integration
