package com.example.restaurant_backend.repository;


import com.example.restaurant_backend.entity.Restaurant;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface RestaurantRepository extends MongoRepository<Restaurant, String> {
    List<Restaurant> findByDeletedFalse();
    void deleteBydescription(String description);
}

