package ma.bugboard.bugboard26.utils;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ValidationTest {

    @Test
    @DisplayName("Test Credenziali (N-WECT)")
    void testEmailAndPassword() {
        // TC1: Email valida e password valida (Copre CE1, CE3 del documento)
        assertTrue(Validation.isValidEmailAndPassword("admin@bugboard.com", "123456"));
    }

    @Test
    @DisplayName("Test Tipo e Priorità (R-WECT + Robustness)")
    void testTypeAndPriority() {
        // --- Copertura Classi Valide (Happy Path - WECT) ---
        assertTrue(Validation.isValidTypeAndPriority("BUG", "HIGH"));
        assertTrue(Validation.isValidTypeAndPriority("FEATURE", "MEDIUM"));
        assertTrue(Validation.isValidTypeAndPriority("QUESTION", "LOW"));

        // --- Copertura Classi Non Valide (Robustness) ---

        // Tipo non valido (CE4)
        assertThrows(IllegalArgumentException.class, () -> Validation.isValidTypeAndPriority("CRASH", "HIGH"));

        // Priorità non valida (CE8)
        assertThrows(IllegalArgumentException.class, () -> Validation.isValidTypeAndPriority("BUG", "URGENT"));

        // Input null
        assertThrows(IllegalArgumentException.class, () -> Validation.isValidTypeAndPriority(null, "HIGH"));
    }
}