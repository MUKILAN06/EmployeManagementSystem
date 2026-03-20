package EMS.backend.controller;

import EMS.backend.dto.MessageResponse;
import EMS.backend.dto.WorkTaskDTO;
import EMS.backend.entity.Employee;
import EMS.backend.entity.User;
import EMS.backend.entity.WorkTask;
import EMS.backend.repository.EmployeeRepository;
import EMS.backend.repository.UserRepository;
import EMS.backend.repository.WorkTaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    @Autowired
    WorkTaskRepository workTaskRepository;

    @Autowired
    EmployeeRepository employeeRepository;

    @Autowired
    UserRepository userRepository;

    @PostMapping("/assign")
    @PreAuthorize("hasAuthority('MANAGER')")
    public ResponseEntity<?> assignTask(@RequestBody WorkTaskDTO taskDTO, Authentication authentication) {
        User manager = userRepository.findByUsername(authentication.getName()).get();
        Employee employee = employeeRepository.findById(taskDTO.getAssignedToId())
                .orElseThrow(() -> new RuntimeException("Error: Employee not found."));

        WorkTask task = WorkTask.builder()
                .title(taskDTO.getTitle())
                .description(taskDTO.getDescription())
                .assignedTo(employee)
                .assignedBy(manager)
                .startDate(taskDTO.getStartDate() != null && !taskDTO.getStartDate().isBlank() ? java.time.LocalDate.parse(taskDTO.getStartDate()).atStartOfDay() : LocalDateTime.now())
                .endDate(taskDTO.getEndDate() != null && !taskDTO.getEndDate().isBlank() ? java.time.LocalDate.parse(taskDTO.getEndDate()).atStartOfDay().plusHours(23).plusMinutes(59) : LocalDateTime.now().plusDays(1))
                .completed(false)
                .build();

        workTaskRepository.save(task);
        return ResponseEntity.ok(new MessageResponse("Task assigned successfully!"));
    }

    @GetMapping("/my-tasks")
    @PreAuthorize("hasAuthority('EMPLOYEE')")
    public ResponseEntity<?> getMyTasks(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).get();
        Employee employee = employeeRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Error: Employee record not found."));
        return ResponseEntity.ok(workTaskRepository.findByAssignedTo(employee));
    }

    @PostMapping("/complete/{id}")
    @PreAuthorize("hasAuthority('EMPLOYEE')")
    public ResponseEntity<?> completeTask(@PathVariable Long id) {
        WorkTask task = workTaskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Task not found."));
        task.setCompleted(true);
        workTaskRepository.save(task);
        return ResponseEntity.ok(new MessageResponse("Task marked as completed."));
    }
}
