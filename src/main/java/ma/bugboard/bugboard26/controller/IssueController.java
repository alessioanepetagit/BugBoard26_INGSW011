package ma.bugboard.bugboard26.controller;

import ma.bugboard.bugboard26.model.Issue;
import ma.bugboard.bugboard26.service.IssueService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
@CrossOrigin(origins = "*")
public class IssueController {

    private final IssueService issueService;

    public IssueController(IssueService issueService) {
        this.issueService = issueService;
    }

    @PostMapping("/{reporterId}")
    public Issue createIssue(@PathVariable Long reporterId, @RequestBody Issue issue) {
        return issueService.createIssue(reporterId, issue);
    }

    @GetMapping
    public List<Issue> getAllIssues() {
        return issueService.getAllIssues();
    }

    // Endpoint per archiviare: riceve il ruolo dall'header della richiesta
    @PutMapping("/{id}/archive")
    public ResponseEntity<?> archiveIssue(@PathVariable Long id, @RequestHeader("X-User-Role") String role) {
        try {
            return ResponseEntity.ok(issueService.archiveIssue(id, role));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public Issue updateIssue(@PathVariable Long id, @RequestBody Issue issue) {
        return issueService.updateIssue(id, issue);
    }


    // Endpoint per ripristinare: riceve il ruolo dall'header della richiesta
    @PutMapping("/{id}/restore")
    public ResponseEntity<?> restoreIssue(@PathVariable Long id, @RequestHeader("X-User-Role") String role) {
        try {
            return ResponseEntity.ok(issueService.restoreIssue(id, role));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIssue(@PathVariable Long id) {
        issueService.deleteIssue(id);
        return ResponseEntity.noContent().build();
    }
}