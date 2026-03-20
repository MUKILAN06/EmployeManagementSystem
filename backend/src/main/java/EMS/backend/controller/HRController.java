package EMS.backend.controller;

import EMS.backend.dto.SalaryRequest;
import EMS.backend.dto.UserCreationRequest;
import EMS.backend.dto.VerificationApprovalRequest;
import EMS.backend.service.EmployeeService;
import EMS.backend.service.LeaveService;
import EMS.backend.service.SalaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/hr")
@PreAuthorize("hasRole('HR')")
public class HRController {

    @Autowired
    private EmployeeService employeeService;
 
    @Autowired
    private LeaveService leaveService;
 
    @Autowired
    private SalaryService salaryService;

    @GetMapping("/verification/pending")
    public ResponseEntity<?> getPending() {
        return ResponseEntity.ok(employeeService.getUnverifiedUsers());
    }
 
    @PostMapping("/verification/approve")
    public ResponseEntity<?> approve(@RequestBody VerificationApprovalRequest request) {
        try {
            return ResponseEntity.ok(employeeService.verifyEmployee(request));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
 
     @GetMapping("/managers")
    public ResponseEntity<?> getManagers() {
        return ResponseEntity.ok(employeeService.getManagers());
    }

    @PostMapping("/manager/create")
    public ResponseEntity<?> createManager(@RequestBody UserCreationRequest request) {
        request.setRole("MANAGER");
        return ResponseEntity.ok(employeeService.createUnverifiedUser(request));
    }
 
    @GetMapping("/leaves/pending")
    public ResponseEntity<?> getPendingLeaves() {
        return ResponseEntity.ok(leaveService.getPendingForHR());
    }
 
    @PostMapping("/leave/approve/{id}")
    public ResponseEntity<?> approveLeave(@PathVariable Long id) {
        return ResponseEntity.ok(leaveService.hrApprove(id));
    }
 
    @PostMapping("/leave/reject/{id}")
    public ResponseEntity<?> rejectLeave(@PathVariable Long id) {
        return ResponseEntity.ok(leaveService.hrReject(id));
    }
 
    @PostMapping("/salary/set")
    public ResponseEntity<?> setSalary(@RequestBody SalaryRequest request) {
        return ResponseEntity.ok(salaryService.setSalary(request));
    }
 
    @GetMapping("/salaries")
    public ResponseEntity<?> getAllSalaries() {
        return ResponseEntity.ok(salaryService.getAllSalaries());
    }

    @GetMapping("/employees")
    public ResponseEntity<?> getAllEmployees() {
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }
}
