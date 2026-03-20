package EMS.backend.controller;

import EMS.backend.dto.WorkTaskDTO;
import EMS.backend.service.LeaveService;
import EMS.backend.service.TaskService;
import EMS.backend.service.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import EMS.backend.entity.User;
import EMS.backend.entity.Employee;
import EMS.backend.repository.EmployeeRepository;
import EMS.backend.repository.UserRepository;
import java.util.List;
import java.util.Collections;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/manager")
@PreAuthorize("hasRole('MANAGER')")
public class ManagerController {

    @Autowired
    private LeaveService leaveService;
 
    @Autowired
    private TaskService taskService;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/employees")
    public ResponseEntity<?> getMyEmployees(Authentication auth) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
            User manager = userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("Manager not found"));

            // Try by department first
            if (manager.getDepartment() != null) {
                List<Employee> byDept = employeeRepository.findByDepartmentId(manager.getDepartment().getId());
                if (!byDept.isEmpty()) {
                    return ResponseEntity.ok(byDept);
                }
            }

            // Try by manager relation
            List<Employee> byManager = employeeRepository.findByManager(manager);
            if (!byManager.isEmpty()) {
                return ResponseEntity.ok(byManager);
            }

            // Fallback: return all employees (so the manager can at least see them)
            return ResponseEntity.ok(employeeRepository.findAll());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    @GetMapping("/leaves/pending")
    public ResponseEntity<?> getPendingLeaves(Authentication auth) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
            return ResponseEntity.ok(leaveService.getPendingForManager(userDetails.getId()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    @PostMapping("/leave/approve/{id}")
    public ResponseEntity<?> approve(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(leaveService.managerApprove(id));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/leave/reject/{id}")
    public ResponseEntity<?> reject(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(leaveService.managerReject(id));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
 
    @PostMapping("/task/assign")
    public ResponseEntity<?> assignTask(@RequestBody WorkTaskDTO dto, Authentication auth) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
            return ResponseEntity.ok(taskService.assignTask(dto, userDetails.getId()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
 
    @GetMapping("/tasks")
    public ResponseEntity<?> getMyAssignedTasks(Authentication auth) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
            return ResponseEntity.ok(taskService.getTasksByManager(userDetails.getId()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(Collections.emptyList());
        }
    }
}
