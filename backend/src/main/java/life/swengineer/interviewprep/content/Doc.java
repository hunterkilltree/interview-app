package life.swengineer.interviewprep.content;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "docs")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Doc {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false)
    private String section;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false, columnDefinition = "text")
    private String excerpt;

    @Column(nullable = false, columnDefinition = "text")
    private String body;

    @Column(name = "has_image", nullable = false)
    private boolean hasImage;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    public static Doc create(String section, String title, String type, String excerpt, String body) {
        Doc d = new Doc();
        d.section = section;
        d.title = title;
        d.type = type;
        d.excerpt = excerpt;
        d.body = body;
        d.hasImage = false;
        return d;
    }

    public void update(String section, String title, String type, String excerpt, String body) {
        this.section = section;
        this.title = title;
        this.type = type;
        this.excerpt = excerpt;
        this.body = body;
    }
}
