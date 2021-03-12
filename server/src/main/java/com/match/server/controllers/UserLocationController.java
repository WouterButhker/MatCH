package com.match.server.controllers;

import java.sql.Timestamp;
import java.util.List;
import com.match.server.entities.User;
import com.match.server.entities.UserLocation;
import com.match.server.repositories.UserLocationRepository;
import com.match.server.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/userlocation")
public class UserLocationController {

    @Autowired
    transient UserLocationRepository userLocationRepository;

    @Autowired
    transient UserRepository userRepository;

    @PreAuthorize("ROLE_ADMIN")
    @GetMapping("/getbyteam")
    public List<UserLocation> getAllByTeam(Integer teamId) {
        return userLocationRepository.findAllByTeam_Id(teamId);
    }

    @PreAuthorize("ROLE_ADMIN")
    @GetMapping("/getlatest")
    public List<UserLocation> getAllLatest() {
        return userLocationRepository.getLatestPerTeam();
    }

    @PreAuthorize("ROLE_ADMIN")
    @GetMapping("/getall")
    public List<UserLocation> getAll() {
        return userLocationRepository.findAll();
    }

    @PostMapping("/add")
    public void addUserLocation(@AuthenticationPrincipal User user,
                                @RequestParam("lat") float latitude,
                                @RequestParam("long") float longitute,
                                @RequestParam("speed") float speed,
                                @RequestParam("dir") float dir ) {
        User newUser = userRepository.findById(user.getUsername()).get();
        UserLocation userLocation = new UserLocation(newUser.getTeam(), new Timestamp(System.currentTimeMillis()), latitude, longitute, speed, dir);
        userLocationRepository.save(userLocation);
        throw new ResponseStatusException(HttpStatus.OK, "location has been saved");
    }



}
