package com.example.restaurant_backend.repository;

import com.example.restaurant_backend.entity.MenuItem;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MenuItemRepository extends MongoRepository<MenuItem, String> {
    List<MenuItem> findByRestaurantIdAndDeletedFalse(String restaurantId);}
