package EMS.backend.repository;

import EMS.backend.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByGroupIdOrderByTimestampAsc(Long groupId);
    
    @Query("SELECT m FROM ChatMessage m WHERE m.type = 'COMMUNITY' ORDER BY m.timestamp ASC")
    List<ChatMessage> findCommunityMessages();

    @Query("SELECT m FROM ChatMessage m WHERE " +
           "(m.sender.id = :u1 AND m.recipient.id = :u2) OR " +
           "(m.sender.id = :u2 AND m.recipient.id = :u1) " +
           "ORDER BY m.timestamp ASC")
    List<ChatMessage> findPrivateMessages(@Param("u1") Long user1, @Param("u2") Long user2);
}
