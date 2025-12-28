package ma.bugboard.bugboard26.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp; // Import fondamentale per la data automatica
import java.time.LocalDateTime;

@Entity
@Table(name = "issues")
@Data // Genera in automatico Getter, Setter, toString, ecc.
@NoArgsConstructor
@AllArgsConstructor
public class Issue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT") // Per descrizioni lunghe
    private String description;

    // Tipo: BUG, FEATURE
    private String type;

    // Priorità: LOW, MEDIUM, HIGH
    private String priority;

    // Stato: OPEN, IN_PROGRESS, DONE
    private String status;

    // Nome dell'assegnatario (es. "Mario Rossi")
    private String assignee;

    // --- GESTIONE DATA AUTOMATICA ---
    @CreationTimestamp        // Hibernate inserirà la data esatta di salvataggio
    @Column(updatable = false) // La data di creazione non deve cambiare mai
    private LocalDateTime createdAt;
    // --------------------------------

    // RELAZIONE: Molte Issue possono essere create da un solo User (Reporter)
    @ManyToOne
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;
}