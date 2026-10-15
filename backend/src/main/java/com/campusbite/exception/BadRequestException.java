package com.campusbite.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * BadRequestException
 * 
 * Thrown when business logic validation fails (e.g., duplicate category name, invalid price).
 * Maps to HTTP 400 BAD REQUEST.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
