package ma.bugboard.bugboard26.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "issues")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Issue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT") // TEXT serve per descrizioni lunghe
    private String description;

    // Usiamo String per semplicità, ma nel codice controlleremo che siano
    // valori validi (es. "BUG", "FEATURE" / "TODO", "DONE")
    private String type;
    private String priority;
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now(); // Imposta la data di oggi in automatico

    // RELAZIONE: Molte Issue possono essere create da un solo User
    @ManyToOne
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;
}