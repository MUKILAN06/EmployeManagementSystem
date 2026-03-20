package EMS.backend.service;

public interface EmailService {
    void sendCredentialsEmail(String to, String username, String password);
    void sendSalaryUpdateEmail(String to, String username, double amount, String notes);
}
