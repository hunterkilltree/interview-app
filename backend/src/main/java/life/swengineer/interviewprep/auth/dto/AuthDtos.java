package life.swengineer.interviewprep.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.UUID;
import life.swengineer.interviewprep.user.User;

public class AuthDtos {

    public record RegisterRequest(
            @NotBlank @Email String email,
            @NotBlank @Size(min = 6, max = 100) String password,
            @NotBlank @Size(max = 120) String fullName
    ) {}

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password
    ) {}

    public record RefreshRequest(@NotBlank String refreshToken) {}

    public record UserResponse(UUID id, String email, String fullName, String role, Instant createdAt) {
        public static UserResponse from(User user) {
            return new UserResponse(user.getId(), user.getEmail(), user.getFullName(),
                    user.getRole().name(), user.getCreatedAt());
        }
    }

    public record AuthResponse(String accessToken, String refreshToken, long expiresIn, UserResponse user) {}

    private AuthDtos() {}
}
