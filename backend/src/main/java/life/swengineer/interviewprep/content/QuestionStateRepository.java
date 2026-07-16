package life.swengineer.interviewprep.content;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionStateRepository extends JpaRepository<QuestionState, QuestionState.Key> {

    List<QuestionState> findByIdUserId(UUID userId);

    Optional<QuestionState> findByIdUserIdAndIdQuestionId(UUID userId, UUID questionId);
}
