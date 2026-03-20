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

    private static boolean overlaps(LocalDate aStart, LocalDate aEnd, LocalDate bStart, LocalDate bEnd) {
        return !(aEnd.isBefore(bStart) || bEnd.isBefore(aStart));
    }

    @Override
    public LeaveRequest createLeaveRequest(LeaveRequestDTO dto, Long userId) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Employee profile not found"));

        LeaveRequest leave = LeaveRequest.builder()
                .employee(employee)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .reason(dto.getReason())
                .status(LeaveStatus.PENDING_HR)
                .build();
        return leaveRepository.save(leave);
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
                .filter(l -> l.getEmployee().getManager() != null && l.getEmployee().getManager().getId().equals(managerUserId))
                .collect(Collectors.toList());
    }

    @Override
    public List<LeaveRequest> getEmployeeLeaves(Long userId) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Employee profile not found"));
        return leaveRepository.findByEmployee(employee);
    }

    @Override
    public List<LeaveRequest> getAllForManager(Long managerUserId) {
        User manager = userRepository.findById(managerUserId)
                .orElseThrow(() -> new RuntimeException("Manager user not found"));
        return leaveRepository.findByEmployeeManager(manager);
    }
}
