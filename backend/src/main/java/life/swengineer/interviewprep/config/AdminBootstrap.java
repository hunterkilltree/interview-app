package life.swengineer.interviewprep.config;

import life.swengineer.interviewprep.user.Role;
import life.swengineer.interviewprep.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Promotes the user with ADMIN_EMAIL to admin on startup (if they exist).
 * Register first, then restart with ADMIN_EMAIL set — or set it up-front;
 * promotion happens on the next boot after signup.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AdminBootstrap implements ApplicationRunner {

    private final UserRepository userRepository;

    @Value("${app.admin.email:}")
    private String adminEmail;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (adminEmail == null || adminEmail.isBlank()) {
            return;
        }
        userRepository.findByEmail(adminEmail).ifPresent(user -> {
            if (user.getRole() != Role.ADMIN) {
                user.promoteToAdmin();
                userRepository.save(user);
                log.info("Promoted {} to ADMIN", adminEmail);
            }
        });
    }
}
