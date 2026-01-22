package ma.bugboard.bugboard26.service;

import ma.bugboard.bugboard26.model.AuditLog;
import ma.bugboard.bugboard26.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void logAction(String action, Long entityId, String payload) {
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setEntityId(entityId);
        log.setPayload(payload);


        auditLogRepository.save(log);
    }
}