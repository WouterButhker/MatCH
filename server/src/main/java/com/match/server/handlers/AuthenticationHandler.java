package com.match.server.handlers;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.SignatureException;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

public class AuthenticationHandler {

    private transient Jws<Claims> parsedToken;

    /**
     * Set parsedToken by using authorization header and the secret key.
     *

     * @param headerValue String from authorization header
     * @param jwtSecret the secret key
     * @throws IOException when token expired or invalid signature or unable to parse
     */
    public void setParsedToken(String headerValue, String jwtSecret) throws IOException {
        try {
            this.parsedToken = Jwts.parserBuilder()
                    .setSigningKey(jwtSecret.getBytes())
                    .build()
                    .parseClaimsJws(headerValue.replace("Bearer ", ""));
        } catch (ExpiredJwtException e) {
            throw new IOException("Token has expired - please request a new token");
        } catch (SignatureException | SecurityException e) {
            throw new IOException("Token has invalid signature - "
                    + "please don't tamper with the tokens");
        } catch (JwtException e) {
            throw new IOException("Unable to parse token or token has expired");
        }
    }

    /**
     * This method parses the token to get the netId of the user.

     * @return String represent netId of user
     */
    public String getIdFromToken() {
        return this.parsedToken
                .getBody()
                .getSubject();
    }

    /**
     * This method parses the token to get the list of authorities.
     *

     * @return list of authorities
     */
    public List<SimpleGrantedAuthority> getAuthorities() {
        return ((List<?>) this.parsedToken.getBody()
                .get("rol")).stream()
                .map(authority -> new SimpleGrantedAuthority("ROLE_" + authority))
                .collect(Collectors.toList());
    }

    public Jws<Claims> getParsedToken() {
        return parsedToken;
    }
}

