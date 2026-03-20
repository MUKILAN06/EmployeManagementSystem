package EMS.backend.config;

import EMS.backend.entity.Role;
import EMS.backend.entity.User;
import EMS.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "admin@ems.com";
        String adminPass = "admin123";
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = User.builder()
                    .username(adminEmail)
                    .email(adminEmail)
                    .password(encoder.encode(adminPass))
                    .role(Role.ADMIN)
                    .verified(true)
                    .build();
            userRepository.save(admin);
            System.out.println("Default Admin account created!");
            System.out.println("Login: " + adminEmail);
            System.out.println("Pass: " + adminPass);
        }
    }
}
