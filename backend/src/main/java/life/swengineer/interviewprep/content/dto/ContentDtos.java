package life.swengineer.interviewprep.content.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.UUID;
import life.swengineer.interviewprep.content.Doc;
import life.swengineer.interviewprep.content.Question;
import life.swengineer.interviewprep.content.QuestionState;

public class ContentDtos {

    public record QuestionResponse(
            UUID id,
            String section,
            String title,
            String difficulty,
            String leetcode,
            String defaultConfidence,
            String defaultNotes,
            Instant createdAt
    ) {
        public static QuestionResponse from(Question q) {
            return new QuestionResponse(q.getId(), q.getSection(), q.getTitle(),
                    q.getDifficulty().label(), q.getLeetcodeUrl(),
                    q.getDefaultConfidence().label(), q.getDefaultNotes(), q.getCreatedAt());
        }
    }

    public record DocResponse(
            UUID id,
            String section,
            String title,
            String type,
            String excerpt,
            String body,
            boolean hasImage,
            Instant createdAt
    ) {
        public static DocResponse from(Doc d) {
            return new DocResponse(d.getId(), d.getSection(), d.getTitle(), d.getType(),
                    d.getExcerpt(), d.getBody(), d.isHasImage(), d.getCreatedAt());
        }
    }

    public record QuestionStateResponse(UUID questionId, String confidence, String notes) {
        public static QuestionStateResponse from(QuestionState s) {
            return new QuestionStateResponse(
                    s.getId().getQuestionId(),
                    s.getConfidence() == null ? null : s.getConfidence().label(),
                    s.getNotes());
        }
    }

    public record UpdateQuestionStateRequest(String confidence, String notes) {}

    public record SaveQuestionRequest(
            @NotBlank @Size(max = 50) String section,
            @NotBlank @Size(max = 300) String title,
            @NotBlank String difficulty,
            @Size(max = 500) String leetcode
    ) {}

    public record SaveDocRequest(
            @NotBlank @Size(max = 50) String section,
            @NotBlank @Size(max = 300) String title,
            @NotBlank @Size(max = 100) String type,
            @Size(max = 1000) String excerpt,
            String body
    ) {}

    private ContentDtos() {}
}
