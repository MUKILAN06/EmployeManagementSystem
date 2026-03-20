package EMS.backend.repository;

import EMS.backend.entity.LeaveRequest;
import EMS.backend.entity.Employee;
import EMS.backend.entity.LeaveStatus;
import EMS.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByEmployee(Employee employee);
    List<LeaveRequest> findByStatus(LeaveStatus status);
    List<LeaveRequest> findByEmployeeManager(User manager);
}
