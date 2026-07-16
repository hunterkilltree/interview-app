package life.swengineer.interviewprep.content;

import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocRepository extends JpaRepository<Doc, UUID> {

    Page<Doc> findAllByOrderByCreatedAtAsc(Pageable pageable);

    Page<Doc> findBySectionOrderByCreatedAtAsc(String section, Pageable pageable);
}
