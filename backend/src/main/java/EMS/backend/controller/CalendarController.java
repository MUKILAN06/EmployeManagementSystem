package EMS.backend.controller;

import EMS.backend.service.TaskService;
import EMS.backend.service.LeaveService;
import EMS.backend.service.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/calendar")
public class CalendarController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private LeaveService leaveService;

    @GetMapping("/tasks")
    public ResponseEntity<?> getCalendarTasks(Authentication auth) {
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        boolean isEmployee = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_EMPLOYEE"));
        boolean isManager = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER"));

        Map<String, Object> response = new HashMap<>();

        if (isEmployee) {
            response.put("tasks", taskService.getEmployeeTasks(userDetails.getId()));
            response.put("leaves", leaveService.getEmployeeLeaves(userDetails.getId()));
        } else if (isManager) {
            response.put("tasks", taskService.getTasksByManager(userDetails.getId()));
            response.put("leaves", leaveService.getAllForManager(userDetails.getId()));
        } else {
            response.put("tasks", taskService.getEmployeeTasks(userDetails.getId()));
            response.put("leaves", leaveService.getEmployeeLeaves(userDetails.getId()));
        }
        
        return ResponseEntity.ok(response);
    }
}
