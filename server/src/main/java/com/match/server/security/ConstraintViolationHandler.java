package com.match.server.security;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

import org.hibernate.exception.ConstraintViolationException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Intercept any validation constraint violations (e.g. @Size, @NotBlank, etc.) and process
 * them as a regular request with a JSON response body containing the violation reason
 */
@ControllerAdvice
public class ConstraintViolationHandler {
    /**
     * Method to translate a runtime exception due to incorrect request parameters
     * into a 400 response.
     *
     * @param e The constraint exception
     * @return 400 Response
     */
    @ExceptionHandler(ConstraintViolationException.class)
    @ResponseBody
    @ResponseStatus(BAD_REQUEST)
    public Response handleCustomException(ConstraintViolationException e) {
        Response response = new Response();

        response.setMessage(e.getMessage());
        response.setStatusCode(BAD_REQUEST.value());

        return response;
    }

    public static class Response {
        private String message;
        private int statusCode;

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public int getStatusCode() {
            return statusCode;
        }

        public void setStatusCode(int statusCode) {
            this.statusCode = statusCode;
        }
    }
}

