package ma.bugboard.bugboard26.utils;

import java.util.Arrays;
import java.util.List;

public class Validation {

    // Metodo 1: Validazione Credenziali (N-WECT)
    public static boolean isValidEmailAndPassword(String email, String password) {
        if (email == null || !email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new IllegalArgumentException("Email non conforme al formato richiesto");
        }
        if (password == null || password.length() < 6 || password.length() > 16) {
            throw new IllegalArgumentException("La password deve avere tra 6 e 16 caratteri");
        }
        return true;
    }

    // Metodo 2: Validazione Tipo e Priorità (R-WECT)
    public static boolean isValidTypeAndPriority(String type, String priority) {
        List<String> validTypes = Arrays.asList("BUG", "FEATURE", "QUESTION", "DOCUMENTATION");
        List<String> validPriorities = Arrays.asList("LOW", "MEDIUM", "HIGH");

        if (type == null || !validTypes.contains(type.toUpperCase())) {
            throw new IllegalArgumentException("Tipologia issue non valida");
        }
        if (priority == null || !validPriorities.contains(priority.toUpperCase())) {
            throw new IllegalArgumentException("Priorità non valida");
        }
        return true;
    }
}