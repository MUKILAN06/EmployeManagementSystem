package EMS.backend.service.impl;

import EMS.backend.dto.IssueDTO;
import EMS.backend.entity.Issue;
import EMS.backend.entity.Role;
import EMS.backend.entity.User;
import EMS.backend.repository.IssueRepository;
import EMS.backend.repository.UserRepository;
import EMS.backend.service.IssueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class IssueServiceImpl implements IssueService {

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public Issue createIssue(IssueDTO dto, Long reporterId) {
        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new RuntimeException("Reporter not found"));

        Issue issue = Issue.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .reportedBy(reporter)
                .targetRole(Role.valueOf(dto.getTargetRole() != null ? dto.getTargetRole().toUpperCase() : "HR"))
                .reportedAt(LocalDateTime.now())
                .status("PENDING")
                .build();
        return issueRepository.save(issue);
    }

    @Override
    public List<Issue> getIssuesByRole(Role role) {
        return issueRepository.findByTargetRole(role);
    }

    @Override
    public List<Issue> getIssuesReportedBy(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return issueRepository.findByReportedBy(user);
    }

    @Override
    public Issue updateIssueStatus(Long issueId, String status, Long userId, String resolutionAction) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user has the target role
        if (user.getRole() != issue.getTargetRole()) {
            throw new RuntimeException("Unauthorized: You do not have the required role to update this issue");
        }

        issue.setStatus(status);
        issue.setAssignedTo(user); // The person who updates it becomes the assignee
        issue.setUpdatedAt(LocalDateTime.now());
        
        if ("VERIFYING".equalsIgnoreCase(status) && issue.getVerifyingAt() == null) {
            issue.setVerifyingAt(LocalDateTime.now());
        } else if ("COMPLETED".equalsIgnoreCase(status)) {
            issue.setResolvedAt(LocalDateTime.now());
            if (resolutionAction != null && !resolutionAction.isBlank()) {
                issue.setResolutionAction(resolutionAction);
            }
        }
        
        return issueRepository.save(issue);
    }
}
