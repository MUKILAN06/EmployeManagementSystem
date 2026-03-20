package EMS.backend.service;

import EMS.backend.dto.LeaveRequestDTO;
import EMS.backend.entity.LeaveRequest;
import java.util.List;

public interface LeaveService {
    LeaveRequest createLeaveRequest(LeaveRequestDTO dto, Long userId);
    LeaveRequest hrApprove(Long leaveId);
    LeaveRequest hrReject(Long leaveId);
    LeaveRequest managerApprove(Long leaveId);
    LeaveRequest managerReject(Long leaveId);
    List<LeaveRequest> getPendingForHR();
    List<LeaveRequest> getPendingForManager(Long managerUserId);
    List<LeaveRequest> getEmployeeLeaves(Long userId);
    List<LeaveRequest> getAllForManager(Long managerUserId);
}
