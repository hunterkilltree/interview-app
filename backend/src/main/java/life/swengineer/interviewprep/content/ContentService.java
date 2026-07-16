package life.swengineer.interviewprep.content;

import java.util.List;
import java.util.UUID;
import life.swengineer.interviewprep.common.NotFoundException;
import life.swengineer.interviewprep.content.dto.ContentDtos.SaveDocRequest;
import life.swengineer.interviewprep.content.dto.ContentDtos.SaveQuestionRequest;
import life.swengineer.interviewprep.content.dto.ContentDtos.UpdateQuestionStateRequest;
import life.swengineer.interviewprep.user.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ContentService {

    private final QuestionRepository questionRepository;
    private final DocRepository docRepository;
    private final QuestionStateRepository questionStateRepository;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    public Page<Question> findQuestions(Pageable pageable) {
        return questionRepository.findAllByOrderByCreatedAtAsc(pageable);
    }

    @Transactional(readOnly = true)
    public Page<Doc> findDocs(String section, Pageable pageable) {
        return section == null
                ? docRepository.findAllByOrderByCreatedAtAsc(pageable)
                : docRepository.findBySectionOrderByCreatedAtAsc(section, pageable);
    }

    @Transactional(readOnly = true)
    public Doc findDoc(UUID id) {
        return docRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Doc with id " + id + " not found"));
    }

    @Transactional(readOnly = true)
    public Question findQuestion(UUID id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Question with id " + id + " not found"));
    }

    // ---- per-user state ----

    @Transactional(readOnly = true)
    public List<QuestionState> findStateForCurrentUser() {
        var user = currentUserService.requireCurrentUser();
        return questionStateRepository.findByIdUserId(user.getId());
    }

    @Transactional
    public QuestionState updateState(UUID questionId, UpdateQuestionStateRequest request) {
        var user = currentUserService.requireCurrentUser();
        findQuestion(questionId); // 404 if unknown
        var state = questionStateRepository
                .findByIdUserIdAndIdQuestionId(user.getId(), questionId)
                .orElseGet(() -> QuestionState.create(user.getId(), questionId));
        if (request.confidence() != null) {
            state.setConfidence(Confidence.fromLabel(request.confidence()));
        }
        if (request.notes() != null) {
            state.setNotes(request.notes());
        }
        return questionStateRepository.save(state);
    }

    // ---- admin CRUD ----

    @Transactional
    public Question createQuestion(SaveQuestionRequest request) {
        return questionRepository.save(Question.create(
                request.section(), request.title(),
                Difficulty.fromLabel(request.difficulty()),
                request.leetcode() == null ? "" : request.leetcode()));
    }

    @Transactional
    public Question updateQuestion(UUID id, SaveQuestionRequest request) {
        var question = findQuestion(id);
        question.update(request.section(), request.title(),
                Difficulty.fromLabel(request.difficulty()),
                request.leetcode() == null ? "" : request.leetcode());
        return question;
    }

    @Transactional
    public void deleteQuestion(UUID id) {
        questionRepository.delete(findQuestion(id));
    }

    @Transactional
    public Doc createDoc(SaveDocRequest request) {
        return docRepository.save(Doc.create(
                request.section(), request.title(), request.type(),
                request.excerpt() == null ? "" : request.excerpt(),
                request.body() == null ? "" : request.body()));
    }

    @Transactional
    public Doc updateDoc(UUID id, SaveDocRequest request) {
        var doc = findDoc(id);
        doc.update(request.section(), request.title(), request.type(),
                request.excerpt() == null ? "" : request.excerpt(),
                request.body() == null ? "" : request.body());
        return doc;
    }

    @Transactional
    public void deleteDoc(UUID id) {
        docRepository.delete(findDoc(id));
    }
}
