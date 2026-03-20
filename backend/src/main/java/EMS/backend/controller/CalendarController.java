package EMS.backend.controller;

import EMS.backend.service.TaskService;
import EMS.backend.service.LeaveService;
import EMS.backend.service.UserDetailsImpl;
import EMS.backend.repository.WorkTaskRepository;
import EMS.backend.repository.LeaveRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Collections;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/calendar")
public class CalendarController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private LeaveService leaveService;

    @Autowired
    private WorkTaskRepository workTaskRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @GetMapping("/tasks")
    public ResponseEntity<?> getCalendarTasks(Authentication auth) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
            boolean isEmployee = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_EMPLOYEE"));
            boolean isManager = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER"));

            Map<String, Object> response = new HashMap<>();

            if (isEmployee) {
                try {
                    response.put("tasks", taskService.getEmployeeTasks(userDetails.getId()));
                    response.put("leaves", leaveService.getEmployeeLeaves(userDetails.getId()));
                } catch (Exception e) {
                    response.put("tasks", Collections.emptyList());
                    response.put("leaves", Collections.emptyList());
                }
            } else if (isManager) {
                response.put("tasks", taskService.getTasksByManager(userDetails.getId()));
                try {
                    response.put("leaves", leaveService.getAllForManager(userDetails.getId()));
                } catch (Exception e) {
                    response.put("leaves", Collections.emptyList());
                }
            } else {
                // Admin or HR - show all tasks and leaves
                response.put("tasks", workTaskRepository.findAll());
                response.put("leaves", leaveRequestRepository.findAll());
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("tasks", Collections.emptyList());
            fallback.put("leaves", Collections.emptyList());
            return ResponseEntity.ok(fallback);
        }
    }
}
