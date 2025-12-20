package ma.bugboard.bugboard26.service;

import ma.bugboard.bugboard26.model.AuditLog;
import ma.bugboard.bugboard26.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public void logAction(String action, Long entityId, String payload) {
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setEntityId(entityId);
        log.setPayload(payload);
        // Il timestamp lo mette da solo (vedi la classe Model che abbiamo fatto prima)

        auditLogRepository.save(log);
    }
}