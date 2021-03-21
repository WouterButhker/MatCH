package com.match.server.repositories;

import java.util.List;
import com.match.server.entities.UserLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface UserLocationRepository extends JpaRepository<UserLocation, Integer> {
    List<UserLocation> findAllByTeam_Id(Integer team);

    @Query(
            value = "SELECT t1.* " +
                    "FROM UserLocation t1 LEFT JOIN UserLocation t2 " +
                    "ON (t1.team_id = t2.team_id AND t1.currenttime < t2.currenttime) " +
                    "WHERE t2.currenttime IS NULL;",
            nativeQuery=true)
    List<UserLocation> getLatestPerTeam();
}
