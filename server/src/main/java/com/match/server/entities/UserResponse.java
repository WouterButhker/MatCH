package com.match.server.entities;

import static com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(NON_NULL)
public class UserResponse {
    private String username;

    private transient Boolean isAdmin = null;

    /**
     * UserResponse constructor.
     *
     * @param user the current user
     * @param isAdminOrUser if a user is an admin or not
     */
    public UserResponse(User user, boolean isAdminOrUser) {
        this.username = user.getUsername();

        // Only an admin or the user themselves are allowed to see their role
        if (isAdminOrUser) {
            this.isAdmin = user.isAdmin();
        }
    }

    public String getUsername() {
        return username;
    }

    public void setNetId(String username) {
        this.username = username;
    }

    public Boolean getAdmin() {
        return isAdmin;
    }

    public void setAdmin(Boolean admin) {
        isAdmin = admin;
    }
}

