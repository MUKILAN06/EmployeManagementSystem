package EMS.backend.service.impl;

import EMS.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Override
    public void sendCredentialsEmail(String to, String username, String password) {
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(to);
        mailMessage.setSubject("Welcome to the Team! - Your Employee Account is Active");
        mailMessage.setText("Hi " + username + ",\n\n" +
                "We're excited to have you with us.\n\n" +
                "Your account has been approved by HR, and you can now log in to the Employee Management System using the credentials created by your Admin:\n\n" +
                "👤 Username: " + username + "\n" +
                "🔑 Password: " + password + "\n\n" +
                "If you have any questions, feel free to reach out to the HR department.\n\n" +
                "Best regards,\n" +
                "The HR Team");
        
        mailSender.send(mailMessage);
    }

    @Override
    public void sendSalaryUpdateEmail(String to, String username, double amount, String notes) {
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(to);
        mailMessage.setSubject("Salary Update - EMS Dashboard");
        mailMessage.setText("Hi " + username + ",\n\n" +
                "Your salary record has been updated in the Employee Management System.\n\n" +
                "👤 Username: " + username + "\n" +
                "💰 New Amount: $" + amount + "\n" +
                "📝 Notes: " + (notes != null ? notes : "N/A") + "\n\n" +
                "You can view more details by logging into your dashboard.\n\n" +
                "Best regards,\n" +
                "HR Department");
        
        mailSender.send(mailMessage);
    }
}
