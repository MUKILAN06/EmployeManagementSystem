package EMS.backend.service.impl;

import EMS.backend.dto.LeaveRequestDTO;
import EMS.backend.entity.Employee;
import EMS.backend.entity.LeaveRequest;
import EMS.backend.entity.LeaveStatus;
import EMS.backend.repository.EmployeeRepository;
import EMS.backend.repository.LeaveRequestRepository;
import EMS.backend.service.LeaveService;
import EMS.backend.entity.User;
import EMS.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.FileWriter;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeaveServiceImpl implements LeaveService {

    @Autowired
    private LeaveRequestRepository leaveRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private UserRepository userRepository;

    private static void dbg(String hypothesisId, String location, String message, String dataJson) {
        try (FileWriter fw = new FileWriter("D:/study/EMS/debug-2f3b79.log", true)) {
            long ts = System.currentTimeMillis();
            fw.write("{\"sessionId\":\"2f3b79\",\"runId\":\"pre-fix\",\"hypothesisId\":\"" + hypothesisId
                    + "\",\"timestamp\":" + ts
                    + ",\"location\":\"" + location
                    + "\",\"message\":\"" + message
                    + "\",\"data\":" + dataJson + "}\n");
        } catch (Exception ignored) {
        }
    }

    private static boolean overlaps(LocalDate aStart, LocalDate aEnd, LocalDate bStart, LocalDate bEnd) {
        // inclusive overlap: [aStart, aEnd] intersects [bStart, bEnd]
        return !(aEnd.isBefore(bStart) || bEnd.isBefore(aStart));
    }

    @Override
    public LeaveRequest createLeaveRequest(LeaveRequestDTO dto, Long userId) {
        dbg("H1", "LeaveServiceImpl:createLeaveRequest", "Enter createLeaveRequest",
                "{\"userId\":" + userId
                        + ",\"startDate\":\"" + dto.getStartDate()
                        + "\",\"endDate\":\"" + dto.getEndDate()
                        + "\",\"reasonLen\":" + (dto.getReason() == null ? 0 : dto.getReason().length()) + "}");
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Employee profile not found"));

        List<LeaveRequest> existing = leaveRepository.findByEmployee(employee);
        int overlappingActive = 0;
        LocalDate s = dto.getStartDate();
        LocalDate e = dto.getEndDate();
        if (s != null && e != null) {
            for (LeaveRequest lr : existing) {
                if (lr.getStatus() == LeaveStatus.REJECTED) continue;
                if (lr.getStartDate() == null || lr.getEndDate() == null) continue;
                if (overlaps(s, e, lr.getStartDate(), lr.getEndDate())) overlappingActive++;
            }
        }
        dbg("H2", "LeaveServiceImpl:createLeaveRequest", "Computed overlap stats",
                "{\"existingCount\":" + existing.size() + ",\"overlappingNonRejected\":" + overlappingActive + "}");
        
        LeaveRequest leave = LeaveRequest.builder()
                .employee(employee)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .reason(dto.getReason())
                .status(LeaveStatus.PENDING_HR)
                .build();
        LeaveRequest saved = leaveRepository.save(leave);
        dbg("H4", "LeaveServiceImpl:createLeaveRequest", "Saved leave request",
                "{\"leaveId\":" + saved.getId() + ",\"status\":\"" + saved.getStatus() + "\"}");
        return saved;
    }

    @Override
    public LeaveRequest hrApprove(Long leaveId) {
        LeaveRequest leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        leave.setStatus(LeaveStatus.PENDING_MANAGER);
        return leaveRepository.save(leave);
    }

    @Override
    public LeaveRequest hrReject(Long leaveId) {
        LeaveRequest leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        leave.setStatus(LeaveStatus.REJECTED);
        return leaveRepository.save(leave);
    }

    @Override
    public LeaveRequest managerApprove(Long leaveId) {
        LeaveRequest leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        leave.setStatus(LeaveStatus.APPROVED);
        return leaveRepository.save(leave);
    }

    @Override
    public LeaveRequest managerReject(Long leaveId) {
        LeaveRequest leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        leave.setStatus(LeaveStatus.REJECTED);
        return leaveRepository.save(leave);
    }

    @Override
    public List<LeaveRequest> getPendingForHR() {
        return leaveRepository.findByStatus(LeaveStatus.PENDING_HR);
    }

    @Override
    public List<LeaveRequest> getPendingForManager(Long managerUserId) {
        return leaveRepository.findByStatus(LeaveStatus.PENDING_MANAGER).stream()
                .filter(l -> l.getEmployee().getManager().getId().equals(managerUserId))
                .collect(Collectors.toList());
    }

    @Override
    public List<LeaveRequest> getEmployeeLeaves(Long userId) {
        dbg("H3", "LeaveServiceImpl:getEmployeeLeaves", "Enter getEmployeeLeaves", "{\"userId\":" + userId + "}");
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Employee profile not found"));
        List<LeaveRequest> leaves = leaveRepository.findByEmployee(employee);
        dbg("H3", "LeaveServiceImpl:getEmployeeLeaves", "Loaded employee leaves", "{\"count\":" + leaves.size() + "}");
        return leaves;
    }

    @Override
    public List<LeaveRequest> getAllForManager(Long managerUserId) {
        User manager = userRepository.findById(managerUserId)
                .orElseThrow(() -> new RuntimeException("Manager user not found"));
        return leaveRepository.findByEmployeeManager(manager);
    }
}
