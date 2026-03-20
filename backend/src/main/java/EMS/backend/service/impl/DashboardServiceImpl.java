package EMS.backend.service.impl;

import EMS.backend.dto.DashboardDTO;
import EMS.backend.entity.LeaveStatus;
import EMS.backend.entity.Role;
import EMS.backend.repository.*;
import EMS.backend.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private WorkTaskRepository workTaskRepository;

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SalaryRepository salaryRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Override
    public DashboardDTO getAdminStats() {
        return buildStats();
    }

    @Override
    public DashboardDTO getHRStats() {
        return buildStats();
    }

    @Override
    public DashboardDTO getManagerStats(Long userId) {
        // Manager stats could be filtered by its managed employees, 
        // but for now providing overall as requested by "analytics dashboard: show in admin,HR,manager"
        return buildStats();
    }

    private DashboardDTO buildStats() {
        long totalEmployees = employeeRepository.count();
        long totalUsers = userRepository.count();
        long totalDepartments = departmentRepository.count();
        long pendingLeaves = leaveRequestRepository.findByStatus(LeaveStatus.PENDING_HR).size() +
                             leaveRequestRepository.findByStatus(LeaveStatus.PENDING_MANAGER).size();
        long activeTasks = workTaskRepository.findAll().stream().filter(t -> !t.isCompleted()).count();
        long totalIssues = issueRepository.count();
        long resolvedIssues = issueRepository.findAll().stream().filter(i -> "COMPLETED".equals(i.getStatus())).count();

        Map<String, Long> roles = userRepository.findAll().stream()
                .collect(Collectors.groupingBy(u -> u.getRole().name(), Collectors.counting()));

        java.util.List<Map<String, Object>> hrList = userRepository.findByRole(Role.HR).stream()
                .map(u -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("username", u.getUsername());
                    m.put("email", u.getEmail());
                    m.put("createdAt", u.getCreatedAt());
                    return m;
                }).collect(Collectors.toList());

        java.util.List<Map<String, Object>> managerList = userRepository.findByRole(Role.MANAGER).stream()
                .map(u -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("username", u.getUsername());
                    m.put("email", u.getEmail());
                    m.put("createdAt", u.getCreatedAt());
                    return m;
                }).collect(Collectors.toList());

        java.util.List<Map<String, Object>> employeeList = employeeRepository.findAll().stream()
                .map(e -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("username", e.getUser().getUsername());
                    m.put("email", e.getUser().getEmail());
                    m.put("createdAt", e.getUser().getCreatedAt());
                    m.put("manager", e.getManager() != null ? e.getManager().getUsername() : "N/A");
                    m.put("department", e.getDepartment() != null ? e.getDepartment().getName() : "N/A");
                    return m;
                }).collect(Collectors.toList());

        return DashboardDTO.builder()
                .totalEmployees(totalEmployees)
                .totalUsers(totalUsers)
                .totalDepartments(totalDepartments)
                .pendingLeaves(pendingLeaves)
                .activeTasks(activeTasks)
                .totalIssues(totalIssues)
                .resolvedIssues(resolvedIssues)
                .roleDistribution(roles)
                .hrList(hrList)
                .managerList(managerList)
                .employeeList(employeeList)
                .build();
    }
}
