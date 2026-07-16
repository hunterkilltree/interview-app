package life.swengineer.interviewprep.auth;

import life.swengineer.interviewprep.auth.dto.AuthDtos.AuthResponse;
import life.swengineer.interviewprep.auth.dto.AuthDtos.LoginRequest;
import life.swengineer.interviewprep.auth.dto.AuthDtos.RegisterRequest;
import life.swengineer.interviewprep.auth.dto.AuthDtos.UserResponse;
import life.swengineer.interviewprep.common.ConflictException;
import life.swengineer.interviewprep.common.NotFoundException;
import life.swengineer.interviewprep.user.User;
import life.swengineer.interviewprep.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("An account with this email already exists");
        }
        User user = User.create(request.email(),
                passwordEncoder.encode(request.password()), request.fullName());
        userRepository.save(user);
        return issueTokens(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new NotFoundException("User not found"));
        return issueTokens(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse refresh(String refreshToken) {
        String email;
        try {
            if (!jwtService.isRefreshToken(refreshToken)) {
                throw new BadCredentialsException("Not a refresh token");
            }
            email = jwtService.extractUsername(refreshToken);
        } catch (Exception e) {
            throw new BadCredentialsException("Invalid refresh token");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid refresh token"));
        return issueTokens(user);
    }

    private AuthResponse issueTokens(User user) {
        var details = userDetailsService.loadUserByUsername(user.getEmail());
        return new AuthResponse(
                jwtService.generateAccessToken(details),
                jwtService.generateRefreshToken(details),
                jwtService.accessTokenExpiryMillis(),
                UserResponse.from(user));
    }
}
