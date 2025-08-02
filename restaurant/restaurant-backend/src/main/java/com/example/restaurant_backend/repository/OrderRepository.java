package com.example.restaurant_backend.repository;

import com.example.restaurant_backend.entity.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findByCommandeId(String commandeId);
    List<Order> findByParticipantId(String participantId);
    List<Order> findByCommandeIdAndParticipantId(String commandeId, String participantId);
    void deleteByCommandeId(String commandeId);
    void deleteByParticipantId(String participantId);
    
 
    List<Order> findByDeletedFalse();
    List<Order> findByCommandeIdAndDeletedFalse(String commandeId);
    List<Order> findByParticipantIdAndDeletedFalse(String participantId);
    Optional<Order> findByCommandeIdAndParticipantIdAndDeletedFalse(String commandeId, String participantId);
}
