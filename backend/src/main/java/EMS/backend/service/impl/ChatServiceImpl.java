package EMS.backend.service.impl;

import EMS.backend.entity.ChatGroup;
import EMS.backend.entity.ChatMessage;
import EMS.backend.entity.User;
import EMS.backend.repository.ChatGroupRepository;
import EMS.backend.repository.ChatMessageRepository;
import EMS.backend.repository.UserRepository;
import EMS.backend.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ChatServiceImpl implements ChatService {

    @Autowired
    private ChatMessageRepository messageRepository;

    @Autowired
    private ChatGroupRepository groupRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public ChatMessage sendCommunityMessage(Long senderId, String content) {
        User sender = userRepository.findById(senderId).orElseThrow();
        ChatMessage msg = ChatMessage.builder()
                .sender(sender)
                .content(content)
                .type(ChatMessage.MessageType.COMMUNITY)
                .build();
        return messageRepository.save(msg);
    }

    @Override
    public ChatMessage sendPrivateMessage(Long senderId, Long recipientId, String content) {
        User sender = userRepository.findById(senderId).orElseThrow();
        User recipient = userRepository.findById(recipientId).orElseThrow();
        ChatMessage msg = ChatMessage.builder()
                .sender(sender)
                .recipient(recipient)
                .content(content)
                .type(ChatMessage.MessageType.CHAT)
                .build();
        return messageRepository.save(msg);
    }

    @Override
    public ChatMessage sendGroupMessage(Long senderId, Long groupId, String content) {
        User sender = userRepository.findById(senderId).orElseThrow();
        ChatGroup group = groupRepository.findById(groupId).orElseThrow();
        ChatMessage msg = ChatMessage.builder()
                .sender(sender)
                .group(group)
                .content(content)
                .type(ChatMessage.MessageType.CHAT)
                .build();
        return messageRepository.save(msg);
    }

    @Override
    @Transactional
    public ChatGroup createGroup(String name, Long creatorId, List<Long> memberIds) {
        User creator = userRepository.findById(creatorId).orElseThrow();
        Set<User> members = new HashSet<>(userRepository.findAllById(memberIds));
        members.add(creator);
        
        ChatGroup group = ChatGroup.builder()
                .name(name)
                .creator(creator)
                .members(members)
                .build();
        return groupRepository.save(group);
    }

    @Override
    public List<ChatGroup> getUserGroups(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return groupRepository.findByMembersIn(List.of(user));
    }

    @Override
    public List<ChatMessage> getCommunityHistory() {
        return messageRepository.findCommunityMessages();
    }

    @Override
    public List<ChatMessage> getPrivateHistory(Long u1, Long u2) {
        return messageRepository.findPrivateMessages(u1, u2);
    }

    @Override
    public List<ChatMessage> getGroupHistory(Long groupId) {
        return messageRepository.findByGroupIdOrderByTimestampAsc(groupId);
    }
}
