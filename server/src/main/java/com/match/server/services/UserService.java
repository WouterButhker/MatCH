package com.match.server.services;

import java.util.Date;
import com.match.server.entities.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private static final String TOKEN_TYPE = "JWT";
    private static final String TOKEN_ISSUER = "match-server";
    private static final String TOKEN_AUDIENCE = "match-app";

    private static final long TOKEN_VALIDITY = 86400000; // 1 day

    @Value("${jwt.secret}")
    private transient String jwtSecret;

    /**
     * Generates a JWT.
     *
     * @param user the user for which the JWT is created
     * @return JWT header string
     */
    public String generateToken(User user) {
        // A token consists of the type (JWT), encryption (HS512), expiration,
        // subject (Id), user rating, and claims/roles
        return Jwts.builder()
                .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes()), SignatureAlgorithm.HS512)
                .setHeaderParam("typ", TOKEN_TYPE)
                .setSubject(user.getUsername())
                .setIssuer(TOKEN_ISSUER)
                .setAudience(TOKEN_AUDIENCE)
                .setExpiration(new Date(System.currentTimeMillis() + TOKEN_VALIDITY))
                .claim("rol", user.isAdmin() ? new String[] { "USER", "ADMIN" } : new String[] { "USER" })
                .compact();
    }

}
