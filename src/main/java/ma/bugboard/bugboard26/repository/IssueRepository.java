package ma.bugboard.bugboard26.repository;

import ma.bugboard.bugboard26.model.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IssueRepository extends JpaRepository<Issue, Long> {
    // Trova tutte le segnalazioni aperte da un certo utente
    List<Issue> findByReporterId(Long reporterId);

    // Trova tutte le segnalazioni con un certo stato (es. "OPEN")
    List<Issue> findByStatus(String status);
}