package life.swengineer.interviewprep.auth;

import jakarta.validation.Valid;
import life.swengineer.interviewprep.auth.dto.AuthDtos.AuthResponse;
import life.swengineer.interviewprep.auth.dto.AuthDtos.LoginRequest;
import life.swengineer.interviewprep.auth.dto.AuthDtos.RefreshRequest;
import life.swengineer.interviewprep.auth.dto.AuthDtos.RegisterRequest;
import life.swengineer.interviewprep.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(201).body(ApiResponse.ok(authService.register(request)));
    }

    @PostMapping("/login")
    ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    ApiResponse<AuthResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        return ApiResponse.ok(authService.refresh(request.refreshToken()));
    }
}
