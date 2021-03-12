package com.match.server.repositories;

import java.util.List;
import com.match.server.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, String> {
    List<User> findAllByTeam_Id(Integer id);
}

