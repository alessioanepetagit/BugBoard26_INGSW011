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

    @Autowired // <--- NUOVO: Iniettiamo il servizio di Audit
    private AuditLogService auditLogService;

    public Issue createIssue(Long reporterId, Issue issue) {
        // 1. Cerchiamo l'utente
        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new RuntimeException("Utente non trovato!"));

        // 2. Prepariamo la segnalazione
        issue.setReporter(reporter);
        issue.setStatus("OPEN");

        // 3. Salviamo la segnalazione
        Issue savedIssue = issueRepository.save(issue);

        // 4. <--- NUOVO: Creiamo il log automatico!
        auditLogService.logAction(
                "CREATE_ISSUE",
                savedIssue.getId(),
                "Created by user: " + reporter.getEmail()
        );

        return savedIssue;
    }

    public List<Issue> getAllIssues() {
        return issueRepository.findAll();
    }
}