package EMS.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.util.Map;

@Data
@Builder
public class DashboardDTO {
    private long totalEmployees;
    private long totalUsers;
    private long totalDepartments;
    private long pendingLeaves;
    private long activeTasks;
    private long totalIssues;
    private long resolvedIssues;
    private Map<String, Long> roleDistribution;
    private Map<String, Double> departmentSalaryAvg;
    private java.util.List<?> hrList;
    private java.util.List<?> managerList;
    private java.util.List<?> employeeList;
}
