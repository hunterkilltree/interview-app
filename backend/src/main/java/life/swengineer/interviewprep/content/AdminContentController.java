package life.swengineer.interviewprep.content;

import jakarta.validation.Valid;
import java.util.UUID;
import life.swengineer.interviewprep.common.ApiResponse;
import life.swengineer.interviewprep.content.dto.ContentDtos.DocResponse;
import life.swengineer.interviewprep.content.dto.ContentDtos.QuestionResponse;
import life.swengineer.interviewprep.content.dto.ContentDtos.SaveDocRequest;
import life.swengineer.interviewprep.content.dto.ContentDtos.SaveQuestionRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
class AdminContentController {

    private final ContentService contentService;

    // ---- questions ----

    @PostMapping("/questions")
    ResponseEntity<ApiResponse<QuestionResponse>> createQuestion(
            @Valid @RequestBody SaveQuestionRequest request) {
        return ResponseEntity.status(201)
                .body(ApiResponse.ok(QuestionResponse.from(contentService.createQuestion(request))));
    }

    @PutMapping("/questions/{id}")
    ApiResponse<QuestionResponse> updateQuestion(
            @PathVariable UUID id, @Valid @RequestBody SaveQuestionRequest request) {
        return ApiResponse.ok(QuestionResponse.from(contentService.updateQuestion(id, request)));
    }

    @DeleteMapping("/questions/{id}")
    ResponseEntity<Void> deleteQuestion(@PathVariable UUID id) {
        contentService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }

    // ---- docs ----

    @PostMapping("/docs")
    ResponseEntity<ApiResponse<DocResponse>> createDoc(@Valid @RequestBody SaveDocRequest request) {
        return ResponseEntity.status(201)
                .body(ApiResponse.ok(DocResponse.from(contentService.createDoc(request))));
    }

    @PutMapping("/docs/{id}")
    ApiResponse<DocResponse> updateDoc(
            @PathVariable UUID id, @Valid @RequestBody SaveDocRequest request) {
        return ApiResponse.ok(DocResponse.from(contentService.updateDoc(id, request)));
    }

    @DeleteMapping("/docs/{id}")
    ResponseEntity<Void> deleteDoc(@PathVariable UUID id) {
        contentService.deleteDoc(id);
        return ResponseEntity.noContent().build();
    }
}
