package ma.bugboard.bugboard26;

import ma.bugboard.bugboard26.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class Bugboard26Application {

	public static void main(String[] args) {
		SpringApplication.run(Bugboard26Application.class, args);
	}


}
