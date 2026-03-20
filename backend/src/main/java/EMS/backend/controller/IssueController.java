package EMS.backend.controller;

import EMS.backend.dto.IssueDTO;
import EMS.backend.entity.Role;
import EMS.backend.service.IssueService;
import EMS.backend.service.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/issues")
public class IssueController {

    @Autowired
    private IssueService issueService;

    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestBody IssueDTO dto, Authentication auth) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
            return ResponseEntity.ok(issueService.createIssue(dto, userDetails.getId()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/my-reported")
    public ResponseEntity<?> getMyReported(Authentication auth) {
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        return ResponseEntity.ok(issueService.getIssuesReportedBy(userDetails.getId()));
    }

    @GetMapping("/assigned-to-me")
    public ResponseEntity<?> getAssignedToMe(Authentication auth) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
            // Get role from authorities
            String roleStr = userDetails.getAuthorities().stream()
                    .findFirst()
                    .map(a -> a.getAuthority().replace("ROLE_", ""))
                    .orElse("EMPLOYEE");
            
            Role role = Role.valueOf(roleStr);
            return ResponseEntity.ok(issueService.getIssuesByRole(role));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/update-status/{id}")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam String status, @RequestParam(required = false) String resolutionAction, Authentication auth) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
            return ResponseEntity.ok(issueService.updateIssueStatus(id, status, userDetails.getId(), resolutionAction));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
