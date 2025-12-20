package ma.bugboard.bugboard26.controller;

import ma.bugboard.bugboard26.model.Issue;
import ma.bugboard.bugboard26.service.IssueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
public class IssueController {

    @Autowired
    private IssueService issueService;

    // API per creare una segnalazione
    // Esempio: POST /api/issues?reporterId=1
    @PostMapping
    public Issue createIssue(@RequestParam Long reporterId, @RequestBody Issue issue) {
        return issueService.createIssue(reporterId, issue);
    }

    // API per vedere tutte le segnalazioni
    @GetMapping
    public List<Issue> getAllIssues() {
        return issueService.getAllIssues();
    }
}