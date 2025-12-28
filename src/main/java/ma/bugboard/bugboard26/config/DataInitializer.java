package ma.bugboard.bugboard26.config;

import ma.bugboard.bugboard26.model.User;
import ma.bugboard.bugboard26.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initAdmin(UserRepository userRepository) {
        return args -> {
            System.out.println("🔍 [STARTUP] Controllo presenza Admin...");

            if (userRepository.findByEmail("admin@bugboard.com").isEmpty()) {
                System.out.println("⚠️ Admin non trovato. Inizio creazione...");

                try {
                    User admin = new User();
                    admin.setEmail("admin@bugboard.com");
                    admin.setPassword("admin");
                    admin.setName("Super Admin");
                    admin.setRole("ADMIN");

                    userRepository.save(admin);
                    System.out.println("✅ [SUCCESSO] UTENTE ADMIN CREATO CORRETTAMENTE!");
                } catch (Exception e) {
                    System.err.println("❌ [ERRORE] Impossibile creare l'admin: " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                System.out.println("ℹ️ [INFO] L'utente Admin esiste già nel database.");
            }
        };
    }
}