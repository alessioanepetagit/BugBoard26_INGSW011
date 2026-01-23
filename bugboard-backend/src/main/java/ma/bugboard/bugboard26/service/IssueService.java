package ma.bugboard.bugboard26.service;

import ma.bugboard.bugboard26.model.Issue;
import ma.bugboard.bugboard26.model.User;
import ma.bugboard.bugboard26.repository.IssueRepository;
import ma.bugboard.bugboard26.repository.UserRepository;
import ma.bugboard.bugboard26.utils.Validation;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class IssueService {

    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public IssueService(IssueRepository issueRepository, UserRepository userRepository, AuditLogService auditLogService) {
        this.issueRepository = issueRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    public Issue createIssue(Long reporterId, Issue issue) {
        Validation.isValidTypeAndPriority(issue.getType(), issue.getPriority());
        User reporter = userRepository.findById(reporterId).orElseThrow(() -> new RuntimeException("User not found"));
        issue.setReporter(reporter);
        issue.setCreatedAt(LocalDateTime.now());
        issue.setStatus("TODO");
        Issue saved = issueRepository.save(issue);
        auditLogService.logAction("CREATE", saved.getId(), "Created by " + reporter.getEmail());
        return saved;
    }

    public Issue archiveIssue(Long id, String userRole) {
        if (!"ADMIN".equals(userRole)) {
            throw new IllegalArgumentException("Permesso negato: solo l'amministratore può archiviare.");
        }
        Issue issue = issueRepository.findById(id).orElseThrow(() -> new RuntimeException("Issue not found"));
        issue.setStatus("ARCHIVED");
        auditLogService.logAction("ARCHIVE", id, "Archived by Admin");
        return issueRepository.save(issue);
    }

    public Issue updateIssue(Long id, Issue updatedIssue) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue not found"));
        issue.setTitle(updatedIssue.getTitle());
        issue.setDescription(updatedIssue.getDescription());
        issue.setType(updatedIssue.getType());
        issue.setPriority(updatedIssue.getPriority());
        issue.setStatus(updatedIssue.getStatus());
        issue.setAssignee(updatedIssue.getAssignee());
        issue.setImageBase64(updatedIssue.getImageBase64());
        return issueRepository.save(issue);
    }

    public Issue restoreIssue(Long id, String userRole) {
        if (!"ADMIN".equals(userRole)) {
            throw new IllegalArgumentException("Permesso negato: solo l'amministratore può ripristinare.");
        }
        Issue issue = issueRepository.findById(id).orElseThrow(() -> new RuntimeException("Issue not found"));
        issue.setStatus("TODO");
        auditLogService.logAction("RESTORE", id, "Restored by Admin");
        return issueRepository.save(issue);
    }

    public List<Issue> getAllIssues() {
        return issueRepository.findAll();
    }

    public void deleteIssue(Long id) {
        if (!issueRepository.existsById(id)) {
            throw new RuntimeException("Issue not found with id: " + id);
        }
        issueRepository.deleteById(id);
    }
}