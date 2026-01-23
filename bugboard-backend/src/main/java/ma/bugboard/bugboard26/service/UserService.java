package ma.bugboard.bugboard26.service;

import ma.bugboard.bugboard26.model.User;
import ma.bugboard.bugboard26.repository.UserRepository;
import ma.bugboard.bugboard26.utils.Validation;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User createUser(User user) {
        // Esegue il controllo su email e password (min 6 car.)
        Validation.isValidEmailAndPassword(user.getEmail(), user.getPassword());

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email già esistente!");
        }
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}