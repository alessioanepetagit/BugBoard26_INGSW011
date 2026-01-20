package ma.bugboard.bugboard26.controller;

import ma.bugboard.bugboard26.model.User;
import ma.bugboard.bugboard26.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:63342")
public class UserController {

    private final UserRepository userRepository;

    // COSTRUTTORE MANUALE
    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    //  API PER CREARE UTENTE (Pannello Admin)
    @PostMapping("/create")
    public ResponseEntity<?> createUser(@RequestBody User user) {
        System.out.println("📢 [ADMIN] TENTATIVO CREAZIONE UTENTE:");
        System.out.println("   Nome:  " + user.getName());
        System.out.println("   Email: " + user.getEmail());
        System.out.println("   Ruolo: " + user.getRole());

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            System.out.println("❌ [ERRORE] Email già esistente!");
            return ResponseEntity.badRequest().body("Email già esistente!");
        }

        User savedUser = userRepository.save(user);
        System.out.println("✅ [SUCCESSO] Utente salvato nel DB con ID: " + savedUser.getId());
        return ResponseEntity.ok(savedUser);
    }

    // API PER IL LOGIN (Usata da login.html)
    @PostMapping("/login")
    public User login(@RequestBody Map<String, String> loginData) {
        String email = loginData.get("email");
        String password = loginData.get("password");

        System.out.println("🔍 TENTATIVO LOGIN:");
        System.out.println("   Email ricevuta: [" + email + "]");
        System.out.println("   Pass ricevuta:  [" + password + "]");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utente non trovato nel DB!"));

        System.out.println("   Pass nel DB:    [" + user.getPassword() + "]");

        if (!user.getPassword().equals(password)) {
            System.out.println("❌ ERRORE: Le password non coincidono!");
            throw new RuntimeException("Password errata!");
        }

        System.out.println("✅ SUCCESSO: Password corrette!");
        return user;
    }

    //  API PER LA REGISTRAZIONE PUBBLICA (Tasto "Registrati")
    @PostMapping("/register")
    public User register(@RequestBody Map<String, String> userData) {
        String email = userData.get("email");
        String password = userData.get("password");
        String name = userData.getOrDefault("name", "Nuovo Utente");

        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email già in uso!");
        }

        User newUser = new User();
        newUser.setEmail(email);
        newUser.setPassword(password);
        newUser.setName(name);
        newUser.setRole("USER");

        return userRepository.save(newUser);
    }

    // API Utile per debug (Leggere tutti gli utenti)
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}