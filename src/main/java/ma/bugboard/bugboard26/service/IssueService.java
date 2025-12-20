package ma.bugboard.bugboard26.service;

import ma.bugboard.bugboard26.model.Issue;
import ma.bugboard.bugboard26.model.User;
import ma.bugboard.bugboard26.repository.IssueRepository;
import ma.bugboard.bugboard26.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class IssueService {

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private UserRepository userRepository;

    // Quando creiamo una issue, ci serve sapere CHI la sta creando (reporterId)
    public Issue createIssue(Long reporterId, Issue issue) {
        // 1. Cerchiamo l'utente nel database
        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new RuntimeException("Utente non trovato!"));

        // 2. Colleghiamo l'utente alla segnalazione
        issue.setReporter(reporter);
        issue.setStatus("OPEN"); // Impostiamo lo stato iniziale di default

        // 3. Salviamo la segnalazione
        return issueRepository.save(issue);
    }

    public List<Issue> getAllIssues() {
        return issueRepository.findAll();
    }
}