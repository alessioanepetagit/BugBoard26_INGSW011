package ma.bugboard.bugboard26.config;

import ma.bugboard.bugboard26.model.User;
import ma.bugboard.bugboard26.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {


    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    CommandLineRunner initAdmin(UserRepository userRepository) {
        return args -> {
            log.info("🔍 [STARTUP] Controllo presenza Admin...");

            if (userRepository.findByEmail("admin@bugboard.com").isEmpty()) {
                log.info("⚠️ Admin non trovato. Inizio creazione...");

                try {
                    User admin = new User();
                    admin.setEmail("admin@bugboard.com");
                    admin.setPassword("admin");
                    admin.setName("Super Admin");
                    admin.setRole("ADMIN");

                    userRepository.save(admin);
                    log.info("✅ [SUCCESSO] UTENTE ADMIN CREATO CORRETTAMENTE!");
                } catch (Exception e) {

                    log.error("❌ [ERRORE] Impossibile creare l'admin: ", e);
                }
            } else {
                log.info("ℹ️ [INFO] L'utente Admin esiste già nel database.");
            }
        };
    }
}