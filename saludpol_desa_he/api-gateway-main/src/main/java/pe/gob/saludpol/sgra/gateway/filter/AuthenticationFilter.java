package pe.gob.saludpol.sgra.gateway.filter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;
import pe.gob.saludpol.sgra.gateway.util.JwtUtil;

@Slf4j
@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {
	
	@Autowired
    private RouteValidator validator;
	
	@Autowired
    private JwtUtil jwtUtil;
    
    String path;

    public AuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return ((exchange, chain) -> {
            path = exchange.getRequest().getPath().toString();

            if (validator.isSecured.test(exchange.getRequest())) {

                if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                    throw new RuntimeException("missing authorization header");
                }

                String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    authHeader = authHeader.substring(7);
                }

                try {
                    jwtUtil.validateToken(authHeader);
                } catch (Exception e) {
                    ServerHttpResponse response = exchange.getResponse();
                    response.setStatusCode(HttpStatus.UNAUTHORIZED);
                    return response.setComplete();
                }

                ServerHttpRequest modifiedRequest = exchange.getRequest()
                    .mutate()
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + authHeader)
                    .build();

                return chain.filter(exchange.mutate().request(modifiedRequest).build());
            }

            return chain.filter(exchange);
        });
    }

    public static class Config {}
}