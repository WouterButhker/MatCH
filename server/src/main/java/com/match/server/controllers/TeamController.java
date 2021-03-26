package com.match.server.controllers;

import java.util.List;
import java.util.Optional;
import com.match.server.entities.Team;
import com.match.server.entities.User;
import com.match.server.repositories.TeamRepository;
import com.match.server.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/teams")
public class TeamController {

    @Autowired
    transient TeamRepository teamRepository;

    @Autowired
    transient UserRepository userRepository;

    @GetMapping("/get")
    public List<Team> getTeams() {
        return teamRepository.findAll();
    }

    @PostMapping("/create")
    public void createTeam(@AuthenticationPrincipal User user,
                           @RequestParam("teamname") Optional<String> teamName) {
        if(userRepository.findById(user.getUsername()).get().getTeam() != null || user.isAdmin()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is already in a team");
        }
        if(teamName.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No name was specified");
        }
        if(!teamRepository.findAllByTeamName(teamName.get()).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Team by this name already exists");
        }
        teamRepository.save(new Team(teamName.get()));
        if(!user.isAdmin()) {
            joinTeam(user, Optional.of(teamRepository.findAllByTeamName(teamName.get()).get(0).getId()));
        }
        throw new ResponseStatusException(HttpStatus.OK, "Team has been created");
    }

    @PostMapping("/join")
    public void joinTeam(@AuthenticationPrincipal User user,
                           @RequestParam("team") Optional<Integer> teamId) {
        if(user.getTeam() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is already in a team");
        }
        if(teamId.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No id was specified");
        }
        Optional<Team> team = teamRepository.findById(teamId.get());
        if(team.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No team exists with id" + teamId.get());
        }
        Team newTeam = team.get();
        User newUser = userRepository.findById(user.getUsername()).get();
        newUser.setTeam(newTeam);
        userRepository.save(newUser);
        throw new ResponseStatusException(HttpStatus.OK, "User has been added to team");
    }

    @GetMapping("/getusers")
    public List<User> getAllByTeam(@RequestParam("teamname") Optional<Integer> teamId) {
        if(teamId.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No id was specified");
        }
        return userRepository.findAllByTeam_Id(teamId.get());
    }
}
