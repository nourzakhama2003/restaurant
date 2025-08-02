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

    public User saveUser(User user) {
        return this.userRepository.save(user);
    }


    public List<User> getAllUsers() {
        return this.userRepository.findAll();
    }


    public Optional<User> getUserById(String id) {
        return this.userRepository.findById(id);
    }


    public Optional<User> getUserByEmail(String email) {
        return this.userRepository.findByEmail(email);
    }

    public Optional<User> getUserByPhone(String phone) {
        return this.userRepository.findByPhone(phone);
    }

 
    public User updateUser(String id, User user) {
        if (this.userRepository.existsById(id)) {
            user.setId(id);
            return this.userRepository.save(user);
        }
        return null;
    }

    public boolean deleteUser(String id) {
        if (this.userRepository.existsById(id)) {
            this.userRepository.deleteById(id);
            return true;
        }
        return false;
    }

    
    public boolean existsById(String id) {
        return this.userRepository.existsById(id);
    }

   
    public boolean existsByEmail(String email) {
        return this.userRepository.existsByEmail(email);
    }

  
    public boolean existsByPhone(String phone) {
        return this.userRepository.existsByPhone(phone);
    }

    public boolean isEmailAvailableForUpdate(String email, String userId) {
        Optional<User> existingUser = this.userRepository.findByEmail(email);
        return existingUser.isEmpty() || existingUser.get().getId().equals(userId);
    }

    public boolean isPhoneAvailableForUpdate(String phone, String userId) {
        Optional<User> existingUser = this.userRepository.findByPhone(phone);
        return existingUser.isEmpty() || existingUser.get().getId().equals(userId);
    }
}
