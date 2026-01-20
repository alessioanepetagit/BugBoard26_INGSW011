package ma.bugboard.bugboard26.controller;

import ma.bugboard.bugboard26.model.Comment;
import ma.bugboard.bugboard26.model.Issue;
import ma.bugboard.bugboard26.model.User;
import ma.bugboard.bugboard26.repository.CommentRepository;
import ma.bugboard.bugboard26.repository.IssueRepository;
import ma.bugboard.bugboard26.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "http://localhost:63342")
public class CommentController {

    private final CommentRepository commentRepository;
    private final IssueRepository issueRepository;
    private final UserRepository userRepository;

    // COSTRUTTORE MANUALE
    public CommentController(CommentRepository commentRepository,
                             IssueRepository issueRepository,
                             UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.issueRepository = issueRepository;
        this.userRepository = userRepository;
    }

    // Scarica i commenti di un ticket
    @GetMapping("/issue/{issueId}")
    public List<Comment> getCommentsByIssue(@PathVariable Long issueId) {
        return commentRepository.findByIssueIdOrderByCreatedAtAsc(issueId);
    }

    //POST: Aggiungi un commento nuovo
    @PostMapping
    public ResponseEntity<?> addComment(
            @RequestParam Long issueId,
            @RequestParam Long authorId,
            @RequestBody Comment commentData) {

        // Recupero gli oggetti in modo sicuro
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Ticket con ID " + issueId + " non trovato"));

        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("Autore con ID " + authorId + " non trovato"));

        // Creo e salvo il commento
        Comment newComment = new Comment();
        newComment.setText(commentData.getText());
        newComment.setIssue(issue);
        newComment.setAuthor(author);

        return ResponseEntity.ok(commentRepository.save(newComment));
    }
}