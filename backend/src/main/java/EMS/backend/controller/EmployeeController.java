package EMS.backend.controller;

import EMS.backend.dto.LeaveRequestDTO;
import EMS.backend.entity.Employee;
import EMS.backend.repository.EmployeeRepository;
import EMS.backend.service.LeaveService;
import EMS.backend.service.SalaryService;
import EMS.backend.service.TaskService;
import EMS.backend.service.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/employee")
@PreAuthorize("hasRole('EMPLOYEE')")
public class EmployeeController {

    @Autowired
    private LeaveService leaveService;
 
    @Autowired
    private TaskService taskService;

    @Autowired
    private SalaryService salaryService;

    @Autowired
    private EmployeeRepository employeeRepository;

    @PostMapping("/leave/request")
    public ResponseEntity<?> requestLeave(@RequestBody LeaveRequestDTO dto, Authentication auth) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
            return ResponseEntity.ok(leaveService.createLeaveRequest(dto, userDetails.getId()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/leaves")
    public ResponseEntity<?> getMyLeaves(Authentication auth) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
            // Check if employee record exists
            var employeeOpt = employeeRepository.findByUserId(userDetails.getId());
            if (employeeOpt.isEmpty()) {
                return ResponseEntity.ok(Collections.emptyList());
            }
            return ResponseEntity.ok(leaveService.getEmployeeLeaves(userDetails.getId()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(Collections.emptyList());
        }
    }
 
    @GetMapping("/tasks")
    public ResponseEntity<?> getMyTasks(Authentication auth) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
            // Check if employee record exists
            var employeeOpt = employeeRepository.findByUserId(userDetails.getId());
            if (employeeOpt.isEmpty()) {
                return ResponseEntity.ok(Collections.emptyList());
            }
            return ResponseEntity.ok(taskService.getEmployeeTasks(userDetails.getId()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(Collections.emptyList());
        }
    }
 
    @PostMapping("/task/complete/{id}")
    public ResponseEntity<?> completeTask(@PathVariable Long id, Authentication auth) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
            return ResponseEntity.ok(taskService.completeTask(id, userDetails.getId()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/salary")
    public ResponseEntity<?> getMySalary(Authentication auth) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
            return ResponseEntity.ok(salaryService.getEmployeeSalary(userDetails.getId()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(Collections.emptyList());
        }
    }
}
