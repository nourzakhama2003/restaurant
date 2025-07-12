package com.example.restaurant_backend.controller;

import com.example.restaurant_backend.Exception.GlobalException;
import com.example.restaurant_backend.entity.Commande;
import com.example.restaurant_backend.service.CommandeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/commandes")
@CrossOrigin(origins = "http://localhost:4200")
public class CommandeController {
    private CommandeService commandeService;

    public CommandeController(CommandeService commandeService) {
        this.commandeService = commandeService;
    }

    // Create
    @PostMapping
    public ResponseEntity<Commande> createCommande(@RequestBody Commande commande) {
        try {
            Commande savedCommande = this.commandeService.saveCommande(commande);
            return ResponseEntity.status(201).body(savedCommande);
        } catch (Exception e) {
            throw new GlobalException("Failed to create commande: " + e.getMessage());
        }
    }

    // Read all
    @GetMapping
    public ResponseEntity<List<Commande>> getAllCommandes() {
        try {
            List<Commande> commandes = this.commandeService.getAllCommandes();
            return ResponseEntity.ok(commandes);
        } catch (Exception e) {
            throw new GlobalException("Failed to retrieve commandes: " + e.getMessage());
        }
    }

    // Read by ID
    @GetMapping("/{id}")
    public ResponseEntity<Commande> getCommandeById(@PathVariable String id) {
        try {
            Optional<Commande> commande = this.commandeService.getCommandeById(id);
            if (commande.isPresent()) {
                return ResponseEntity.ok(commande.get());
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            throw new GlobalException("Failed to retrieve commande: " + e.getMessage());
        }
    }

    // Read by Restaurant ID
    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<Commande>> getCommandesByRestaurantId(@PathVariable String restaurantId) {
        try {
            List<Commande> commandes = this.commandeService.getCommandesByRestaurantId(restaurantId);
            return ResponseEntity.ok(commandes);
        } catch (Exception e) {
            throw new GlobalException("Failed to retrieve commandes by restaurant: " + e.getMessage());
        }
    }

    // Read by Status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Commande>> getCommandesByStatus(@PathVariable String status) {
        try {
            List<Commande> commandes = this.commandeService.getCommandesByStatus(status);
            return ResponseEntity.ok(commandes);
        } catch (Exception e) {
            throw new GlobalException("Failed to retrieve commandes by status: " + e.getMessage());
        }
    }

    // Read by Creator ID
    @GetMapping("/creator/{creatorId}")
    public ResponseEntity<List<Commande>> getCommandesByCreatorId(@PathVariable String creatorId) {
        try {
            List<Commande> commandes = this.commandeService.getCommandesByCreatorId(creatorId);
            return ResponseEntity.ok(commandes);
        } catch (Exception e) {
            throw new GlobalException("Failed to retrieve commandes by creator: " + e.getMessage());
        }
    }

    // Update
    @PutMapping("/{id}")
    public ResponseEntity<Commande> updateCommande(@PathVariable String id, @RequestBody Commande commande) {
        try {
            Commande updatedCommande = this.commandeService.updateCommande(id, commande);
            if (updatedCommande != null) {
                return ResponseEntity.ok(updatedCommande);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            throw new GlobalException("Failed to update commande: " + e.getMessage());
        }
    }

    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCommande(@PathVariable String id) {
        try {
            boolean deleted = this.commandeService.deleteCommande(id);
            if (deleted) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            throw new GlobalException("Failed to delete commande: " + e.getMessage());
        }
    }

    // Check if exists
    @GetMapping("/{id}/exists")
    public ResponseEntity<Boolean> commandeExists(@PathVariable String id) {
        try {
            boolean exists = this.commandeService.existsById(id);
            return ResponseEntity.ok(exists);
        } catch (Exception e) {
            throw new GlobalException("Failed to check commande existence: " + e.getMessage());
        }
    }
}
