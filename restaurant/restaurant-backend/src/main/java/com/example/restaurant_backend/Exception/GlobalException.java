package com.example.restaurant_backend.Exception;

public class GlobalException extends RuntimeException{
    private String message ;
    public GlobalException(String message){
       super(message);

    }
}
