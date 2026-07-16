package life.swengineer.interviewprep.content;

import java.util.List;
import java.util.UUID;
import life.swengineer.interviewprep.common.ApiResponse;
import life.swengineer.interviewprep.content.dto.ContentDtos.QuestionResponse;
import life.swengineer.interviewprep.content.dto.ContentDtos.QuestionStateResponse;
import life.swengineer.interviewprep.content.dto.ContentDtos.UpdateQuestionStateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
class QuestionController {

    private final ContentService contentService;

    @GetMapping("/questions")
    ApiResponse<Page<QuestionResponse>> listQuestions(Pageable pageable) {
        return ApiResponse.ok(contentService.findQuestions(pageable).map(QuestionResponse::from));
    }

    @GetMapping("/question-state")
    ApiResponse<List<QuestionStateResponse>> myState() {
        return ApiResponse.ok(contentService.findStateForCurrentUser().stream()
                .map(QuestionStateResponse::from).toList());
    }

    @PutMapping("/question-state/{questionId}")
    ApiResponse<QuestionStateResponse> updateState(
            @PathVariable UUID questionId,
            @RequestBody UpdateQuestionStateRequest request) {
        return ApiResponse.ok(QuestionStateResponse.from(
                contentService.updateState(questionId, request)));
    }
}
