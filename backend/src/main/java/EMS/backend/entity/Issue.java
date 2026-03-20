package EMS.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "issues")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Issue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reported_by_id", nullable = false)
    private User reportedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_role_assigned")
    private Role targetRole;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_to_id") // Nullable until someone handles it
    private User assignedTo;

    @Builder.Default
    private LocalDateTime reportedAt = LocalDateTime.now();

    @Builder.Default
    @Column(name = "issue_status")
    private String status = "PENDING";

    private LocalDateTime updatedAt;
    
    @Column(columnDefinition = "TEXT")
    private String resolutionAction;

    private LocalDateTime verifyingAt;

    private LocalDateTime resolvedAt;
}
