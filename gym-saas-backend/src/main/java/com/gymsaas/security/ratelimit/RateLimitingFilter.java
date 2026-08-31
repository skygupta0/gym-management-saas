package com.gymsaas.security.ratelimit;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gymsaas.common.exception.ErrorCode;
import com.gymsaas.common.exception.GlobalExceptionHandler;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitingFilter extends OncePerRequestFilter {

    private final ObjectMapper objectMapper;
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Value("${app.rate-limit.login-capacity:10}")
    private long loginCapacity;

    @Value("${app.rate-limit.login-refill-tokens:10}")
    private long loginRefillTokens;

    @Value("${app.rate-limit.login-refill-duration-minutes:1}")
    private long loginRefillDurationMinutes;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();

        // Only rate limit public auth endpoints
        if (path.contains("/api/v1/auth/login") || path.contains("/api/v1/auth/forgot-password")) {
            String clientIp = getClientIP(request);
            Bucket bucket = buckets.computeIfAbsent(clientIp, this::createNewBucket);

            if (!bucket.tryConsume(1)) {
                log.warn("Rate limit exceeded for IP: {} on endpoint: {}", clientIp, path);
                sendRateLimitError(response);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private Bucket createNewBucket(String key) {
        Refill refill = Refill.greedy(loginRefillTokens, Duration.ofMinutes(loginRefillDurationMinutes));
        Bandwidth limit = Bandwidth.classic(loginCapacity, refill);
        return Bucket.builder().addLimit(limit).build();
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty() || !xfHeader.contains(",")) {
            if (xfHeader != null && !xfHeader.isBlank()) {
                return xfHeader.trim();
            }
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }

    private void sendRateLimitError(HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        GlobalExceptionHandler.ErrorDetails errorDetails = GlobalExceptionHandler.ErrorDetails.builder()
                .code(ErrorCode.RATE_LIMIT_EXCEEDED.getCode())
                .message(ErrorCode.RATE_LIMIT_EXCEEDED.getDefaultMessage())
                .details(List.of("Too many requests from your IP address. Please wait before retrying."))
                .build();

        GlobalExceptionHandler.ErrorEnvelope envelope = GlobalExceptionHandler.ErrorEnvelope.builder()
                .success(false)
                .error(errorDetails)
                .timestamp(Instant.now())
                .build();

        response.getWriter().write(objectMapper.writeValueAsString(envelope));
    }
}
