package com.match.server.services;

import java.util.Optional;
import com.match.server.entities.User;

public interface UserServiceInterface {
    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    User save(User user);
}

