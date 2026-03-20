package EMS.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sender_id")
    private User sender;

    @ManyToOne
    @JoinColumn(name = "recipient_id")
    private User recipient; // For one-to-one

    @ManyToOne
    @JoinColumn(name = "group_id")
    private ChatGroup group; // For group chat

    @Column(nullable = false, length = 1000)
    private String content;

    @Enumerated(EnumType.STRING)
    private MessageType type;

    @CreationTimestamp
    private LocalDateTime timestamp;

    public enum MessageType {
        CHAT, JOIN, LEAVE, COMMUNITY
    }
}
