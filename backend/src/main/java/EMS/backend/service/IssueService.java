package EMS.backend.service;

import EMS.backend.dto.IssueDTO;
import EMS.backend.entity.Issue;
import EMS.backend.entity.Role;
import java.util.List;

public interface IssueService {
    Issue createIssue(IssueDTO dto, Long reporterId);
    List<Issue> getIssuesByRole(Role role);
    List<Issue> getIssuesReportedBy(Long userId);
    Issue updateIssueStatus(Long issueId, String status, Long userId, String resolutionAction);
}
