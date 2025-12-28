package ma.bugboard.bugboard26.controller;

import ma.bugboard.bugboard26.model.Issue;
import ma.bugboard.bugboard26.model.User;
import ma.bugboard.bugboard26.repository.UserRepository;
import ma.bugboard.bugboard26.service.IssueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import ma.bugboard.bugboard26.repository.IssueRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/issues")
@CrossOrigin(origins = "*")
public class IssueController {

    @Autowired
    private IssueService issueService;

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private UserRepository userRepository;

    // API per creare una segnalazione
    // Esempio: POST /api/issues?reporterId=1
    @PostMapping
    public Issue createIssue(@RequestParam Long reporterId, @RequestBody Issue issue) {
        // 1. RECUPERIAMO L'UTENTE DAL DB (Questa parte mancava!)
        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new RuntimeException("Utente non trovato!"));
        // 2. Impostiamo i dati
        issue.setReporter(reporter);
        issue.setCreatedAt(LocalDateTime.now());
        // 3. Impostiamo lo stato iniziale a "TODO" come da specifiche
        issue.setStatus("TODO");
        return issueRepository.save(issue);
    }

    // API per vedere tutte le segnalazioni
    @GetMapping
    public List<Issue> getAllIssues() {
        return issueService.getAllIssues();
    }

    // 1. Per CANCELLARE un bug (DELETE)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIssue(@PathVariable Long id) {
        if (issueRepository.existsById(id)) {
            issueRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // 2. Per CHIUDERE un bug (cambia stato a CLOSED)
    @PutMapping("/{id}/close")
    public ResponseEntity<Issue> closeIssue(@PathVariable Long id) {
        return issueRepository.findById(id).map(issue -> {
            issue.setStatus("CLOSED"); // Cambia lo stato
            return ResponseEntity.ok(issueRepository.save(issue));
        }).orElse(ResponseEntity.notFound().build());
    }

    // 3. Per MODIFICARE un bug esistente (PUT)
    // AGGIUNGI QUESTO METODO IN IssueController.java SE MANCA

    @PutMapping("/{id}")
    public Issue updateIssue(@PathVariable Long id, @RequestBody Issue updatedIssue) {
        return issueRepository.findById(id)
                .map(issue -> {
                    issue.setTitle(updatedIssue.getTitle());
                    issue.setDescription(updatedIssue.getDescription());
                    issue.setType(updatedIssue.getType());
                    issue.setPriority(updatedIssue.getPriority());
                    issue.setStatus(updatedIssue.getStatus()); // Fondamentale per Archiviare/Chiudere
                    issue.setAssignee(updatedIssue.getAssignee());
                    // Non aggiorniamo reporter e createdAt per sicurezza
                    return issueRepository.save(issue);
                })
                .orElseThrow(() -> new RuntimeException("Issue not found"));
    }

}