package EMS.backend.service.impl;

import EMS.backend.dto.UserCreationRequest;
import EMS.backend.dto.VerificationApprovalRequest;
import EMS.backend.entity.Department;
import EMS.backend.entity.Employee;
import EMS.backend.entity.Role;
import EMS.backend.entity.User;
import EMS.backend.repository.DepartmentRepository;
import EMS.backend.repository.EmployeeRepository;
import EMS.backend.repository.UserRepository;
import EMS.backend.service.EmailService;
import EMS.backend.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Override
    public User createUnverifiedUser(UserCreationRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use!");
        }

        Role role = Role.valueOf(request.getRole().toUpperCase());
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .tempPassword(request.getPassword())
                .role(role)
                .verified(role != Role.EMPLOYEE)
                .build();
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public Employee verifyEmployee(VerificationApprovalRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        User manager = userRepository.findById(request.getManagerId())
                .orElseThrow(() -> new RuntimeException("Manager not found"));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));

        user.setVerified(true);
        
        // Get the original admin-created password
        String adminPassword = user.getTempPassword();
        
        // Clear the temporary password for security
        user.setTempPassword(null);
        userRepository.save(user);

        Employee employee = Employee.builder()
                .user(user)
                .manager(manager)
                .department(department)
                .designation(request.getDesignation())
                .build();

        Employee saved = employeeRepository.save(employee);
        
        // Send Email with personalized message
        emailService.sendCredentialsEmail(user.getEmail(), user.getUsername(), adminPassword);
        
        return saved;
    }

    @Override
    public List<User> getUnverifiedUsers() {
        return userRepository.findAll().stream()
                .filter(u -> !u.isVerified() && u.getRole() != Role.ADMIN)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    @Override
    public List<User> getManagers() {
        return userRepository.findByRole(Role.MANAGER);
    }

    @Override
    public Employee getEmployeeByUserId(Long userId) {
        return employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Employee profile not found"));
    }
}
