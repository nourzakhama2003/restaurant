package com.example.restaurant_backend.repository;

import com.example.restaurant_backend.entity.Commande;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommandeRepository extends MongoRepository<Commande, String> {
    List<Commande> findByRestaurantId(String restaurantId);
    List<Commande> findByStatus(String status);
    List<Commande> findByCreatorId(String creatorId);
    List<Commande> findByRestaurantIdAndStatus(String restaurantId, String status);
    void deleteByRestaurantId(String restaurantId);
    void deleteByCreatorId(String creatorId);
    
    // Methods for group ordering with simplified logic
    List<Commande> findByDeletedFalse();
    List<Commande> findByRestaurantIdAndDeletedFalse(String restaurantId);
    List<Commande> findByCreatorIdAndDeletedFalse(String creatorId);
    List<Commande> findByStatusAndDeletedFalse(String status);
    List<Commande> findByRestaurantIdAndStatusAndDeletedFalse(String restaurantId, String status);

    @Query("{ 'status': { $regex: ?0, $options: 'i' } }")
    List<Commande> findByStatusIgnoreCase(String status);
}
