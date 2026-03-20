package EMS.backend.service.impl;

import EMS.backend.dto.WorkTaskDTO;
import EMS.backend.entity.Employee;
import EMS.backend.entity.User;
import EMS.backend.entity.WorkTask;
import EMS.backend.repository.EmployeeRepository;
import EMS.backend.repository.UserRepository;
import EMS.backend.repository.WorkTaskRepository;
import EMS.backend.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaskServiceImpl implements TaskService {

    @Autowired
    private WorkTaskRepository taskRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public WorkTask assignTask(WorkTaskDTO dto, Long managerUserId) {
        User manager = userRepository.findById(managerUserId)
                .orElseThrow(() -> new RuntimeException("Manager not found"));

        Employee employee = employeeRepository.findById(dto.getAssignedToId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        WorkTask task = WorkTask.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .assignedTo(employee)
                .assignedBy(manager)
                .startDate(dto.getStartDate() != null && !dto.getStartDate().isBlank() ? java.time.LocalDate.parse(dto.getStartDate()).atStartOfDay() : LocalDateTime.now())
                .endDate(dto.getEndDate() != null && !dto.getEndDate().isBlank() ? java.time.LocalDate.parse(dto.getEndDate()).atStartOfDay().plusHours(23).plusMinutes(59) : LocalDateTime.now().plusDays(1))
                .completed(false)
                .build();
        return taskRepository.save(task);
    }

    @Override
    public List<WorkTask> getEmployeeTasks(Long userId) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        return taskRepository.findByAssignedTo(employee);
    }

    @Override
    public List<WorkTask> getTasksByManager(Long managerUserId) {
        User manager = userRepository.findById(managerUserId)
                .orElseThrow(() -> new RuntimeException("Manager not found"));
        return taskRepository.findAll().stream()
                .filter(t -> t.getAssignedBy().getId().equals(managerUserId))
                .toList();
    }

    @Override
    public WorkTask completeTask(Long taskId, Long userId) {
        WorkTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        if (!task.getAssignedTo().getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to complete this task");
        }

        task.setCompleted(true);
        return taskRepository.save(task);
    }
}
