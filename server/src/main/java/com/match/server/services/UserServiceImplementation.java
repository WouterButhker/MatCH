package com.match.server.services;

import java.util.Optional;
import com.match.server.entities.User;
import com.match.server.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImplementation implements UserServiceInterface {
    @Autowired
    transient UserRepository userRepository;

    @Override
    public boolean existsByUsername(String username) {
        return userRepository.existsById(username);
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return userRepository.findById(username);
    }

    @Override
    public User save(User user) {
        return userRepository.save(user);
    }
}

