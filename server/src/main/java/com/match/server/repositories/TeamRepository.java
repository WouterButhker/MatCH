package com.match.server.repositories;

import java.util.List;
import com.match.server.entities.Team;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamRepository extends JpaRepository<Team, Integer> {
    List<Team> findAllByTeamName(String teamname);
}
