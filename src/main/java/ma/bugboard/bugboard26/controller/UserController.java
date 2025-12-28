package ma.bugboard.bugboard26.controller;

import ma.bugboard.bugboard26.model.User;
import ma.bugboard.bugboard26.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // ---------------------------------------------------------
    // 1. API PER CREARE UTENTE (Pannello Admin) - STEP 4B
    // ---------------------------------------------------------
    @PostMapping("/create")
    public ResponseEntity<?> createUser(@RequestBody User user) {
        // SPIA 1: Vediamo se la richiesta arriva
        System.out.println("📢 [ADMIN] TENTATIVO CREAZIONE UTENTE:");
        System.out.println("   Nome:  " + user.getName());
        System.out.println("   Email: " + user.getEmail());
        System.out.println("   Ruolo: " + user.getRole());

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            System.out.println("❌ [ERRORE] Email già esistente!");
            return ResponseEntity.badRequest().body("Email già esistente!");
        }

        User savedUser = userRepository.save(user);

        // SPIA 2: Conferma salvataggio
        System.out.println("✅ [SUCCESSO] Utente salvato nel DB con ID: " + savedUser.getId());
        return ResponseEntity.ok(savedUser);
    }


    // 2. API PER IL LOGIN (Usata da login.html)
    @PostMapping("/login")
    public User login(@RequestBody Map<String, String> loginData) {
        String email = loginData.get("email");
        String password = loginData.get("password");

        // SPIA 1: Vediamo cosa arriva dal sito
        System.out.println("🔍 TENTATIVO LOGIN:");
        System.out.println("   Email ricevuta: [" + email + "]");
        System.out.println("   Pass ricevuta:  [" + password + "]");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utente non trovato nel DB!"));

        // SPIA 2: Vediamo cosa c'è nel database
        System.out.println("   Pass nel DB:    [" + user.getPassword() + "]");

        if (!user.getPassword().equals(password)) {
            System.out.println("❌ ERRORE: Le password non coincidono!");
            throw new RuntimeException("Password errata!");
        }

        System.out.println("✅ SUCCESSO: Password corrette!");
        return user;
    }

    // 3. API PER LA REGISTRAZIONE PUBBLICA (Tasto "Registrati")
    @PostMapping("/register")
    public User register(@RequestBody Map<String, String> userData) {
        String email = userData.get("email");
        String password = userData.get("password");
        // Se arriva il nome bene, altrimenti mettiamo stringa vuota per non rompere il DB
        String name = userData.getOrDefault("name", "Nuovo Utente");

        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email già in uso!");
        }

        User newUser = new User();
        newUser.setEmail(email);
        newUser.setPassword(password);
        newUser.setName(name);
        newUser.setRole("USER"); // Chi si registra da solo è sempre USER normale

        return userRepository.save(newUser);
    }

    // API Utile per debug (Leggere tutti gli utenti)
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}