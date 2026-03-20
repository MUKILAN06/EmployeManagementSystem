package EMS.backend.repository;

import EMS.backend.entity.ChatGroup;
import EMS.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatGroupRepository extends JpaRepository<ChatGroup, Long> {
    List<ChatGroup> findByMembersIn(List<User> userList);
}
