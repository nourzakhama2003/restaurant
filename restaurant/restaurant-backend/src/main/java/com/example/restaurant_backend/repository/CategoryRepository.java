package com.example.restaurant_backend.repository;

import com.example.restaurant_backend.entity.Category;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends MongoRepository<Category, String> {
    // Additional query methods if needed
} 