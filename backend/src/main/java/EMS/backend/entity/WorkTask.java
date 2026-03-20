package EMS.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "work_tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class WorkTask {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_to_id", nullable = false)
    private Employee assignedTo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_by_id", nullable = false)
    private User assignedBy;

    private LocalDateTime startDate;
    private LocalDateTime endDate;
    @Builder.Default
    private boolean completed = false;
}
