package ma.bugboard.bugboard26.controller;

import ma.bugboard.bugboard26.model.Comment;
import ma.bugboard.bugboard26.model.Issue;
import ma.bugboard.bugboard26.model.User;
import ma.bugboard.bugboard26.repository.CommentRepository;
import ma.bugboard.bugboard26.repository.IssueRepository;
import ma.bugboard.bugboard26.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "*") // Permette al sito di comunicare con noi
public class CommentController {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private UserRepository userRepository;

    // 1. GET: Scarica i commenti di un ticket
    @GetMapping("/issue/{issueId}")
    public List<Comment> getCommentsByIssue(@PathVariable Long issueId) {
        return commentRepository.findByIssueIdOrderByCreatedAtAsc(issueId);
    }

    // 2. POST: Aggiungi un commento nuovo
    // 2. POST: Aggiungi un nuovo commento
    @PostMapping
    public ResponseEntity<?> addComment(
            @RequestParam Long issueId,
            @RequestParam Long authorId,
            @RequestBody Comment commentData) {

        // 1. Controllo se il Ticket esiste
        if (!issueRepository.existsById(issueId)) {
            return ResponseEntity.badRequest().body("Ticket non trovato");
        }

        // 2. Controllo se l'Autore esiste
        if (!userRepository.existsById(authorId)) {
            return ResponseEntity.badRequest().body("Autore non trovato");
        }

        // Recupero gli oggetti veri dal database
        // (Uso .get() perché sono sicuro che esistono grazie ai controlli sopra)
        Issue issue = issueRepository.findById(issueId).get();
        User author = userRepository.findById(authorId).get();

        // 3. Creo e salvo il commento
        Comment newComment = new Comment();
        newComment.setText(commentData.getText());
        newComment.setIssue(issue);
        newComment.setAuthor(author);

        return ResponseEntity.ok(commentRepository.save(newComment));
    }
}