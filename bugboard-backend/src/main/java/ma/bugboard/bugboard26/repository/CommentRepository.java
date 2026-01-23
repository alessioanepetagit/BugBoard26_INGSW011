package ma.bugboard.bugboard26.repository;

import ma.bugboard.bugboard26.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    // Trova tutti i commenti di un ticket e mettili in ordine (dal più vecchio al più nuovo)
    List<Comment> findByIssueIdOrderByCreatedAtAsc(Long issueId);
}