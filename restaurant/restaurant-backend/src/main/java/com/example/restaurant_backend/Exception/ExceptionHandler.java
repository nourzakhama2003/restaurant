package com.example.restaurant_backend.Exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;

@ControllerAdvice
public class ExceptionHandler {
@org.springframework.web.bind.annotation.ExceptionHandler(GlobalException.class)
    public ResponseEntity<String> handleException(Exception e){
        return ResponseEntity.status(400).body(e.getMessage());
    }
}
