package com.match.server.repositories;

import java.util.List;
import com.match.server.entities.UserTime;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserTimeRepository extends JpaRepository<UserTime, Integer> {
    List<UserTime> findAllByTeam_id(Integer id);
    List<UserTime> findAllByTeam_idAndType(Integer id, UserTime.Type type);

}
