package com.taskmanager.api.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;

@Component
public class JwtUtils {

    /**
     * Utility for generating and validating JWT tokens used by the application.
     * <p>
        * The constructor accepts either a Base64/Base64URL secret (recommended) or a plain
        * string secret (will be derived to 32 bytes for HS256).
        * It also requires an expiration timeout in milliseconds via `jwt.expiration`.
     */

    private final Key key;
    private final long expirationMs;

    public JwtUtils(@Value("${jwt.secret}") String secret, @Value("${jwt.expiration}") long expirationMs) {
        byte[] keyBytes = decodeOrDeriveKeyBytes(secret);
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMs = expirationMs;
    }

    private static byte[] decodeOrDeriveKeyBytes(String secret) {
        // HS256 requires >= 256-bit key material. We accept:
        // - Base64 (standard) secrets
        // - Base64URL secrets
        // - Plain strings (hashed to 32 bytes)
        byte[] decoded = null;
        try {
            decoded = Decoders.BASE64.decode(secret);
        } catch (Exception ignored) {
            // try URL-safe base64
            try {
                decoded = Decoders.BASE64URL.decode(secret);
            } catch (Exception ignored2) {
                decoded = null;
            }
        }

        if (decoded != null && decoded.length >= 32) {
            return decoded;
        }

        // Fall back to SHA-256(secret) to ensure minimum length even for short dev secrets.
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return digest.digest(secret.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        } catch (NoSuchAlgorithmException e) {
            // Should never happen on a standard JVM
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    public String generateToken(String subject) {
        /**
         * Build a signed JWT containing the provided subject as the token subject.
         */
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);
        return Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String getSubjectFromToken(String token) {
        /**
         * Parse the token and return the subject (typically the username).
         */
        Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
        return claims.getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }
}
