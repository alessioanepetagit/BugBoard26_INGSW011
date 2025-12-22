package ma.bugboard.bugboard26.repository;

import ma.bugboard.bugboard26.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // Cerca un utente tramite email (fondamentale per il login)
    Optional<User> findByEmail(String email);

    // Controlla se un'email esiste già (utile per il futuro)
    boolean existsByEmail(String email);
}