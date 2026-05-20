package pe.gob.saludpol.sgra.gateway.filter;

import java.util.List;
import java.util.function.Predicate;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class RouteValidator {

    public static final List<String> openApiEndpoints = List.of(
            "/api/v1/auth/login",
            "/api/v1/auth/register",
            "/api/v1/auth/token",
            "/api/v1/eureka"
    );

    
    public Predicate<ServerHttpRequest> isSecured = request -> {
        String path = request.getURI().getPath();
        boolean secured = openApiEndpoints.stream().noneMatch(path::contains);
        log.error("[RouteValidator] Path '{}' is secured: {}", path, secured);
        return secured;
    };
}