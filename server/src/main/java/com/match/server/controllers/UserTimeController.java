package com.match.server.controllers;

import java.sql.Timestamp;
import java.util.List;
import com.match.server.entities.Team;
import com.match.server.entities.User;
import com.match.server.entities.UserTime;
import com.match.server.repositories.UserRepository;
import com.match.server.repositories.UserTimeRepository;
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
@RequestMapping("/time")
public class UserTimeController {

    @Autowired
    transient UserTimeRepository userTimeRepository;

    @Autowired
    transient UserRepository userRepository;

    @GetMapping("/getteam")
    public List<UserTime> getTimesPerTeam(@RequestParam("team") Integer teamId) {
        return userTimeRepository.findAllByTeam_id(teamId);
    }

    @GetMapping("/getfinaltime")
    public long getFinalTime(@RequestParam("team") Integer teamId) {
        List<UserTime> times = userTimeRepository.findAllByTeam_id(teamId);
        Timestamp start = null;
        Timestamp finish = null;
        Timestamp pause = null;
        Timestamp resume = null;
        for(UserTime userTime: times) {
            switch(userTime.getType()) {
                case START:
                    start = userTime.getTimestamp();
                    break;
                case FINISH:
                    finish = userTime.getTimestamp();
                    break;
                case PAUSE:
                    pause = userTime.getTimestamp();
                    break;
                case RESUME:
                    resume = userTime.getTimestamp();
                    break;
            }
        }
        if(finish == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User hasn't finished yet");
        }
        if(start == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User hasn't started yet");
        }
        if(pause == null || resume == null) {
            return finish.getTime()-start.getTime();
        }
        return finish.getTime()-start.getTime()-(resume.getTime()-pause.getTime());
    }

    @PostMapping("/start")
    public void start(@AuthenticationPrincipal User user) {
        User newUser = userRepository.findById(user.getUsername()).get();
        Team team = newUser.getTeam();
        if(userTimeRepository.findAllByTeam_id(team.getId()).size() > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Team already started");
        }
        UserTime userTime = new UserTime(team,new Timestamp(System.currentTimeMillis()), UserTime.Type.START);
        userTimeRepository.save(userTime);
        throw new ResponseStatusException(HttpStatus.OK, "Team has started");
    }

    @PostMapping("/finish")
    public void finish(@AuthenticationPrincipal User user) {
        User newUser = userRepository.findById(user.getUsername()).get();
        Team team = newUser.getTeam();
        if(userTimeRepository.findAllByTeam_idAndType(team.getId(), UserTime.Type.FINISH).size() > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Team already finished");
        }
        if(userTimeRepository.findAllByTeam_idAndType(team.getId(), UserTime.Type.START).size() < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Team has not started yet");
        }
        UserTime userTime = new UserTime(team,new Timestamp(System.currentTimeMillis()), UserTime.Type.FINISH);
        userTimeRepository.save(userTime);
        throw new ResponseStatusException(HttpStatus.OK, "Team has finished");
    }

    @PostMapping("/pause")
    public void pause(@AuthenticationPrincipal User user) {
        User newUser = userRepository.findById(user.getUsername()).get();
        Team team = newUser.getTeam();
        if(userTimeRepository.findAllByTeam_idAndType(team.getId(), UserTime.Type.PAUSE).size() > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Team has already paused once");
        }
        if(userTimeRepository.findAllByTeam_idAndType(team.getId(), UserTime.Type.START).size() < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Team has not started yet");
        }
        if(userTimeRepository.findAllByTeam_idAndType(team.getId(), UserTime.Type.FINISH).size() > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Team has already finished");
        }
        UserTime userTime = new UserTime(team,new Timestamp(System.currentTimeMillis()), UserTime.Type.PAUSE);
        userTimeRepository.save(userTime);
        throw new ResponseStatusException(HttpStatus.OK, "Team has paused");
    }

    @PostMapping("/resume")
    public void resume(@AuthenticationPrincipal User user) {
        User newUser = userRepository.findById(user.getUsername()).get();
        Team team = newUser.getTeam();
        if(userTimeRepository.findAllByTeam_idAndType(team.getId(), UserTime.Type.RESUME).size() > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Team has already resumed");
        }
        if(userTimeRepository.findAllByTeam_idAndType(team.getId(), UserTime.Type.PAUSE).size() < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Team has not paused yet");
        }
        UserTime userTime = new UserTime(team,new Timestamp(System.currentTimeMillis()), UserTime.Type.RESUME);
        userTimeRepository.save(userTime);
        throw new ResponseStatusException(HttpStatus.OK, "Team has resumed");
    }
}
