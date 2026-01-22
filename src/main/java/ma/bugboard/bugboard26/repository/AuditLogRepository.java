package ma.bugboard.bugboard26.repository;

import ma.bugboard.bugboard26.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    // Trova la storia delle modifiche di una specifica entità (es. la Issue #12)
    List<AuditLog> findByEntityId(Long entityId);
}