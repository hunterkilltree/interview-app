package life.swengineer.interviewprep.content;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "questions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false)
    private String section;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty;

    @Column(name = "leetcode_url", nullable = false)
    private String leetcodeUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "default_confidence", nullable = false)
    private Confidence defaultConfidence;

    @Column(name = "default_notes", nullable = false, columnDefinition = "text")
    private String defaultNotes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    public static Question create(String section, String title, Difficulty difficulty, String leetcodeUrl) {
        Question q = new Question();
        q.section = section;
        q.title = title;
        q.difficulty = difficulty;
        q.leetcodeUrl = leetcodeUrl;
        q.defaultConfidence = Confidence.MEDIUM;
        q.defaultNotes = "";
        return q;
    }

    public void update(String section, String title, Difficulty difficulty, String leetcodeUrl) {
        this.section = section;
        this.title = title;
        this.difficulty = difficulty;
        this.leetcodeUrl = leetcodeUrl;
    }
}
