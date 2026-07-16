package life.swengineer.interviewprep.content;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "question_state")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class QuestionState {

    @Embeddable
    @Getter
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    @EqualsAndHashCode
    public static class Key implements Serializable {

        @Column(name = "user_id", nullable = false)
        private UUID userId;

        @Column(name = "question_id", nullable = false)
        private UUID questionId;

        public static Key of(UUID userId, UUID questionId) {
            Key key = new Key();
            key.userId = userId;
            key.questionId = questionId;
            return key;
        }
    }

    @EmbeddedId
    private Key id;

    @Enumerated(EnumType.STRING)
    @Column
    private Confidence confidence;

    @Column(columnDefinition = "text")
    private String notes;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    public static QuestionState create(UUID userId, UUID questionId) {
        QuestionState state = new QuestionState();
        state.id = Key.of(userId, questionId);
        return state;
    }

    public void setConfidence(Confidence confidence) {
        this.confidence = confidence;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
