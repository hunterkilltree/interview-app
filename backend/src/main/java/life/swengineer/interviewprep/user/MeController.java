package life.swengineer.interviewprep.user;

import life.swengineer.interviewprep.auth.dto.AuthDtos.UserResponse;
import life.swengineer.interviewprep.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/me")
@RequiredArgsConstructor
class MeController {

    private final CurrentUserService currentUserService;

    @GetMapping
    ApiResponse<UserResponse> me() {
        return ApiResponse.ok(UserResponse.from(currentUserService.requireCurrentUser()));
    }
}
