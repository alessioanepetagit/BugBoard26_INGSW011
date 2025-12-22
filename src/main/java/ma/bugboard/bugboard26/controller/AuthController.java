package ma.bugboard.bugboard26.controller;

import ma.bugboard.bugboard26.dto.LoginRequest;
import ma.bugboard.bugboard26.model.User;
import ma.bugboard.bugboard26.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // 1. Cerca l'utente
        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        // 2. Controllo Password (semplice per ora)
        if (user == null || !user.getPassword().equals(request.getPassword())) {
            return ResponseEntity.status(401).body("Email o Password errati!");
        }

        // 3. Login OK!
        return ResponseEntity.ok(user);
    }
}