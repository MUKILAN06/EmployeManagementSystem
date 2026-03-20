package EMS.backend.service;

import EMS.backend.entity.ChatGroup;
import EMS.backend.entity.ChatMessage;
import EMS.backend.entity.User;
import java.util.List;

public interface ChatService {
    ChatMessage sendCommunityMessage(Long senderId, String content);
    ChatMessage sendPrivateMessage(Long senderId, Long recipientId, String content);
    ChatMessage sendGroupMessage(Long senderId, Long groupId, String content);
    
    ChatGroup createGroup(String name, Long creatorId, List<Long> memberIds);
    List<ChatGroup> getUserGroups(Long userId);
    
    List<ChatMessage> getCommunityHistory();
    List<ChatMessage> getPrivateHistory(Long u1, Long u2);
    List<ChatMessage> getGroupHistory(Long groupId);
}
