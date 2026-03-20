package EMS.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IssueDTO {
    private String title;
    private String description;
    private String targetRole; // ADMIN, HR, or MANAGER
}
