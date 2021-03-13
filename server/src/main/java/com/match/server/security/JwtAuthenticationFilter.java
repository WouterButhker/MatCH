package com.match.server.security;

import java.io.IOException;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.match.server.entities.User;
import com.match.server.handlers.AuthenticationHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.util.StringUtils;


public class JwtAuthenticationFilter extends BasicAuthenticationFilter {
    @Value("${jwt.secret}")
    private transient String jwtSecret;

    public JwtAuthenticationFilter(AuthenticationManager authenticationManager) {
        super(authenticationManager);
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response,
            FilterChain filterChain) throws IOException, ServletException {
        var authentication = getAuthentication(request);

        if (authentication == null) {
            filterChain.doFilter(request, response);
            return;
        }
        SecurityContextHolder.getContext().setAuthentication(authentication);
        filterChain.doFilter(request, response);
    }

    @SuppressWarnings("PMD")
    private UsernamePasswordAuthenticationToken getAuthentication(HttpServletRequest request)
            throws IOException {
        var headerValue = request.getHeader("Authorization");

        if (!StringUtils.isEmpty(headerValue) && headerValue.startsWith("Bearer ")) {
            AuthenticationHandler handler = new AuthenticationHandler();
            handler.setParsedToken(headerValue, jwtSecret);
            var parsedToken = handler.getParsedToken();
            var authorities = handler.getAuthorities();
            var user = new User();
            user.setUsername(handler.getIdFromToken());
            user.setAdmin(authorities.contains(new SimpleGrantedAuthority("ROLE_ADMIN")));
            return new UsernamePasswordAuthenticationToken(user, null, authorities);
        }

        return null;
    }

}

