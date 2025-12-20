package ma.bugboard.bugboard26.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "users") // Questo crea la tabella 'users' nel database
@Data // Lombok: crea in automatico Getters, Setters e toString
@NoArgsConstructor // Lombok: costruttore vuoto
@AllArgsConstructor // Lombok: costruttore con tutti i parametri
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role; // "ADMIN" o "USER"
}