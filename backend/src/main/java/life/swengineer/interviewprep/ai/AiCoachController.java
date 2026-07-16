package life.swengineer.interviewprep.ai;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import life.swengineer.interviewprep.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
class AiCoachController {

    private final AiCoachService aiCoachService;

    record CoachRequest(@NotNull UUID questionId, String confidence, String notes) {}

    record CoachResponse(String advice) {}

    @PostMapping("/coach")
    ResponseEntity<ApiResponse<CoachResponse>> coach(@RequestBody CoachRequest request) {
        if (!aiCoachService.isConfigured()) {
            return ResponseEntity.status(503).body(ApiResponse.error(
                    "AI_NOT_CONFIGURED",
                    "AI coach is not configured. Set ANTHROPIC_API_KEY to enable it."));
        }
        String advice = aiCoachService.coach(
                request.questionId(), request.confidence(), request.notes());
        return ResponseEntity.ok(ApiResponse.ok(new CoachResponse(advice)));
    }
}
