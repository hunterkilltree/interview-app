package life.swengineer.interviewprep.ai;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import life.swengineer.interviewprep.content.ContentService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class AiCoachService {

    private final ContentService contentService;
    private final RestClient restClient;
    private final String apiKey;
    private final String model;

    public AiCoachService(ContentService contentService,
                          @Value("${app.anthropic.api-key}") String apiKey,
                          @Value("${app.anthropic.model}") String model) {
        this.contentService = contentService;
        this.apiKey = apiKey;
        this.model = model;
        this.restClient = RestClient.builder()
                .baseUrl("https://api.anthropic.com")
                .build();
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    @SuppressWarnings("unchecked")
    public String coach(UUID questionId, String confidence, String notes) {
        var question = contentService.findQuestion(questionId);

        String prompt = "Problem: %s (%s)%nMy confidence: %s%nMy notes: %s".formatted(
                question.getTitle(),
                question.getDifficulty().label(),
                confidence == null ? "not set" : confidence,
                notes == null || notes.isBlank() ? "(none)" : notes);

        Map<String, Object> body = Map.of(
                "model", model,
                "max_tokens", 600,
                "system", "You are an interview-prep coach. Be concise and practical. "
                        + "Given a LeetCode-style problem, the user's self-rated confidence, and their notes, "
                        + "give 3-5 short, concrete coaching tips: the key pattern/approach to remember, "
                        + "common pitfalls, and what to practice next. Plain text, no markdown headers.",
                "messages", List.of(Map.of("role", "user", "content", prompt)));

        Map<String, Object> response = restClient.post()
                .uri("/v1/messages")
                .header("x-api-key", apiKey)
                .header("anthropic-version", "2023-06-01")
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(Map.class);

        if (response == null || !(response.get("content") instanceof List<?> blocks)) {
            return "";
        }
        StringBuilder advice = new StringBuilder();
        for (Object block : blocks) {
            if (block instanceof Map<?, ?> m && "text".equals(m.get("type"))) {
                advice.append(m.get("text"));
            }
        }
        return advice.toString();
    }
}
