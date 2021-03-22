package com.match.server.controllers;

import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

import java.util.Optional;
import javax.servlet.http.HttpServletResponse;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import com.match.server.entities.User;
import com.match.server.entities.UserResponse;
import com.match.server.services.UserService;
import com.match.server.services.UserServiceImplementation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@Validated
@RestController
@RequestMapping("/authentication")
public class AuthenticationController {
    @Autowired
    private transient UserServiceImplementation userServiceImpl;

    @Autowired
    private transient UserService userService;

    private transient PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private final transient String username = "username";

    /**
     * Retrieve either the current (authenticated) user's details or
     * another user's details by id.
     *
     * @param user user which authenticated via a valid token when calling this endpoint
     * @param username optional netId of another (or the current) user
     * @return UserResponse response object
     */
    @GetMapping
    public UserResponse get(@AuthenticationPrincipal User user,
                            @RequestParam("username") Optional<String> username) {
        if (username.isEmpty()) {
            return new UserResponse(user, true);
        }   else {
            User IdUser = getUserByUsername(username.get(), NOT_FOUND, "User was not found");

            return new UserResponse(IdUser, user.isAdmin() || user.getUsername() == username.get());
        }
    }

    @GetMapping("/isAdmin")
    @Secured("ROLE_ADMIN")
    public Boolean get(@AuthenticationPrincipal User user) {
        return user.isAdmin();
    }

    /**
     * Register and then return a new user.
     *
     * @param username as-of-yet unregistered Id
     * @param password with a minimum of 8 characters
     * @param response HTTP response object to set the Bearer token on
     * @return UserResponse response object
     * */
    @PostMapping("register")
    public UserResponse register(
            @RequestParam("username") @NotBlank String username,
            @RequestParam("password") @Size(min = 8,
                    message = "Password must be at least 8 characters long") String password,
            HttpServletResponse response) {
        checkExistUser(username);
        User user = saveUser(username, password, false);
        addTokenToResponseHeader(response, user);
        return new UserResponse(user, true);
    }

    private static final String UNAUTHORIZED_RESPONSE =
            "Unable to authenticate with this Id and password";

    /**
     * Authenticate and then return an existing user.
     * If authentication is successful a Bearer token will be returned which
     * can be used for subsequent requests.
     *
     * @param username user's username
     * @param password user's password
     * @param response HTTP response object to set the Bearer token on
     * @return UserResponse response object
     */
    @PostMapping("authenticate")
    public UserResponse authenticate(
            @RequestParam("username") @NotBlank String username,
            @RequestParam("password") @Size(min = 8,
                    message = "Password must be at least 8 characters.") String password,
            HttpServletResponse response
    ) {
        User user = getUserByUsername(username, UNAUTHORIZED, UNAUTHORIZED_RESPONSE);

        isValidPassword(password, user.getHashPassword());

        addTokenToResponseHeader(response, user);

        return new UserResponse(user, true);
    }

    private void isValidPassword(String password, String hashPassword) {
        if (!passwordEncoder.matches(password, hashPassword)) {
            throw new ResponseStatusException(UNAUTHORIZED, UNAUTHORIZED_RESPONSE);
        }
    }

    private User getUserByUsername(String username, HttpStatus status, String message) {
        return userServiceImpl.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(status, message));

    }

    private User saveUser(String username, String password, boolean isAdmin) {
        return userServiceImpl.save(new User(username, passwordEncoder.encode(password), null));
    }

    private void addTokenToResponseHeader(HttpServletResponse response, User user) {
        response.addHeader("Authorization", "Bearer " + userService.generateToken(user));
    }

    private void checkExistUser(String username) {
        if (userServiceImpl.existsByUsername(username)) {
            throw new ResponseStatusException(CONFLICT, "User with this Id already exists");
        }
    }

}
