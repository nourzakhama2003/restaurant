package com.example.restaurant_backend.service;

import com.example.restaurant_backend.entity.User;
import com.example.restaurant_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Create
    public User saveUser(User user) {
        return this.userRepository.save(user);
    }

    // Read all
    public List<User> getAllUsers() {
        return this.userRepository.findAll();
    }

    // Read by ID
    public Optional<User> getUserById(String id) {
        return this.userRepository.findById(id);
    }

    // Read by Email
    public Optional<User> getUserByEmail(String email) {
        return this.userRepository.findByEmail(email);
    }

    // Read by Phone Number
    public Optional<User> getUserByPhone(String phone) {
        return this.userRepository.findByPhone(phone);
    }

    // Update
    public User updateUser(String id, User user) {
        if (this.userRepository.existsById(id)) {
            user.setId(id);
            return this.userRepository.save(user);
        }
        return null;
    }

    // Delete
    public boolean deleteUser(String id) {
        if (this.userRepository.existsById(id)) {
            this.userRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Check if exists
    public boolean existsById(String id) {
        return this.userRepository.existsById(id);
    }

    // Check if email exists
    public boolean existsByEmail(String email) {
        return this.userRepository.existsByEmail(email);
    }

    // Check if phone exists
    public boolean existsByPhone(String phone) {
        return this.userRepository.existsByPhone(phone);
    }

    // Validate unique email for update
    public boolean isEmailAvailableForUpdate(String email, String userId) {
        Optional<User> existingUser = this.userRepository.findByEmail(email);
        return existingUser.isEmpty() || existingUser.get().getId().equals(userId);
    }

    // Validate unique phone for update
    public boolean isPhoneAvailableForUpdate(String phone, String userId) {
        Optional<User> existingUser = this.userRepository.findByPhone(phone);
        return existingUser.isEmpty() || existingUser.get().getId().equals(userId);
    }
}
