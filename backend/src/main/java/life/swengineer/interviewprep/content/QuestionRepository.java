package life.swengineer.interviewprep.content;

import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionRepository extends JpaRepository<Question, UUID> {

    Page<Question> findAllByOrderByCreatedAtAsc(Pageable pageable);
}
